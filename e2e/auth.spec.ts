import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const email = `e2e-${Date.now()}@appseguro.dev`;
const password = "TesteSenha123!";

let brokerageId: string;
let userId: string;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.beforeAll(async () => {
  const admin = adminClient();

  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E" })
    .select()
    .single();
  if (brokerageError) throw brokerageError;
  brokerageId = brokerage.id;

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) throw authError;
  userId = authUser.user.id;

  const { error: userError } = await admin.from("users").insert({
    id: userId,
    brokerage_id: brokerageId,
    role: "seller",
    status: "active",
    full_name: "Usuário E2E",
    email,
  });
  if (userError) throw userError;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.auth.admin.deleteUser(userId);
  await admin.from("brokerages").delete().eq("id", brokerageId);
});

test("login → redirect por perfil → sessão persiste no reload → logout", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL("/");
  await expect(page.getByText("em construção")).toBeVisible();

  await page.reload();
  await expect(page.getByText("em construção")).toBeVisible();

  await page.evaluate(async () => {
    // Caminho resolvido pelo dev server do Vite no navegador, não pelo TS do Node.
    // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
    const mod = await import("/src/shared/lib/supabase/client.ts");
    await mod.supabase.auth.signOut();
  });
  await page.waitForURL("**/login");
});
