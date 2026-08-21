import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const password = "TesteSenha123!";

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

async function signOut(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
    const mod = await import("/src/shared/lib/supabase/client.ts");
    await mod.supabase.auth.signOut();
  });
  await page.goto("/login");
}

test.describe("policy-endorsements-cancellation", () => {
  let brokerageId: string;
  let sellerId: string;
  let supervisorId: string;
  let clientId: string;
  let insurerId: string;
  let quotationId: string;
  let policyId: string;
  let endorsementId: string;

  const sellerEmail = `e2e-pecancel-seller-${Date.now()}@appseguro.dev`;
  const supervisorEmail = `e2e-pecancel-supervisor-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();
    const { data: brokerage } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E PECancel" })
      .select()
      .single();
    brokerageId = brokerage!.id;

    async function createTestUser(email: string, role: string, fullName: string) {
      const { data: auth } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      await admin.from("users").insert({
        id: auth!.user!.id,
        brokerage_id: brokerageId,
        role,
        status: "active",
        full_name: fullName,
        email,
      });
      return auth!.user!.id;
    }

    sellerId = await createTestUser(sellerEmail, "seller", "Seller PECancel");
    // supervisor cobre tanto a negociação (mesmo grupo de analyst) quanto a
    // efetivação final — já validado em detalhe no fluxo de inclusão de
    // veículo; aqui o foco é o efeito do cancelamento, não repetir a máquina
    // de estados inteira com um usuário por papel.
    supervisorId = await createTestUser(supervisorEmail, "supervisor", "Supervisor PECancel");

    const { data: client } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E PECancel" })
      .select()
      .single();
    clientId = client!.id;
    await admin
      .from("client_sellers")
      .insert({ client_id: clientId, seller_id: sellerId, is_primary: true });

    const { data: insurer } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E PECancel" })
      .select()
      .single();
    insurerId = insurer!.id;

    const { data: quotation } = await admin
      .from("quotations")
      .insert({ brokerage_id: brokerageId, client_id: clientId, seller_id: sellerId, number: "" })
      .select()
      .single();
    quotationId = quotation!.id;

    const { data: policy } = await admin
      .from("policies")
      .insert({
        brokerage_id: brokerageId,
        client_id: clientId,
        insurer_id: insurerId,
        quotation_id: quotationId,
        policy_number: "AP-PECANCEL-0001",
        status: "active",
      })
      .select()
      .single();
    policyId = policy!.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    if (endorsementId) await admin.from("policy_endorsements").delete().eq("id", endorsementId);
    await admin.from("policies").delete().eq("id", policyId);
    await admin.from("quotations").delete().eq("id", quotationId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("client_sellers").delete().eq("client_id", clientId);
    await admin.from("clients").delete().eq("id", clientId);
    await admin.auth.admin.deleteUser(sellerId);
    await admin.auth.admin.deleteUser(supervisorId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("cancelamento efetivado marca a versão vigente como cancelled sem criar nova linha, e bloqueia novo endosso", async ({
    page,
  }) => {
    await login(page, sellerEmail);
    await page.goto(`/policies/${policyId}/endorsements/add`);
    await page.getByLabel("Tipo", { exact: true }).click();
    await page.getByRole("option", { name: "Cancelamento" }).click();
    await page.getByLabel("Descrição").fill("Cliente rescindiu o contrato");
    await page.getByRole("button", { name: "Abrir endosso" }).click();
    await expect(page.getByText("Endosso aberto com sucesso")).toBeVisible();
    await page.waitForURL(new RegExp(`/policies/${policyId}$`));

    await page.locator("li", { hasText: "Cancelamento" }).getByRole("link").click();
    await page.waitForURL(new RegExp(`/policies/${policyId}/endorsements/[^/]+$`));
    endorsementId = page.url().split("/endorsements/")[1];

    await signOut(page);

    await login(page, supervisorEmail);
    await page.goto(`/policies/${policyId}/endorsements/${endorsementId}`);
    await page.getByRole("button", { name: "Registrar retorno da seguradora" }).click();
    await page.getByRole("button", { name: "Registrar e apresentar ao cliente" }).click();
    await expect(page.getByText("Retorno da seguradora registrado com sucesso")).toBeVisible();
    await page.getByRole("button", { name: "Cliente aceitou" }).click();
    await expect(page.getByText("Status atualizado com sucesso")).toBeVisible();
    await page.getByRole("button", { name: "Efetivar" }).click();
    await expect(page.getByText("Status atualizado com sucesso")).toBeVisible();
    await expect(page.getByText("Efetivado", { exact: true })).toBeVisible();

    const admin = adminClient();
    const { data: endorsementAfter } = await admin
      .from("policy_endorsements")
      .select("status, new_policy_id")
      .eq("id", endorsementId)
      .single();
    expect(endorsementAfter!.status).toBe("effected");
    expect(endorsementAfter!.new_policy_id).toBeNull();

    const { data: policyAfter } = await admin
      .from("policies")
      .select("status")
      .eq("id", policyId)
      .single();
    expect(policyAfter!.status).toBe("cancelled");

    const { count } = await admin
      .from("policies")
      .select("id", { count: "exact", head: true })
      .eq("brokerage_id", brokerageId);
    expect(count).toBe(1); // nenhuma nova versão criada

    // UI: apólice cancelada não mostra mais "Abrir endosso"
    await page.goto(`/policies/${policyId}`);
    await expect(page.getByRole("link", { name: "Abrir endosso" })).not.toBeVisible();

    // banco: uma tentativa direta de abrir outro endosso é negada pelo trigger
    const { error: secondEndorsementError } = await admin.from("policy_endorsements").insert({
      brokerage_id: brokerageId,
      policy_id: policyId,
      endorsement_type: "administrative_correction",
      description: "Tentativa após cancelamento",
    });
    expect(secondEndorsementError?.message).toContain(
      "Só é possível abrir endosso na versão vigente da apólice",
    );
  });
});
