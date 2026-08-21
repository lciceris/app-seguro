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

test.describe("policy-endorsements-vehicle-inclusion", () => {
  let brokerageId: string;
  let sellerId: string;
  let analystId: string;
  let supervisorId: string;
  let clientId: string;
  let insurerId: string;
  let quotationId: string;
  let policyId: string;
  let vehicleId: string;
  let endorsementId: string;
  let newPolicyId: string;

  const sellerEmail = `e2e-pevi-seller-${Date.now()}@appseguro.dev`;
  const analystEmail = `e2e-pevi-analyst-${Date.now()}@appseguro.dev`;
  const supervisorEmail = `e2e-pevi-supervisor-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();
    const { data: brokerage } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E PEVI" })
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

    sellerId = await createTestUser(sellerEmail, "seller", "Seller PEVI");
    analystId = await createTestUser(analystEmail, "analyst", "Analyst PEVI");
    supervisorId = await createTestUser(supervisorEmail, "supervisor", "Supervisor PEVI");

    const { data: client } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E PEVI" })
      .select()
      .single();
    clientId = client!.id;
    await admin
      .from("client_sellers")
      .insert({ client_id: clientId, seller_id: sellerId, is_primary: true });

    const { data: insurer } = await admin
      .from("insurers")
      .insert({ name: "Seguradora E2E PEVI" })
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
        policy_number: "AP-PEVI-0001",
        status: "active",
      })
      .select()
      .single();
    policyId = policy!.id;

    const { data: vehicle } = await admin
      .from("vehicles")
      .insert({
        brokerage_id: brokerageId,
        client_id: clientId,
        plate: "PEVI0001",
        brand: "Volvo",
        model: "FH",
        vehicle_type: "heavy_truck",
      })
      .select()
      .single();
    vehicleId = vehicle!.id;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    if (endorsementId) await admin.from("policy_endorsements").delete().eq("id", endorsementId);
    if (newPolicyId) await admin.from("policies").delete().eq("id", newPolicyId);
    await admin.from("policies").delete().eq("id", policyId);
    await admin.from("vehicles").delete().eq("id", vehicleId);
    await admin.from("quotations").delete().eq("id", quotationId);
    await admin.from("insurers").delete().eq("id", insurerId);
    await admin.from("client_sellers").delete().eq("client_id", clientId);
    await admin.from("clients").delete().eq("id", clientId);
    await admin.auth.admin.deleteUser(sellerId);
    await admin.auth.admin.deleteUser(analystId);
    await admin.auth.admin.deleteUser(supervisorId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller abre, analyst negocia, seller repassa aceite do cliente, supervisor efetiva — nova versão com o veículo incluído", async ({
    page,
  }) => {
    await login(page, sellerEmail);
    await page.goto(`/policies/${policyId}`);
    await page.getByRole("link", { name: "Abrir endosso" }).click();
    await page.waitForURL(new RegExp(`/policies/${policyId}/endorsements/add$`));

    await page.getByLabel("Veículo do cliente").click();
    await page.getByRole("option", { name: /PEVI0001/ }).click();
    await page.getByLabel("Valor de casco (R$)").fill("280000");
    await page.getByRole("button", { name: "Abrir endosso" }).click();
    await expect(page.getByText("Endosso aberto com sucesso")).toBeVisible();
    await page.waitForURL(new RegExp(`/policies/${policyId}$`));

    await page.locator("li", { hasText: "Inclusão de veículo" }).getByRole("link").click();
    await page.waitForURL(new RegExp(`/policies/${policyId}/endorsements/[^/]+$`));
    endorsementId = page.url().split("/endorsements/")[1];
    await expect(page.getByText("Aguardando seguradora")).toBeVisible();

    await signOut(page);

    await login(page, analystEmail);
    await page.goto(`/policies/${policyId}/endorsements/${endorsementId}`);
    await page.getByRole("button", { name: "Registrar retorno da seguradora" }).click();
    await page.getByLabel("Ajuste de prêmio (R$)").fill("300");
    await page.getByLabel("Notas do retorno").fill("Seguradora aprovou a inclusão");
    await page.getByRole("button", { name: "Registrar e apresentar ao cliente" }).click();
    await expect(page.getByText("Retorno da seguradora registrado com sucesso")).toBeVisible();
    await expect(page.getByText("Aguardando cliente")).toBeVisible();

    await signOut(page);

    await login(page, sellerEmail);
    await page.goto(`/policies/${policyId}/endorsements/${endorsementId}`);
    await page.getByRole("button", { name: "Cliente aceitou" }).click();
    await expect(page.getByText("Status atualizado com sucesso")).toBeVisible();
    await expect(page.getByText("Cliente aceitou")).toBeVisible();

    await signOut(page);

    await login(page, supervisorEmail);
    await page.goto(`/policies/${policyId}/endorsements/${endorsementId}`);
    await page.getByRole("button", { name: "Efetivar" }).click();
    await expect(page.getByText("Status atualizado com sucesso")).toBeVisible();
    await expect(page.getByText("Efetivado", { exact: true })).toBeVisible();

    const admin = adminClient();
    const { data: endorsementAfter } = await admin
      .from("policy_endorsements")
      .select("new_policy_id, status")
      .eq("id", endorsementId)
      .single();
    expect(endorsementAfter!.status).toBe("effected");
    expect(endorsementAfter!.new_policy_id).toBeTruthy();
    newPolicyId = endorsementAfter!.new_policy_id!;

    const { data: newPolicy } = await admin
      .from("policies")
      .select("policy_number, status, previous_version_id, root_policy_id")
      .eq("id", newPolicyId)
      .single();
    expect(newPolicy!.policy_number).toBe("AP-PEVI-0001");
    expect(newPolicy!.status).toBe("active");
    expect(newPolicy!.previous_version_id).toBe(policyId);
    expect(newPolicy!.root_policy_id).toBe(policyId);

    const { data: oldPolicyAfter } = await admin
      .from("policies")
      .select("status")
      .eq("id", policyId)
      .single();
    expect(oldPolicyAfter!.status).toBe("superseded");

    const { data: newPolicyVehicles } = await admin
      .from("policy_vehicles")
      .select("vehicle_id, casco_value")
      .eq("policy_id", newPolicyId);
    const includedVehicle = newPolicyVehicles!.find((item) => item.vehicle_id === vehicleId);
    expect(includedVehicle).toBeTruthy();
    expect(Number(includedVehicle!.casco_value)).toBe(280000);

    // reflexo na UI: versão antiga aponta pra atual, versão atual mostra o veículo incluído
    await page.goto(`/policies/${policyId}`);
    await expect(page.getByText(/não é a versão mais recente/)).toBeVisible();
    await page.getByRole("link", { name: "Ver versão atual" }).click();
    await page.waitForURL(new RegExp(`/policies/${newPolicyId}$`));
    await expect(page.getByText("PEVI0001")).toBeVisible();
  });
});
