import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Functions usam o cliente service role, que ignora RLS por completo
 * (ver docs/architecture/backend/adr/003-edge-functions-scope.md). Sem essa
 * verificação, qualquer usuário autenticado poderia chamar a função direto
 * (fora da UI) e convidar/resetar senha de qualquer um, de qualquer corretora.
 * Aqui validamos o JWT de quem chamou com o cliente ANON (respeitando RLS) e
 * checamos o role via get_my_role()/get_my_brokerage_id().
 */
export async function verifyAdmin(req: Request) {
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
  if (roleError || !role || !["brokerage_admin", "platform_admin"].includes(role)) {
    return { error: "Sem permissão", status: 403 } as const;
  }

  const { data: brokerageId, error: brokerageError } =
    await supabaseClient.rpc("get_my_brokerage_id");
  if (brokerageError || !brokerageId) {
    return { error: "Sem permissão", status: 403 } as const;
  }

  return { user, role, brokerageId } as const;
}
