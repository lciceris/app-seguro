import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const password = "TesteSenha123!";
const adminEmail = `e2e-deact-admin-${Date.now()}@appseguro.dev`;
const targetEmail = `e2e-deact-target-${Date.now()}@appseguro.dev`;

let brokerageId: string;
let adminId: string;
let targetId: string;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.beforeAll(async () => {
  const admin = adminClient();

  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E Desativação" })
    .select()
    .single();
  if (brokerageError) throw brokerageError;
  brokerageId = brokerage.id;

  const { data: adminAuth, error: adminAuthError } = await admin.auth.admin.createUser({
    email: adminEmail,
    password,
    email_confirm: true,
  });
  if (adminAuthError) throw adminAuthError;
  adminId = adminAuth.user.id;
  const { error: adminUserError } = await admin.from("users").insert({
    id: adminId,
    brokerage_id: brokerageId,
    role: "brokerage_admin",
    status: "active",
    full_name: "Admin E2E Desativação",
    email: adminEmail,
  });
  if (adminUserError) throw adminUserError;

  const { data: targetAuth, error: targetAuthError } = await admin.auth.admin.createUser({
    email: targetEmail,
    password,
    email_confirm: true,
  });
  if (targetAuthError) throw targetAuthError;
  targetId = targetAuth.user.id;
  const { error: targetUserError } = await admin.from("users").insert({
    id: targetId,
    brokerage_id: brokerageId,
    role: "seller",
    status: "active",
    full_name: "Alvo E2E Desativação",
    email: targetEmail,
  });
  if (targetUserError) throw targetUserError;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.auth.admin.deleteUser(adminId);
  await admin.auth.admin.deleteUser(targetId);
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

async function logout(page: import("@playwright/test").Page) {
  await signOut(page);
  // O redirect pro /login (via listener de SIGNED_OUT, numa rota protegida) pode
  // já ter acontecido durante o evaluate() acima — esperar por uma NOVA
  // navegação com waitForURL corre risco de perder esse evento. Checa o estado
  // atual em vez disso.
  await expect(page).toHaveURL(/\/login/);
}

test("desativação → login bloqueado → reativação → login funciona de novo", async ({ page }) => {
  await login(page, adminEmail);
  await page.goto("/users");
  await expect(page.getByText("Alvo E2E Desativação")).toBeVisible();

  const targetRow = page.locator("tr", { has: page.locator(`a[href="/users/${targetId}"]`) });
  await targetRow.locator("button").nth(1).click();
  await expect(page.getByText("Desativar usuário")).toBeVisible();
  await page.getByRole("button", { name: "Desativar", exact: true }).click();
  await expect(page.getByText("Usuário desativado com sucesso")).toBeVisible();

  await logout(page);

  await login(page, targetEmail);
  await expect(page).toHaveURL(/\/account-deactivated/);

  // /account-deactivated não é uma rota protegida (o usuário desativado precisa
  // conseguir vê-la mesmo sem role/corretora válidos) — signOut() aqui não
  // dispara redirect automático, então navega manualmente pra /login.
  await signOut(page);
  await page.goto("/login");

  await login(page, adminEmail);
  await page.goto("/users");
  await expect(page.getByText("Alvo E2E Desativação")).toBeVisible();
  const targetRowAfter = page.locator("tr", { has: page.locator(`a[href="/users/${targetId}"]`) });
  await targetRowAfter.locator("button").nth(1).click();
  await expect(page.getByText("Usuário reativado com sucesso")).toBeVisible();

  await logout(page);

  await login(page, targetEmail);
  await expect(page).toHaveURL("http://localhost:5173/");
});
