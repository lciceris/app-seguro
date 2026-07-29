import { createClient } from "jsr:@supabase/supabase-js@2";

import { verifyAdmin } from "../_shared/verify-admin.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const auth = await verifyAdmin(req);
  if ("error" in auth) {
    return jsonResponse({ error: auth.error }, auth.status);
  }

  const { full_name, email, phone, role, brokerage_id } = await req.json();

  // O convite só pode ser pra própria corretora de quem está convidando —
  // nunca confiar no brokerage_id vindo do payload sem checar.
  if (brokerage_id !== auth.brokerageId) {
    return jsonResponse({ error: "Corretora inválida" }, 403);
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: canAdd, error: canAddError } = await supabaseAdmin.rpc("can_add_user", {
    p_brokerage_id: brokerage_id,
  });
  if (canAddError) {
    return jsonResponse({ error: canAddError.message }, 400);
  }
  if (!canAdd) {
    return jsonResponse({ error: "Limite de usuários do plano atingido." }, 422);
  }

  const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:5173";

  const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    { redirectTo: `${appUrl}/set-password` },
  );
  if (inviteError) {
    return jsonResponse({ error: inviteError.message }, 400);
  }

  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: invited.user.id,
    brokerage_id,
    role,
    status: "active",
    full_name,
    email,
    phone: phone ?? null,
  });
  if (userError) {
    // Rollback: se o insert em `users` falhar, não deixar o usuário do Auth órfão.
    await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
    return jsonResponse({ error: userError.message }, 400);
  }

  return jsonResponse({ success: true });
});
