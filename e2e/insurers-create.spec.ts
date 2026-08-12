import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PLATFORM_BROKERAGE_ID = "00000000-0000-0000-0000-000000000001";

const password = "TesteSenha123!";
const platformEmail = `e2e-icreate-platform-${Date.now()}@appseguro.dev`;
const brokerageAdminEmail = `e2e-icreate-badmin-${Date.now()}@appseguro.dev`;
const insurerName = `Seguradora E2E Create ${Date.now()}`;

let platformAdminId: string;
let brokerageAdminId: string;
let brokerageId: string;
let insurerId: string | undefined;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.beforeAll(async () => {
  const admin = adminClient();

  const { data: platformAuth, error: platformAuthError } = await admin.auth.admin.createUser({
    email: platformEmail,
    password,
    email_confirm: true,
  });
  if (platformAuthError) throw platformAuthError;
  platformAdminId = platformAuth.user.id;
  const { error: platformUserError } = await admin.from("users").insert({
    id: platformAdminId,
    brokerage_id: PLATFORM_BROKERAGE_ID,
    role: "platform_admin",
    status: "active",
    full_name: "Platform E2E Create",
    email: platformEmail,
  });
  if (platformUserError) throw platformUserError;

  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E Create Insurer" })
    .select()
    .single();
  if (brokerageError) throw brokerageError;
  brokerageId = brokerage.id;

  const { data: brokerageAdminAuth, error: brokerageAdminAuthError } =
    await admin.auth.admin.createUser({
      email: brokerageAdminEmail,
      password,
      email_confirm: true,
    });
  if (brokerageAdminAuthError) throw brokerageAdminAuthError;
  brokerageAdminId = brokerageAdminAuth.user.id;
  const { error: brokerageAdminUserError } = await admin.from("users").insert({
    id: brokerageAdminId,
    brokerage_id: brokerageId,
    role: "brokerage_admin",
    status: "active",
    full_name: "Brokerage Admin E2E Create",
    email: brokerageAdminEmail,
  });
  if (brokerageAdminUserError) throw brokerageAdminUserError;
});

test.afterAll(async () => {
  const admin = adminClient();
  if (insurerId) await admin.from("insurers").delete().eq("id", insurerId);
  await admin.auth.admin.deleteUser(platformAdminId);
  await admin.auth.admin.deleteUser(brokerageAdminId);
  await admin.from("brokerages").delete().eq("id", brokerageId);
});

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test("platform_admin cadastra seguradora → aparece no catálogo de /my-insurers", async ({
  page,
}) => {
  await login(page, platformEmail);
  await page.goto("/admin/insurers/add");

  await page.fill("#name", insurerName);
  await page.fill("#cnpj", "33.333.333/0001-33");
  await page.getByRole("button", { name: "Criar" }).click();

  await expect(page.getByText("Seguradora criada com sucesso")).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/insurers$/);
  await expect(page.getByText(insurerName)).toBeVisible();

  const admin = adminClient();
  const { data: insurer, error } = await admin
    .from("insurers")
    .select("id")
    .eq("name", insurerName)
    .single();
  if (error) throw error;
  insurerId = insurer.id;

  await page.evaluate(async () => {
    // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
    const mod = await import("/src/shared/lib/supabase/client.ts");
    await mod.supabase.auth.signOut();
  });
  await page.goto("/login");

  await login(page, brokerageAdminEmail);
  await page.goto("/my-insurers");
  await expect(page.getByText(insurerName)).toBeVisible();

  const row = page.locator("tr", { hasText: insurerName });
  await expect(row.getByRole("switch")).toBeChecked();
});
