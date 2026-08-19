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

test.describe("quotations-isolation", () => {
  let brokerageId: string;
  let sellerAId: string;
  let sellerBId: string;
  let clientAId: string;
  let insurerId: string;
  let insurerId2: string;
  let quotationId: string;
  const sellerAEmail = `e2e-qiso-sellerA-${Date.now()}@appseguro.dev`;
  const sellerBEmail = `e2e-qiso-sellerB-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();

    const { data: brokerage, error: brokerageError } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E QIsolation" })
      .select()
      .single();
    if (brokerageError) throw brokerageError;
    brokerageId = brokerage.id;

    async function createTestUser(email: string, role: string, fullName: string) {
      const { data: auth, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (authError) throw authError;
      const { error: userError } = await admin.from("users").insert({
        id: auth.user.id,
        brokerage_id: brokerageId,
        role,
        status: "active",
        full_name: fullName,
        email,
      });
      if (userError) throw userError;
      return auth.user.id;
    }

    sellerAId = await createTestUser(sellerAEmail, "seller", "Seller A E2E QIsolation");
    sellerBId = await createTestUser(sellerBEmail, "seller", "Seller B E2E QIsolation");

    const { data: clientA, error: clientAError } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E QIsolation Seller A" })
      .select()
      .single();
    if (clientAError) throw clientAError;
    clientAId = clientA.id;
    const { error: linkError } = await admin
      .from("client_sellers")
      .insert({ client_id: clientAId, seller_id: sellerAId, is_primary: true });
    if (linkError) throw linkError;

    const { data: insurer, error: insurerError } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E QIsolation" })
      .select()
      .single();
    if (insurerError) throw insurerError;
    insurerId = insurer.id;

    const { data: insurer2, error: insurer2Error } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E QIsolation 2" })
      .select()
      .single();
    if (insurer2Error) throw insurer2Error;
    insurerId2 = insurer2.id;

    const { data: quotation, error: quotationError } = await admin
      .from("quotations")
      .insert({ brokerage_id: brokerageId, client_id: clientAId, seller_id: sellerAId, number: "" })
      .select()
      .single();
    if (quotationError) throw quotationError;
    quotationId = quotation.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    if (quotationId) await admin.from("quotations").delete().eq("id", quotationId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("insurers").delete().eq("id", insurerId2);
    await admin.from("client_sellers").delete().eq("client_id", clientAId);
    await admin.from("clients").delete().eq("id", clientAId);
    await admin.auth.admin.deleteUser(sellerAId);
    await admin.auth.admin.deleteUser(sellerBId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller sem vínculo com o cliente não vê a cotação de outro seller", async ({ page }) => {
    await login(page, sellerBEmail);

    await page.goto("/quotations");
    await expect(page.getByText("Nenhuma cotação cadastrada ainda.")).toBeVisible();

    // RLS bloqueia a leitura direta (não é só a UI que esconde a listagem)
    const result = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { data } = await mod.supabase
        .from("quotations")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      return data;
    }, quotationId);
    expect(result).toBeNull();
  });

  test("seller não convida seguradora nem edita retorno, mesmo sendo o dono da cotação", async ({
    page,
  }) => {
    const admin = adminClient();
    const { data: quotationInsurer, error: qiError } = await admin
      .from("quotation_insurers")
      .insert({
        quotation_id: quotationId,
        insurer_id: insurerId,
        brokerage_id: brokerageId,
        response_status: "pending",
      })
      .select()
      .single();
    if (qiError) throw qiError;

    await login(page, sellerAEmail);
    await page.goto(`/quotations/${quotationId}`);
    await page.getByRole("tab", { name: "Seguradoras" }).click();

    // UI: sem seletor de convidar, ação da linha é "Ver" (só leitura)
    await expect(page.getByRole("button", { name: "Convidar seguradora" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Ver" })).toBeVisible();

    // RLS: convite direto via banco também é negado (insurerId2 é válido e
    // ainda não convidado — sem FK/UNIQUE no caminho, só a RLS pode barrar)
    const inviteResult = await page.evaluate(
      async ({ quotationId, insurerId2, brokerageId }) => {
        // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
        const mod = await import("/src/shared/lib/supabase/client.ts");
        const { error } = await mod.supabase
          .from("quotation_insurers")
          .insert({ quotation_id: quotationId, insurer_id: insurerId2, brokerage_id: brokerageId });
        return error?.message ?? null;
      },
      { quotationId, insurerId2, brokerageId },
    );
    expect(inviteResult).toBeTruthy();

    const updateResult = await page.evaluate(
      async ({ id }) => {
        // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
        const mod = await import("/src/shared/lib/supabase/client.ts");
        const { data } = await mod.supabase
          .from("quotation_insurers")
          .update({ response_status: "accepted" })
          .eq("id", id)
          .select();
        return data;
      },
      { id: quotationInsurer.id },
    );
    expect(updateResult).toEqual([]);
  });
});
