import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const password = "TesteSenha123!";
const brokerageAdminAEmail = `e2e-itoggle-badminA-${Date.now()}@appseguro.dev`;
const brokerageAdminBEmail = `e2e-itoggle-badminB-${Date.now()}@appseguro.dev`;
const insurerName = `Seguradora E2E Toggle ${Date.now()}`;

let brokerageAdminAId: string;
let brokerageAdminBId: string;
let brokerageAId: string;
let brokerageBId: string;
let insurerId: string;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.beforeAll(async () => {
  const admin = adminClient();

  const { data: insurer, error: insurerError } = await admin
    .from("insurers")
    .insert({ name: insurerName, cnpj: "44.444.444/0001-44" })
    .select()
    .single();
  if (insurerError) throw insurerError;
  insurerId = insurer.id;

  const { data: brokerageA, error: brokerageAError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora A E2E Toggle" })
    .select()
    .single();
  if (brokerageAError) throw brokerageAError;
  brokerageAId = brokerageA.id;

  const { data: brokerageB, error: brokerageBError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora B E2E Toggle" })
    .select()
    .single();
  if (brokerageBError) throw brokerageBError;
  brokerageBId = brokerageB.id;

  const { data: adminAAuth, error: adminAAuthError } = await admin.auth.admin.createUser({
    email: brokerageAdminAEmail,
    password,
    email_confirm: true,
  });
  if (adminAAuthError) throw adminAAuthError;
  brokerageAdminAId = adminAAuth.user.id;
  const { error: adminAUserError } = await admin.from("users").insert({
    id: brokerageAdminAId,
    brokerage_id: brokerageAId,
    role: "brokerage_admin",
    status: "active",
    full_name: "Brokerage Admin A E2E Toggle",
    email: brokerageAdminAEmail,
  });
  if (adminAUserError) throw adminAUserError;

  const { data: adminBAuth, error: adminBAuthError } = await admin.auth.admin.createUser({
    email: brokerageAdminBEmail,
    password,
    email_confirm: true,
  });
  if (adminBAuthError) throw adminBAuthError;
  brokerageAdminBId = adminBAuth.user.id;
  const { error: adminBUserError } = await admin.from("users").insert({
    id: brokerageAdminBId,
    brokerage_id: brokerageBId,
    role: "brokerage_admin",
    status: "active",
    full_name: "Brokerage Admin B E2E Toggle",
    email: brokerageAdminBEmail,
  });
  if (adminBUserError) throw adminBUserError;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.from("brokerage_disabled_insurers").delete().eq("insurer_id", insurerId);
  await admin.from("insurers").delete().eq("id", insurerId);
  await admin.auth.admin.deleteUser(brokerageAdminAId);
  await admin.auth.admin.deleteUser(brokerageAdminBId);
  await admin.from("brokerages").delete().eq("id", brokerageAId);
  await admin.from("brokerages").delete().eq("id", brokerageBId);
});

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test("brokerage_admin desabilita uma seguradora → isolamento por corretora → reabilita", async ({
  browser,
}) => {
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA, brokerageAdminAEmail);
  await pageA.goto("/my-insurers");

  const rowA = pageA.locator("tr", { hasText: insurerName });
  await expect(rowA.getByRole("switch")).toBeChecked();
  await rowA.getByRole("switch").click();
  await expect(rowA.getByRole("switch")).not.toBeChecked();

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB, brokerageAdminBEmail);
  await pageB.goto("/my-insurers");

  const rowB = pageB.locator("tr", { hasText: insurerName });
  await expect(rowB.getByRole("switch")).toBeChecked();

  await rowA.getByRole("switch").click();
  await expect(rowA.getByRole("switch")).toBeChecked();

  await contextA.close();
  await contextB.close();
});
