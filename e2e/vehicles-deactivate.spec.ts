import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const password = "TesteSenha123!";
const brokerageAdminEmail = `e2e-vdeact-badmin-${Date.now()}@appseguro.dev`;
const plate = `DEA${Date.now().toString().slice(-4)}`;

let brokerageId: string;
let brokerageAdminId: string;
let clientId: string;
let vehicleId: string;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.beforeAll(async () => {
  const admin = adminClient();

  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E Vehicles Deactivate" })
    .select()
    .single();
  if (brokerageError) throw brokerageError;
  brokerageId = brokerage.id;

  const { data: auth, error: authError } = await admin.auth.admin.createUser({
    email: brokerageAdminEmail,
    password,
    email_confirm: true,
  });
  if (authError) throw authError;
  brokerageAdminId = auth.user.id;
  const { error: userError } = await admin.from("users").insert({
    id: brokerageAdminId,
    brokerage_id: brokerageId,
    role: "brokerage_admin",
    status: "active",
    full_name: "Brokerage Admin E2E Vehicles Deactivate",
    email: brokerageAdminEmail,
  });
  if (userError) throw userError;

  const { data: client, error: clientError } = await admin
    .from("clients")
    .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E Vehicles Deactivate" })
    .select()
    .single();
  if (clientError) throw clientError;
  clientId = client.id;

  const { data: vehicle, error: vehicleError } = await admin
    .from("vehicles")
    .insert({ brokerage_id: brokerageId, client_id: clientId, plate })
    .select()
    .single();
  if (vehicleError) throw vehicleError;
  vehicleId = vehicle.id;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.from("vehicles").delete().eq("id", vehicleId);
  await admin.from("clients").delete().eq("id", clientId);
  await admin.auth.admin.deleteUser(brokerageAdminId);
  await admin.from("brokerages").delete().eq("id", brokerageId);
});

test("brokerage_admin inativa um veículo → continua listado com indicação de inativo → reativa", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', brokerageAdminEmail);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));

  await page.goto("/vehicles");
  const row = page.locator("tr", { hasText: plate });
  await row.waitFor();

  await row.locator("button").first().click();
  await expect(page.getByText("Inativar veículo")).toBeVisible();
  await page.getByRole("button", { name: "Inativar", exact: true }).click();
  await expect(page.getByText("Veículo inativado com sucesso")).toBeVisible();

  await expect(row.getByText("Inativo")).toBeVisible();
  await expect(row).toBeVisible();

  await row.locator("button").first().click();
  await expect(page.getByText("Veículo reativado com sucesso")).toBeVisible();
  await expect(row.getByText("Ativo")).toBeVisible();
});
