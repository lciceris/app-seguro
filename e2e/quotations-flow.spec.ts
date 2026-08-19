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

test.describe("quotations-flow", () => {
  let brokerageId: string;
  let sellerId: string;
  let analystId: string;
  let supervisorId: string;
  let clientId: string;
  let insurerId: string;
  let quotationId: string;
  const sellerEmail = `e2e-qflow-seller-${Date.now()}@appseguro.dev`;
  const analystEmail = `e2e-qflow-analyst-${Date.now()}@appseguro.dev`;
  const supervisorEmail = `e2e-qflow-supervisor-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();

    const { data: brokerage, error: brokerageError } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E QFlow" })
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

    sellerId = await createTestUser(sellerEmail, "seller", "Seller E2E QFlow");
    analystId = await createTestUser(analystEmail, "analyst", "Analyst E2E QFlow");
    supervisorId = await createTestUser(supervisorEmail, "supervisor", "Supervisor E2E QFlow");

    const { data: client, error: clientError } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E QFlow" })
      .select()
      .single();
    if (clientError) throw clientError;
    clientId = client.id;
    const { error: linkError } = await admin
      .from("client_sellers")
      .insert({ client_id: clientId, seller_id: sellerId, is_primary: true });
    if (linkError) throw linkError;

    const { data: insurer, error: insurerError } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E QFlow" })
      .select()
      .single();
    if (insurerError) throw insurerError;
    insurerId = insurer.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    // o fluxo chega até `effected`, então o trigger da spec `policies` já
    // criou uma linha — precisa sumir antes de `quotations`/`insurers`
    // (FK `on delete restrict` nos dois), senão o delete falha silencioso
    // e deixa órfãos (insurers não tem brokerage_id, então nem o cascade
    // final de brokerages limpa isso).
    if (quotationId) await admin.from("policies").delete().eq("quotation_id", quotationId);
    if (quotationId) await admin.from("quotations").delete().eq("id", quotationId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("client_sellers").delete().eq("client_id", clientId);
    await admin.from("clients").delete().eq("id", clientId);
    await admin.auth.admin.deleteUser(sellerId);
    await admin.auth.admin.deleteUser(analystId);
    await admin.auth.admin.deleteUser(supervisorId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller cria → analyst negocia e apresenta → seller registra aceite → supervisor efetiva; seller/analyst bloqueados na transição final", async ({
    page,
  }) => {
    await login(page, sellerEmail);
    await page.goto("/quotations/add");
    await page.getByRole("combobox").first().click();
    const listbox = page.getByRole("listbox");
    await listbox.waitFor();
    await listbox.getByText("Cliente E2E QFlow").click();
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByText("Cotação criada com sucesso")).toBeVisible();
    await page.waitForURL(/\/quotations$/);

    await page
      .getByRole("row", { name: /Cliente E2E QFlow/ })
      .getByRole("link")
      .first()
      .click();
    await page.waitForURL(/\/quotations\/[^/]+$/);
    quotationId = page.url().split("/quotations/")[1];

    await signOut(page);

    await login(page, analystEmail);
    await page.goto(`/quotations/${quotationId}`);
    await page.getByRole("button", { name: "Iniciar cotação" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Iniciar negociação" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();

    await page.getByRole("tab", { name: "Seguradoras" }).click();
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Seguradora E2E QFlow" }).click();
    await page.getByRole("button", { name: "Convidar seguradora" }).click();
    await expect(page.getByText("Seguradora convidada com sucesso")).toBeVisible();
    await page.locator("tr", { hasText: "Seguradora E2E QFlow" }).click();
    await page.getByLabel("Status da resposta").click();
    await page.getByRole("option", { name: "Aceita" }).click();
    await page.getByLabel("Prêmio proposto (R$)").fill("18500");
    await page.getByRole("button", { name: "Salvar retorno" }).click();
    await expect(page.getByText("Retorno salvo com sucesso")).toBeVisible();
    await page.getByRole("button", { name: "Marcar como vencedora" }).click();
    await expect(page.getByText("Seguradora marcada como vencedora")).toBeVisible();
    await page.getByRole("button", { name: "Fechar" }).click();

    await page.getByRole("button", { name: "Apresentar ao cliente" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await expect(page.getByText("Apresentada")).toBeVisible();

    await signOut(page);

    await login(page, sellerEmail);
    await page.goto(`/quotations/${quotationId}`);
    await page.getByRole("button", { name: "Enviar ao cliente" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Cliente aceitou" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await expect(page.getByText("Cliente Aceitou")).toBeVisible();

    // seller e analyst não podem efetivar — nem a UI mostra a ação, nem o
    // backend aceita se alguém tentar direto (o trigger é quem garante de
    // verdade, não só a UI).
    await expect(page.getByRole("button", { name: "Efetivar" })).not.toBeVisible();
    let result = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { error } = await mod.supabase
        .from("quotations")
        .update({ status: "effected" })
        .eq("id", id);
      return error?.message ?? null;
    }, quotationId);
    expect(result).toBeTruthy();

    await signOut(page);

    await login(page, analystEmail);
    result = await page.evaluate(async (id: string) => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      const { error } = await mod.supabase
        .from("quotations")
        .update({ status: "effected" })
        .eq("id", id);
      return error?.message ?? null;
    }, quotationId);
    expect(result).toBeTruthy();

    await signOut(page);

    await login(page, supervisorEmail);
    await page.goto(`/quotations/${quotationId}`);
    await page.getByRole("button", { name: "Efetivar" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await expect(page.getByText("Efetivada")).toBeVisible();

    // estado terminal — mais nenhuma ação de status disponível
    await expect(page.getByRole("button", { name: "Efetivar" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Não fechada" })).not.toBeVisible();
  });
});
