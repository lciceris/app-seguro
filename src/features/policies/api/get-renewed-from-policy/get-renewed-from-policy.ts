import { supabase } from "@/shared/lib/supabase";

// Busca direta: dado um `renewed_from_policy_id`, pega o número da apólice
// anterior — query separada em vez de embed self-referencing na mesma
// tabela (`policies!policies_renewed_from_policy_id_fkey`), porque esse
// embed se mostrou não confiável nesse projeto Supabase hospedado: o cache
// de relações do PostgREST não reconhecia a FK mesmo com o nome de
// constraint certo (confirmado via `pg_constraint`) e o `NOTIFY pgrst,
// 'reload schema'` não resolveu. Query separada evita depender disso.
export async function getRenewedFromPolicy(id: string) {
  const { data, error } = await supabase
    .from("policies")
    .select("id, policy_number")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}
