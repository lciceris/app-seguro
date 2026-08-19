import { supabase } from "@/shared/lib/supabase";

// Busca reversa: qual apólice (se alguma) tem essa como `renewed_from_policy_id`
// — não é embed automático de FK, é uma segunda query simples.
export async function getRenewedByPolicy(policyId: string) {
  const { data, error } = await supabase
    .from("policies")
    .select("id, policy_number")
    .eq("renewed_from_policy_id", policyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
