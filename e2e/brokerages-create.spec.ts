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

  // Preenchimento manual dos campos de empresa (sem usar "Buscar") — a
  // chamada real à BrasilAPI/ViaCEP fica fora do escopo automatizado (ver
  // design.md, Testing Strategy). Intercepta o payload enviado à Edge
  // Function pra confirmar que esses campos chegam corretos até o backend.
  let invokeBody: Record<string, unknown> | undefined;
  await page.route("**/functions/v1/create-brokerage", async (route) => {
    invokeBody = route.request().postDataJSON();
    await route.continue();
  });

  const newBrokerageName = `Corretora UI E2E ${Date.now()}`;
  await page.fill("#brokerage_name", newBrokerageName);
  await page.fill("#trade_name", "Nome Fantasia E2E");
  await page.fill("#tax_id", "11222333000181");
  await page.fill("#representative_name", "Representante Via UI");
  await page.fill("#representative_email", `e2e-ui-admin-${Date.now()}@appseguro.dev`);
  await page.fill("#primary_color", "#123456");
  await page.click('button[type="submit"]');

  await expect(page.locator("[data-sonner-toast]")).toBeVisible();

  expect(invokeBody?.brokerage_name).toBe(newBrokerageName);
  expect(invokeBody?.trade_name).toBe("Nome Fantasia E2E");
  // Máscara de digitação aplicada no CNPJ — o payload chega com dígitos crus
  // (convertido de volta antes do submit, ver create-brokerage-drawer.tsx).
  expect(invokeBody?.tax_id).toBe("11222333000181");
  expect(invokeBody?.representative_name).toBe("Representante Via UI");
  expect(invokeBody?.primary_color).toBe("#123456");
  // Upload de logo depende do id retornado pela criação (fora do escopo
  // automatizado aqui, já que o convite falha por SMTP e a corretora é
  // desfeita — ver design.md); coberto no submit real de
  // own-brokerage-screen.test.tsx.

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
