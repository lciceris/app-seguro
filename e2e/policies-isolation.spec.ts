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

test.describe("policies-isolation", () => {
  let brokerageId: string;
  let sellerAId: string;
  let sellerBId: string;
  let clientAId: string;
  let insurerId: string;
  let quotationId: string;
  let policyId: string;

  const sellerAEmail = `e2e-pisolation-sellerA-${Date.now()}@appseguro.dev`;
  const sellerBEmail = `e2e-pisolation-sellerB-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();
    const { data: brokerage } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E PIsolation" })
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

    sellerAId = await createTestUser(sellerAEmail, "seller", "Seller A PIsolation");
    sellerBId = await createTestUser(sellerBEmail, "seller", "Seller B PIsolation");

    const { data: clientA } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E PIsolation Seller A" })
      .select()
      .single();
    clientAId = clientA!.id;
    await admin
      .from("client_sellers")
      .insert({ client_id: clientAId, seller_id: sellerAId, is_primary: true });

    const { data: insurer } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E PIsolation" })
      .select()
      .single();
    insurerId = insurer!.id;

    const { data: quotation } = await admin
      .from("quotations")
      .insert({ brokerage_id: brokerageId, client_id: clientAId, seller_id: sellerAId, number: "" })
      .select()
      .single();
    quotationId = quotation!.id;

    const { data: policy } = await admin
      .from("policies")
      .insert({
        brokerage_id: brokerageId,
        client_id: clientAId,
        insurer_id: insurerId,
        quotation_id: quotationId,
        policy_number: "AP-PISOLATION-0001",
      })
      .select()
      .single();
    policyId = policy!.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    if (policyId) await admin.from("policies").delete().eq("id", policyId);
    if (quotationId) await admin.from("quotations").delete().eq("id", quotationId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("client_sellers").delete().eq("client_id", clientAId);
    await admin.from("clients").delete().eq("id", clientAId);
    await admin.auth.admin.deleteUser(sellerAId);
    await admin.auth.admin.deleteUser(sellerBId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller sem vínculo com o cliente não vê a apólice, nem via listagem nem via leitura direta", async ({
    page,
  }) => {
    await login(page, sellerBEmail);
    await page.goto("/policies");
    await expect(page.getByText("Nenhuma apólice emitida ainda.")).toBeVisible();

    const result = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { data } = await mod.supabase.from("policies").select("id").eq("id", id).maybeSingle();
      return data;
    }, policyId);
    expect(result).toBeNull();
  });

  test("seller dono do cliente vê a apólice mas não edita nem anexa documento", async ({
    page,
  }) => {
    await login(page, sellerAEmail);
    await page.goto("/policies");
    await expect(page.getByText("AP-PISOLATION-0001")).toBeVisible();

    const row = page.locator("tr", { hasText: "Cliente E2E PIsolation Seller A" });
    await expect(row.getByRole("link")).toHaveCount(1); // só "Ver", sem "Editar"

    await row.getByRole("link").first().click();
    await page.waitForURL(new RegExp(`/policies/${policyId}$`));
    await expect(page.getByRole("button", { name: "Anexar arquivo" })).not.toBeVisible();

    // RLS: edição direta via banco também é negada (0 linhas afetadas, sem erro)
    const updateResult = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { data } = await mod.supabase
        .from("policies")
        .update({ policy_number: "TENTATIVA-SELLER" })
        .eq("id", id)
        .select();
      return data;
    }, policyId);
    expect(updateResult).toEqual([]);

    // acessar a rota de edição direto pela URL também é bloqueado
    await page.goto(`/policies/${policyId}/edit`);
    await expect(page.getByText("Editar apólice")).not.toBeVisible();
  });
});
