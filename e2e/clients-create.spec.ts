import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const password = "TesteSenha123!";

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}

test.describe("clients-create", () => {
  let brokerageId: string;
  let sellerAId: string;
  let sellerBId: string;
  let supervisorId: string;
  const sellerAEmail = `e2e-cclients-sellerA-${Date.now()}@appseguro.dev`;
  const sellerBEmail = `e2e-cclients-sellerB-${Date.now()}@appseguro.dev`;
  const supervisorEmail = `e2e-cclients-supervisor-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();

    const { data: brokerage, error: brokerageError } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E Clients Create" })
      .select()
      .single();
    if (brokerageError) throw brokerageError;
    brokerageId = brokerage.id;

    async function createTestUser(email: string, role: string, fullName: string) {
      const { data: auth, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (authError) throw authError;
      const { error: userError } = await admin.from("users").insert({
        id: auth.user.id,
        brokerage_id: brokerageId,
        role,
        status: "active",
        full_name: fullName,
        email,
      });
      if (userError) throw userError;
      return auth.user.id;
    }

    sellerAId = await createTestUser(sellerAEmail, "seller", "Seller A E2E Clients");
    sellerBId = await createTestUser(sellerBEmail, "seller", "Seller B E2E Clients");
    supervisorId = await createTestUser(supervisorEmail, "supervisor", "Supervisor E2E Clients");
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.auth.admin.deleteUser(sellerAId);
    await admin.auth.admin.deleteUser(sellerBId);
    await admin.auth.admin.deleteUser(supervisorId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller cadastra cliente → vínculo automático como principal → isolamento entre sellers", async ({
    page,
  }) => {
    const clientName = `Cliente E2E Seller ${Date.now()}`;

    await login(page, sellerAEmail);
    await page.goto("/clients/add");
    await expect(page.getByText("Vendedores responsáveis")).toHaveCount(0);

    await page.fill("#legal_name", clientName);
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByText("Cliente criado com sucesso")).toBeVisible();
    await expect(page).toHaveURL(/\/clients$/);
    await expect(page.getByText(clientName)).toBeVisible();

    await page.evaluate(async () => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      await mod.supabase.auth.signOut();
    });
    await page.goto("/login");

    await login(page, sellerBEmail);
    await page.goto("/clients");
    await expect(page.getByText("Nenhum cliente cadastrado ainda.")).toBeVisible();
  });

  test("supervisor cadastra cliente escolhendo dois vendedores → detalhe mostra ambos, um principal", async ({
    page,
  }) => {
    const clientName = `Cliente E2E Supervisor ${Date.now()}`;

    await login(page, supervisorEmail);
    await page.goto("/clients/add");
    await expect(page.getByText("Vendedores responsáveis")).toBeVisible();

    await page.fill("#legal_name", clientName);
    await page.getByLabel("Seller A E2E Clients").click();
    await page.getByLabel("Seller B E2E Clients").click();
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByText("Cliente criado com sucesso")).toBeVisible();
    await expect(page).toHaveURL(/\/clients$/);

    const row = page.locator("tr", { hasText: clientName });
    await row.waitFor();
    await row.locator('a[href*="/clients/"]').first().click();

    const drawer = page.getByRole("dialog");
    await expect(drawer.getByText("Seller A E2E Clients")).toBeVisible();
    await expect(drawer.getByText("Seller B E2E Clients")).toBeVisible();
    await expect(drawer.getByText("Principal")).toBeVisible();
  });
});
