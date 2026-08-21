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

test.describe("app-shell", () => {
  let brokerageId: string;
  let sellerId: string;

  const sellerEmail = `e2e-shell-seller-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();
    const { data: brokerage } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E Shell" })
      .select()
      .single();
    brokerageId = brokerage!.id;

    const { data: auth } = await admin.auth.admin.createUser({
      email: sellerEmail,
      password,
      email_confirm: true,
    });
    sellerId = auth!.user!.id;
    await admin.from("users").insert({
      id: sellerId,
      brokerage_id: brokerageId,
      role: "seller",
      status: "active",
      full_name: "Seller Shell",
      email: sellerEmail,
    });
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.auth.admin.deleteUser(sellerId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller vê só os itens de menu do seu perfil, e navegar pela sidebar troca de página", async ({
    page,
  }) => {
    await login(page, sellerEmail);

    await expect(page.getByRole("link", { name: "Cotações" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Apólices" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Clientes" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Veículos" })).toBeVisible();

    await expect(page.getByRole("link", { name: "Usuários" })).not.toBeVisible();
    await expect(page.getByText("Minha corretora")).not.toBeVisible();
    await expect(page.getByText("Plataforma")).not.toBeVisible();

    await page.getByRole("link", { name: "Apólices" }).click();
    await page.waitForURL(/\/policies$/);
    await expect(page.getByText("Nenhuma apólice emitida ainda.")).toBeVisible();

    await page.getByRole("button", { name: "Seller Shell" }).click();
    await expect(page.getByText(sellerEmail)).toBeVisible();
    await page.getByText("Sair").click();
    await page.waitForURL(/\/login$/);
  });
});
