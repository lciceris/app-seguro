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

test.describe("policy-endorsements-isolation", () => {
  let brokerageId: string;
  let sellerAId: string;
  let sellerBId: string;
  let analystId: string;
  let clientAId: string;
  let insurerId: string;
  let quotationId: string;
  let policyId: string;
  let endorsementId: string;

  const sellerAEmail = `e2e-peisolation-sellerA-${Date.now()}@appseguro.dev`;
  const sellerBEmail = `e2e-peisolation-sellerB-${Date.now()}@appseguro.dev`;
  const analystEmail = `e2e-peisolation-analyst-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();
    const { data: brokerage } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E PEIsolation" })
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

    sellerAId = await createTestUser(sellerAEmail, "seller", "Seller A PEIsolation");
    sellerBId = await createTestUser(sellerBEmail, "seller", "Seller B PEIsolation");
    analystId = await createTestUser(analystEmail, "analyst", "Analyst PEIsolation");

    const { data: clientA } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E PEIsolation Seller A" })
      .select()
      .single();
    clientAId = clientA!.id;
    await admin
      .from("client_sellers")
      .insert({ client_id: clientAId, seller_id: sellerAId, is_primary: true });

    const { data: insurer } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E PEIsolation" })
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
        policy_number: "AP-PEISOLATION-0001",
        status: "active",
      })
      .select()
      .single();
    policyId = policy!.id;

    const { data: endorsement } = await admin
      .from("policy_endorsements")
      .insert({
        brokerage_id: brokerageId,
        policy_id: policyId,
        endorsement_type: "administrative_correction",
        description: "Correção E2E PEIsolation",
        seller_id: sellerAId,
      })
      .select()
      .single();
    endorsementId = endorsement!.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    if (endorsementId) await admin.from("policy_endorsements").delete().eq("id", endorsementId);
    await admin.from("policies").delete().eq("id", policyId);
    await admin.from("quotations").delete().eq("id", quotationId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("client_sellers").delete().eq("client_id", clientAId);
    await admin.from("clients").delete().eq("id", clientAId);
    await admin.auth.admin.deleteUser(sellerAId);
    await admin.auth.admin.deleteUser(sellerBId);
    await admin.auth.admin.deleteUser(analystId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller sem vínculo com o cliente não vê o endosso, nem via listagem nem via leitura direta", async ({
    page,
  }) => {
    await login(page, sellerBEmail);
    await page.goto(`/policies/${policyId}`);
    await expect(page.getByText("Endossos")).not.toBeVisible();

    const result = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { data } = await mod.supabase
        .from("policy_endorsements")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      return data;
    }, endorsementId);
    expect(result).toBeNull();
  });

  test("analyst não abre endosso nem efetiva; seller dono não efetiva", async ({ page }) => {
    await login(page, analystEmail);
    await page.goto(`/policies/${policyId}`);
    await expect(page.getByRole("link", { name: "Abrir endosso" })).not.toBeVisible();

    // avança o endosso até client_accepted via admin (o fluxo completo até
    // aqui já foi validado em detalhe no teste de inclusão de veículo — aqui
    // o foco é só quem pode efetivar a partir desse ponto).
    const admin = adminClient();
    await admin.from("policy_endorsements").update({ status: "presented" }).eq("id", endorsementId);
    await admin
      .from("policy_endorsements")
      .update({ status: "client_accepted" })
      .eq("id", endorsementId);

    await page.goto(`/policies/${policyId}/endorsements/${endorsementId}`);
    await expect(page.getByText("Cliente aceitou")).toBeVisible();
    await expect(page.getByRole("button", { name: "Efetivar" })).not.toBeVisible();

    const analystUpdateResult = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { error } = await mod.supabase
        .from("policy_endorsements")
        .update({ status: "effected" })
        .eq("id", id);
      return error?.message ?? null;
    }, endorsementId);
    expect(analystUpdateResult).toBeTruthy();

    await page.evaluate(async () => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      await mod.supabase.auth.signOut();
    });
    await login(page, sellerAEmail);
    await page.goto(`/policies/${policyId}/endorsements/${endorsementId}`);
    await expect(page.getByRole("button", { name: "Efetivar" })).not.toBeVisible();

    const sellerUpdateResult = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { error } = await mod.supabase
        .from("policy_endorsements")
        .update({ status: "effected" })
        .eq("id", id);
      return error?.message ?? null;
    }, endorsementId);
    expect(sellerUpdateResult).toBeTruthy();

    const { data: endorsementAfter } = await admin
      .from("policy_endorsements")
      .select("status")
      .eq("id", endorsementId)
      .single();
    expect(endorsementAfter!.status).toBe("client_accepted");
  });
});
