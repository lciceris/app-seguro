import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const password = "TesteSenha123!";
const brokerageAdminEmail = `e2e-cdeact-badmin-${Date.now()}@appseguro.dev`;
const clientName = `Cliente E2E Deactivate ${Date.now()}`;

let brokerageId: string;
let brokerageAdminId: string;
let clientId: string;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.beforeAll(async () => {
  const admin = adminClient();

  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E Clients Deactivate" })
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
    full_name: "Brokerage Admin E2E Clients Deactivate",
    email: brokerageAdminEmail,
  });
  if (userError) throw userError;

  const { data: client, error: clientError } = await admin
    .from("clients")
    .insert({ brokerage_id: brokerageId, legal_name: clientName, segment: "active" })
    .select()
    .single();
  if (clientError) throw clientError;
  clientId = client.id;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.from("clients").delete().eq("id", clientId);
  await admin.auth.admin.deleteUser(brokerageAdminId);
  await admin.from("brokerages").delete().eq("id", brokerageId);
});

test("brokerage_admin inativa um cliente → continua listado com indicação de inativo → reativa", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', brokerageAdminEmail);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));

  await page.goto("/clients");
  const row = page.locator("tr", { hasText: clientName });
  await row.waitFor();

  await row.locator("button").first().click();
  await expect(page.getByText("Inativar cliente")).toBeVisible();
  await page.getByRole("button", { name: "Inativar", exact: true }).click();
  await expect(page.getByText("Cliente inativado com sucesso")).toBeVisible();

  await expect(row.getByText("Inativo")).toBeVisible();
  await expect(row).toBeVisible();

  await row.locator("button").first().click();
  await expect(page.getByText("Cliente reativado com sucesso")).toBeVisible();
  await expect(row.getByText("Ativo")).toBeVisible();
});
