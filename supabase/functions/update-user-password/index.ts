import { createClient } from "jsr:@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
import { verifyAdmin } from "../_shared/verify-admin.ts";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const auth = await verifyAdmin(req);
  if ("error" in auth) {
    return jsonResponse({ error: auth.error }, auth.status);
  }

  const { user_id, new_password } = await req.json();

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Garante que o usuário-alvo é da mesma corretora de quem está resetando a senha.
  const { data: targetUser, error: targetError } = await supabaseAdmin
    .from("users")
    .select("brokerage_id")
    .eq("id", user_id)
    .single();
  if (targetError || !targetUser) {
    return jsonResponse({ error: "Usuário não encontrado" }, 404);
  }
  if (targetUser.brokerage_id !== auth.brokerageId) {
    return jsonResponse({ error: "Corretora inválida" }, 403);
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
    password: new_password,
  });
  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  return jsonResponse({ success: true });
});
