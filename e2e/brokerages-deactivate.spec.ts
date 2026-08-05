import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PLATFORM_BROKERAGE_ID = "00000000-0000-0000-0000-000000000001";

const password = "TesteSenha123!";
const platformEmail = `e2e-bdeact-platform-${Date.now()}@appseguro.dev`;
const brokerageAdminEmail = `e2e-bdeact-badmin-${Date.now()}@appseguro.dev`;

let platformAdminId: string;
let brokerageId: string;
let brokerageAdminId: string;

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
    full_name: "Platform E2E Deact",
    email: platformEmail,
  });
  if (platformUserError) throw platformUserError;

  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E Desativação Brokerage" })
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
    full_name: "Brokerage Admin E2E Deact",
    email: brokerageAdminEmail,
  });
  if (brokerageAdminUserError) throw brokerageAdminUserError;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.auth.admin.deleteUser(platformAdminId);
  await admin.auth.admin.deleteUser(brokerageAdminId);
  await admin.from("brokerages").delete().eq("id", brokerageId);
});

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Espera sair de /login antes de continuar — sem isso, um goto() logo em
  // seguida pode competir com o redirect pós-login ainda em andamento.
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

async function signOut(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
    const mod = await import("/src/shared/lib/supabase/client.ts");
    await mod.supabase.auth.signOut();
  });
}

test("desativação de corretora → login bloqueado com a mensagem certa → reativação → login funciona de novo", async ({
  page,
}) => {
  await login(page, platformEmail);
  await page.goto("/brokerages");
  await expect(page.getByText("Corretora E2E Desativação Brokerage")).toBeVisible();

  const row = page.locator("tr", {
    has: page.locator(`a[href="/brokerages/${brokerageId}"]`),
  });
  await row.locator("button").first().click();
  await expect(page.getByText("Desativar corretora")).toBeVisible();
  await page.getByRole("button", { name: "Desativar", exact: true }).click();
  await expect(page.getByText("Corretora desativada com sucesso")).toBeVisible();

  await signOut(page);
  await expect(page).toHaveURL(/\/login/);

  // AccountDeactivatedPage desloga automaticamente ao montar (spec auth) — não
  // é uma rota protegida, então basta chegar nela pra ver a mensagem certa.
  await login(page, brokerageAdminEmail);
  await expect(page).toHaveURL(/\/account-deactivated/);
  await expect(page.getByText(/acesso da sua corretora à plataforma foi desativado/)).toBeVisible();

  await page.goto("/login");
  await login(page, platformEmail);
  await page.goto("/brokerages");
  await expect(page.getByText("Corretora E2E Desativação Brokerage")).toBeVisible();
  const rowAfter = page.locator("tr", {
    has: page.locator(`a[href="/brokerages/${brokerageId}"]`),
  });
  await rowAfter.locator("button").first().click();
  await expect(page.getByText("Corretora reativada com sucesso")).toBeVisible();

  await signOut(page);
  await expect(page).toHaveURL(/\/login/);

  await login(page, brokerageAdminEmail);
  await expect(page).not.toHaveURL(/\/account-deactivated/);
});
