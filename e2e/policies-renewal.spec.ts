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

// Leitura logo após o trigger de efetivação — observado um caso pontual de
// leitura defasada (a policy já existia no banco, mas essa query não a viu
// de primeira). Poucas tentativas com espera curta bastam.
async function waitForPolicyByQuotation(
  admin: ReturnType<typeof adminClient>,
  quotationId: string,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await admin
      .from("policies")
      .select("*")
      .eq("quotation_id", quotationId)
      .maybeSingle();
    if (data) return data;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Nenhuma policy encontrada pra quotation ${quotationId} depois de 5 tentativas`);
}

test.describe("policies-renewal", () => {
  let brokerageId: string;
  let sellerId: string;
  let supervisorId: string;
  let clientId: string;
  let insurerId: string;
  let existingPolicyId: string;
  let newQuotationId: string;

  const sellerEmail = `e2e-prenewal-seller-${Date.now()}@appseguro.dev`;
  const supervisorEmail = `e2e-prenewal-supervisor-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();
    const { data: brokerage } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E PRenewal" })
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

    sellerId = await createTestUser(sellerEmail, "seller", "Seller PRenewal");
    supervisorId = await createTestUser(supervisorEmail, "supervisor", "Supervisor PRenewal");

    const { data: client } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E PRenewal" })
      .select()
      .single();
    clientId = client!.id;
    await admin
      .from("client_sellers")
      .insert({ client_id: clientId, seller_id: sellerId, is_primary: true });

    const { data: insurer } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E PRenewal" })
      .select()
      .single();
    insurerId = insurer!.id;

    const { data: oldQuotation } = await admin
      .from("quotations")
      .insert({ brokerage_id: brokerageId, client_id: clientId, number: "" })
      .select()
      .single();
    const { data: existingPolicy } = await admin
      .from("policies")
      .insert({
        brokerage_id: brokerageId,
        client_id: clientId,
        insurer_id: insurerId,
        quotation_id: oldQuotation!.id,
        policy_number: "AP-PRENEWAL-0001",
      })
      .select()
      .single();
    existingPolicyId = existingPolicy!.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    if (newQuotationId) await admin.from("policies").delete().eq("quotation_id", newQuotationId);
    if (newQuotationId) await admin.from("quotations").delete().eq("id", newQuotationId);
    await admin.from("policies").delete().eq("id", existingPolicyId);
    await admin.from("quotations").delete().eq("client_id", clientId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("client_sellers").delete().eq("client_id", clientId);
    await admin.from("clients").delete().eq("id", clientId);
    await admin.auth.admin.deleteUser(sellerId);
    await admin.auth.admin.deleteUser(supervisorId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("cotação de renovação vinculada no QAR gera nova apólice ligada à anterior, que vira 'renewed'", async ({
    page,
  }) => {
    await login(page, sellerEmail);
    await page.goto("/quotations/add");
    await page.getByRole("combobox").first().click();
    const listbox = page.getByRole("listbox");
    await listbox.waitFor();
    await listbox.getByText("Cliente E2E PRenewal").click();
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByText("Cotação criada com sucesso")).toBeVisible();
    await page.waitForURL(/\/quotations$/);

    await page
      .getByRole("row", { name: /Cliente E2E PRenewal/ })
      .getByRole("link")
      .first()
      .click();
    await page.waitForURL(/\/quotations\/[^/]+$/);
    newQuotationId = page.url().split("/quotations/")[1];

    await page.getByRole("tab", { name: "QAR" }).click();
    await page.getByLabel("Apólice anterior").click();
    await page.getByRole("option", { name: "AP-PRENEWAL-0001" }).click();
    await page.getByRole("button", { name: "Salvar QAR" }).click();
    await expect(page.getByText("QAR salvo com sucesso")).toBeVisible();

    const admin = adminClient();
    const { error: insurerError } = await admin.from("quotation_insurers").insert({
      quotation_id: newQuotationId,
      insurer_id: insurerId,
      brokerage_id: brokerageId,
      response_status: "accepted",
      premium_amount: 23000,
      is_winner: true,
    });
    expect(insurerError).toBeNull();

    // avança o status via sessões reais (papel de cada um já coberto em
    // detalhe por quotations-flow/policies-flow — aqui o foco é o vínculo de
    // renovação, não repetir a validação da máquina de estados inteira).
    // supervisor cobre tanto as transições de negociação (mesmo grupo de
    // analyst) quanto a efetivação final — só "enviar ao cliente"/"cliente
    // aceitou" exige ser o seller dono ou gestão, supervisor serve aqui também.
    await page.evaluate(async () => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      await mod.supabase.auth.signOut();
    });
    await login(page, supervisorEmail);
    await page.goto(`/quotations/${newQuotationId}`);
    await page.getByRole("button", { name: "Iniciar cotação" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Iniciar negociação" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Apresentar ao cliente" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Enviar ao cliente" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Cliente aceitou" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();
    await page.getByRole("button", { name: "Efetivar" }).click();
    await expect(page.getByText("Status atualizado com sucesso").last()).toBeVisible();

    const newPolicy = await waitForPolicyByQuotation(admin, newQuotationId);
    expect(newPolicy.renewed_from_policy_id).toBe(existingPolicyId);

    const { data: oldPolicyAfter } = await admin
      .from("policies")
      .select("status")
      .eq("id", existingPolicyId)
      .single();
    expect(oldPolicyAfter!.status).toBe("renewed");

    // reflexo na UI: a apólice antiga mostra o status "Renovada" e o link
    // pra quem a renovou (nova apólice, ainda sem policy_number); a nova
    // mostra o link de volta pra ela
    await page.goto(`/policies/${existingPolicyId}`);
    await expect(page.getByRole("heading", { name: /AP-PRENEWAL-0001\s*Renovada/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pendente de emissão" })).toBeVisible();

    await page.goto(`/policies/${newPolicy.id}`);
    await expect(page.getByRole("link", { name: "AP-PRENEWAL-0001" })).toBeVisible();
  });
});
