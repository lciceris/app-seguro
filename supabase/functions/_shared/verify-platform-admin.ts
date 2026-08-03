import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Gerenciar corretoras é a única operação cross-tenant legítima da plataforma
 * (ver .agents/specs/brokerages/design.md) — diferente de `verify-admin.ts`, não
 * faz sentido comparar contra o `brokerage_id` de quem chama, já que a própria
 * ação é sempre sobre uma corretora que não é a de quem está gerenciando.
 * Confirma só que o role é `platform_admin`.
 */
export async function verifyPlatformAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return { error: "Não autenticado", status: 401 } as const;
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const {
    data: { user },
    error: userError,
  } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    return { error: "Não autenticado", status: 401 } as const;
  }

  const { data: role, error: roleError } = await supabaseClient.rpc("get_my_role");
  if (roleError || role !== "platform_admin") {
    return { error: "Sem permissão", status: 403 } as const;
  }

  return { user, role } as const;
}
