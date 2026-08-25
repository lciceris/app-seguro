import { createClient } from "jsr:@supabase/supabase-js@2";

import { corsHeaders } from "../_shared/cors.ts";
import { verifyPlatformAdmin } from "../_shared/verify-platform-admin.ts";

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

  const auth = await verifyPlatformAdmin(req);
  if ("error" in auth) {
    return jsonResponse({ error: auth.error }, auth.status);
  }

  const {
    brokerage_name,
    plan_id,
    plan_expires_at,
    primary_color,
    trade_name,
    tax_id,
    business_code,
    state_registration,
    email,
    phone,
    zip_code,
    street,
    street_number,
    complement,
    neighborhood,
    city,
    state,
    representative_name,
    representative_email,
    financial_name,
    financial_email,
  } = await req.json();

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: brokerage, error: brokerageError } = await supabaseAdmin
    .from("brokerages")
    .insert({
      name: brokerage_name,
      plan_id,
      plan_expires_at,
      primary_color,
      trade_name,
      tax_id,
      business_code,
      state_registration,
      email,
      phone,
      zip_code,
      street,
      street_number,
      complement,
      neighborhood,
      city,
      state,
      representative_name,
      representative_email,
      financial_name,
      financial_email,
    })
    .select()
    .single();
  if (brokerageError) {
    return jsonResponse({ error: brokerageError.message }, 400);
  }

  const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:5173";

  // O representante é convidado como primeiro brokerage_admin — não existe um
  // "admin" separado do representante (ver requirements.md, Requirement 2).
  const { data: invited, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    representative_email,
    { redirectTo: `${appUrl}/set-password` },
  );
  if (inviteError) {
    // Rollback: sem admin, a corretora fica órfã — nunca deixar isso acontecer
    // (ver .agents/specs/brokerages/requirements.md, Requirement 2.2).
    await supabaseAdmin.from("brokerages").delete().eq("id", brokerage.id);
    return jsonResponse({ error: inviteError.message }, 400);
  }

  const { error: userError } = await supabaseAdmin.from("users").insert({
    id: invited.user.id,
    brokerage_id: brokerage.id,
    role: "brokerage_admin",
    status: "active",
    full_name: representative_name,
    email: representative_email,
  });
  if (userError) {
    await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
    await supabaseAdmin.from("brokerages").delete().eq("id", brokerage.id);
    return jsonResponse({ error: userError.message }, 400);
  }

  return jsonResponse({ brokerage });
});
