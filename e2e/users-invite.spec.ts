import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const email = `e2e-invite-${Date.now()}@appseguro.dev`;
const password = "SenhaConvite123!";

let brokerageId: string;
let userId: string;
let inviteActionLink: string;

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

test.beforeAll(async () => {
  const admin = adminClient();

  const { data: brokerage, error: brokerageError } = await admin
    .from("brokerages")
    .insert({ name: "Corretora E2E Convite" })
    .select()
    .single();
  if (brokerageError) throw brokerageError;
  brokerageId = brokerage.id;

  // O SMTP sandbox do Supabase rejeita domínios de teste / bate rate limit
  // (ver tasks.md das Tasks 2 e 5 da spec users) — não é possível disparar o
  // e-mail de convite de verdade neste ambiente. `generateLink` usa a mesma
  // infraestrutura de invite do Supabase Auth que `inviteUserByEmail` (mesmo
  // link, mesmo mecanismo de troca de token por sessão), só sem depender do
  // envio de e-mail — o que este teste cobre é exatamente o que o frontend
  // controla: definir senha a partir do link de convite → primeiro login.
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "invite",
    email,
    options: { redirectTo: "http://localhost:5173/set-password" },
  });
  if (linkError) throw linkError;
  userId = linkData.user.id;
  inviteActionLink = linkData.properties.action_link;

  const { error: userError } = await admin.from("users").insert({
    id: userId,
    brokerage_id: brokerageId,
    role: "seller",
    status: "active",
    full_name: "Convidado E2E",
    email,
  });
  if (userError) throw userError;
});

test.afterAll(async () => {
  const admin = adminClient();
  await admin.auth.admin.deleteUser(userId);
  await admin.from("brokerages").delete().eq("id", brokerageId);
});

test("convite → definir senha → primeiro login", async ({ page }) => {
  await page.goto(inviteActionLink);
  // O link de convite já entrega a navegação em /set-password (o Supabase troca o
  // token pela sessão e redireciona antes do goto() resolver) — não há uma NOVA
  // navegação pra aguardar aqui, só confirmar onde a página já está.
  await expect(page).toHaveURL(/\/set-password/);
  await expect(page.getByText("Defina sua senha")).toBeVisible();

  await page.fill("#password", password);
  await page.fill("#confirmPassword", password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/");

  await page.evaluate(async () => {
    // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
    const mod = await import("/src/shared/lib/supabase/client.ts");
    await mod.supabase.auth.signOut();
  });
  await page.waitForURL("**/login");

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/");
});
