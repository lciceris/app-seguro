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

test.describe("policies-flow", () => {
  let brokerageId: string;
  let sellerId: string;
  let analystId: string;
  let supervisorId: string;
  let clientId: string;
  let vehicleId: string;
  let insurerId: string;
  let quotationId: string;

  const sellerEmail = `e2e-pflow-seller-${Date.now()}@appseguro.dev`;
  const analystEmail = `e2e-pflow-analyst-${Date.now()}@appseguro.dev`;
  const supervisorEmail = `e2e-pflow-supervisor-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();
    const { data: brokerage } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E PFlow" })
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

    sellerId = await createTestUser(sellerEmail, "seller", "Seller PFlow");
    analystId = await createTestUser(analystEmail, "analyst", "Analyst PFlow");
    supervisorId = await createTestUser(supervisorEmail, "supervisor", "Supervisor PFlow");

    const { data: client } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E PFlow" })
      .select()
      .single();
    clientId = client!.id;
    await admin
      .from("client_sellers")
      .insert({ client_id: clientId, seller_id: sellerId, is_primary: true });

    const { data: vehicle } = await admin
      .from("vehicles")
      .insert({ brokerage_id: brokerageId, client_id: clientId, plate: "PFL0001" })
      .select()
      .single();
    vehicleId = vehicle!.id;

    const { data: insurer } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E PFlow" })
      .select()
      .single();
    insurerId = insurer!.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    if (quotationId) await admin.from("policies").delete().eq("quotation_id", quotationId);
    if (quotationId) await admin.from("quotations").delete().eq("id", quotationId);
    await admin.from("vehicles").delete().eq("id", vehicleId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("client_sellers").delete().eq("client_id", clientId);
    await admin.from("clients").delete().eq("id", clientId);
    await admin.auth.admin.deleteUser(sellerId);
    await admin.auth.admin.deleteUser(analystId);
    await admin.auth.admin.deleteUser(supervisorId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("cotação efetivada gera apólice automaticamente; supervisor completa número e anexa documento", async ({
    page,
  }) => {
    await login(page, sellerEmail);
    await page.goto("/quotations/add");
    await page.getByRole("combobox").first().click();
    const listbox = page.getByRole("listbox");
    await listbox.waitFor();
    await listbox.getByText("Cliente E2E PFlow").click();
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByText("Cotação criada com sucesso")).toBeVisible();
    await page.waitForURL(/\/quotations$/);

    await page
      .getByRole("row", { name: /Cliente E2E PFlow/ })
      .getByRole("link")
      .first()
      .click();
    await page.waitForURL(/\/quotations\/[^/]+$/);
    quotationId = page.url().split("/quotations/")[1];

    await page.getByRole("tab", { name: "Veículos" }).click();
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: /PFL0001/ }).click();
    await page.getByRole("button", { name: "Adicionar veículo" }).click();
    await expect(page.getByText("Veículo adicionado com sucesso")).toBeVisible();
    await page.locator("tr", { hasText: "PFL0001" }).locator("button").first().click();
    await page.getByLabel("Valor de casco (R$)").fill("280000");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Cobertura atualizada com sucesso")).toBeVisible();

    await signOut(page);

    await login(page, analystEmail);
    await page.goto(`/quotations/${quotationId}`);
    await page.getByRole("button", { name: "Iniciar cotação" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Iniciar negociação" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();

    await page.getByRole("tab", { name: "Seguradoras" }).click();
    await page.getByRole("combobox").click();
    await page.getByRole("option", { name: "Seguradora E2E PFlow" }).click();
    await page.getByRole("button", { name: "Convidar seguradora" }).click();
    await expect(page.getByText("Seguradora convidada com sucesso")).toBeVisible();
    await page.locator("tr", { hasText: "Seguradora E2E PFlow" }).click();
    await page.getByLabel("Status da resposta").click();
    await page.getByRole("option", { name: "Aceita" }).click();
    await page.getByLabel("Prêmio proposto (R$)").fill("21000");
    await page.getByRole("button", { name: "Salvar retorno" }).click();
    await expect(page.getByText("Retorno salvo com sucesso")).toBeVisible();
    await page.getByRole("button", { name: "Marcar como vencedora" }).click();
    await expect(page.getByText("Seguradora marcada como vencedora")).toBeVisible();
    await page.getByRole("button", { name: "Fechar" }).click();

    await page.getByRole("button", { name: "Apresentar ao cliente" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();

    await signOut(page);

    await login(page, sellerEmail);
    await page.goto(`/quotations/${quotationId}`);
    await page.getByRole("button", { name: "Enviar ao cliente" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Cliente aceitou" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();

    await signOut(page);

    await login(page, supervisorEmail);
    await page.goto(`/quotations/${quotationId}`);
    await page.getByRole("button", { name: "Efetivar" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();

    const admin = adminClient();
    const { data: policy } = await admin
      .from("policies")
      .select("*")
      .eq("quotation_id", quotationId)
      .single();
    expect(policy).toBeTruthy();
    expect(policy!.client_id).toBe(clientId);
    expect(policy!.insurer_id).toBe(insurerId);
    expect(Number(policy!.premium_amount)).toBe(21000);
    expect(Number(policy!.total_fleet_value)).toBe(280000);
    expect(policy!.status).toBe("active");
    expect(policy!.policy_number).toBeNull();

    // navegação via clique (SPA), não `page.goto` direto — evita um reload
    // completo logo depois de uma sequência longa de navegações, que se
    // mostrou instável nesse fluxo (a página ficava em branco, sem erro de
    // console nem de rede — abrir a mesma URL isolada, sem o fluxo longo
    // antes, sempre funcionou).
    await page.goto("/policies");
    const policyRow = page.locator("tr", { hasText: "Cliente E2E PFlow" });
    await policyRow.getByRole("link").first().click();
    await page.waitForURL(new RegExp(`/policies/${policy!.id}$`));
    // regex tolerante a espaço/quebra de linha entre o texto do heading e o
    // badge — o nome acessível varia conforme o texto quebra ou não linha
    // dentro do container, então uma string fixa é frágil aqui.
    await expect(
      page.getByRole("heading", { name: /Pendente de emissão\s*Vigente/ }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Fechar" }).click();
    await page.waitForURL(/\/policies$/);
    await policyRow.getByRole("link").nth(1).click();
    await page.waitForURL(new RegExp(`/policies/${policy!.id}/edit$`));
    await page.getByLabel("Número da apólice").fill("AP-PFLOW-0001");
    await page.getByRole("button", { name: "Salvar" }).click();
    await expect(page.getByText("Apólice atualizada com sucesso")).toBeVisible();
    await page.waitForURL(new RegExp(`/policies/${policy!.id}$`));
    await expect(page.getByRole("heading", { name: /AP-PFLOW-0001\s*Vigente/ })).toBeVisible();

    await page.setInputFiles('input[type="file"]', {
      name: "apolice.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4 conteudo de teste"),
    });
    await expect(page.getByText("Anexo enviado com sucesso")).toBeVisible();
    await expect(page.getByText("apolice.pdf")).toBeVisible();
  });
});
