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

test.describe("vehicles-create", () => {
  let brokerageId: string;
  let sellerAId: string;
  let sellerBId: string;
  let clientAId: string;
  const sellerAEmail = `e2e-vcreate-sellerA-${Date.now()}@appseguro.dev`;
  const sellerBEmail = `e2e-vcreate-sellerB-${Date.now()}@appseguro.dev`;

  test.beforeAll(async () => {
    const admin = adminClient();

    const { data: brokerage, error: brokerageError } = await admin
      .from("brokerages")
      .insert({ name: "Corretora E2E Vehicles Create" })
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

    sellerAId = await createTestUser(sellerAEmail, "seller", "Seller A E2E Vehicles");
    sellerBId = await createTestUser(sellerBEmail, "seller", "Seller B E2E Vehicles");

    const { data: clientA, error: clientAError } = await admin
      .from("clients")
      .insert({ brokerage_id: brokerageId, legal_name: "Cliente E2E Vehicles Seller A" })
      .select()
      .single();
    if (clientAError) throw clientAError;
    clientAId = clientA.id;
    const { error: linkError } = await admin
      .from("client_sellers")
      .insert({ client_id: clientAId, seller_id: sellerAId, is_primary: true });
    if (linkError) throw linkError;
  });

  test.afterAll(async () => {
    const admin = adminClient();
    await admin.from("client_sellers").delete().eq("client_id", clientAId);
    await admin.from("clients").delete().eq("id", clientAId);
    await admin.auth.admin.deleteUser(sellerAId);
    await admin.auth.admin.deleteUser(sellerBId);
    await admin.from("brokerages").delete().eq("id", brokerageId);
  });

  test("seller cadastra veículo só pra um cliente próprio → aparece na listagem dele → isolamento em cascata", async ({
    page,
  }) => {
    const plate = `E2E${Date.now().toString().slice(-4)}`;

    await login(page, sellerAEmail);
    await page.goto("/vehicles/add");

    await page.getByRole("combobox").first().click();
    const listbox = page.getByRole("listbox");
    await listbox.waitFor();
    await expect(listbox.getByText("Cliente E2E Vehicles Seller A")).toBeVisible();
    await listbox.getByText("Cliente E2E Vehicles Seller A").click();

    await page.fill("#plate", plate);
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByText("Veículo criado com sucesso")).toBeVisible();
    await expect(page).toHaveURL(/\/vehicles$/);
    await expect(page.getByText(plate)).toBeVisible();

    await page.evaluate(async () => {
      // @ts-expect-error - módulo só existe do ponto de vista do navegador em runtime
      const mod = await import("/src/shared/lib/supabase/client.ts");
      await mod.supabase.auth.signOut();
    });
    await page.goto("/login");

    await login(page, sellerBEmail);
    await page.goto("/vehicles");
    await expect(page.getByText("Nenhum veículo cadastrado ainda.")).toBeVisible();
  });
});
