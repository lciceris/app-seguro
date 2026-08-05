import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PLATFORM_BROKERAGE_ID = "00000000-0000-0000-0000-000000000001";

const password = "TesteSenha123!";
const platformEmail = `e2e-platform-${Date.now()}@appseguro.dev`;
const adminEmail = `e2e-first-admin-${Date.now()}@appseguro.dev`;

let platformAdminId: string;
let brokerageId: string;
let firstAdminId: string;
let inviteActionLink: string;

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
    full_name: "Platform E2E",
    email: platformEmail,
  });
  if (platformUserError) throw platformUserError;

  // O SMTP sandbox do Supabase rejeita domínios de teste / bate rate limit
  // (ver tasks.md das Tasks 2/5/10 da spec users, e Tasks 2/5 desta spec) —
  // não é possível disparar o convite real via Edge Function neste ambiente.
  // Simula o resultado de uma criação bem-sucedida (corretora + primeiro
  // admin) direto por seed, usando generateLink pra obter um link de convite
  // válido — o que este teste cobre é exatamente o que o frontend controla:
  // definir senha a partir do link → primeiro login.
  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E Create" })
    .select()
    .single();
  if (brokerageError) throw brokerageError;
  brokerageId = brokerage.id;

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email: adminEmail,
    options: { redirectTo: "http://localhost:5173/set-password" },
  });
  if (linkError) throw linkError;
  firstAdminId = linkData.user.id;
  inviteActionLink = linkData.properties.action_link;

  const { error: adminUserError } = await admin.from("users").insert({
    id: firstAdminId,
    brokerage_id: brokerageId,
    role: "brokerage_admin",
    status: "active",
    full_name: "Primeiro Admin E2E",
    email: adminEmail,
  });
  if (adminUserError) throw adminUserError;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.auth.admin.deleteUser(platformAdminId);
  await admin.auth.admin.deleteUser(firstAdminId);
  await admin.from("brokerages").delete().eq("id", brokerageId);
});

test("platform_admin cria corretora pela UI (convite falha por SMTP, sem deixar corretora órfã)", async ({
  page,
}) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', platformEmail);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));

  await page.goto("/brokerages");
  await page.click("text=Nova corretora");
  await page.waitForURL("**/brokerages/add");

  const newBrokerageName = `Corretora UI E2E ${Date.now()}`;
  await page.fill("#brokerage_name", newBrokerageName);
  await page.fill("#admin_full_name", "Admin Via UI");
  await page.fill("#admin_email", `e2e-ui-admin-${Date.now()}@appseguro.dev`);
  await page.click('button[type="submit"]');

  await expect(page.locator("[data-sonner-toast]")).toBeVisible();

  const admin = adminClient();
  const { data: leftover } = await admin
    .from("brokerages")
    .select("id")
    .eq("name", newBrokerageName)
    .maybeSingle();
  expect(leftover).toBeNull();
});

test("primeiro admin define senha a partir do convite → login", async ({ page }) => {
  await page.goto(inviteActionLink);
  await expect(page).toHaveURL(/\/set-password/);
  await expect(page.getByText("Defina sua senha")).toBeVisible();

  await page.fill("#password", password);
  await page.fill("#confirmPassword", password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/set-password"));

  // A home do brokerage_admin (/quotations) ainda não é uma rota implementada
  // — sem nenhum <Route> correspondente montado ali, nada reage ao SIGNED_OUT
  // navegando pra /login sozinho. Navega explicitamente.
  await page.evaluate(async () => {
    // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
    const mod = await import("/src/shared/lib/supabase/client.ts");
    await mod.supabase.auth.signOut();
  });
  await page.goto("/login");

  await page.fill('input[type="email"]', adminEmail);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
});
