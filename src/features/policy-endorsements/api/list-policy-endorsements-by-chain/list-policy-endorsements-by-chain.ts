import { supabase } from "@/shared/lib/supabase";

import type { PolicyEndorsementWithVehicle } from "../../types/policy-endorsement";

// Lista os endossos de toda a linha lógica de uma apólice (todas as versões
// da cadeia), não só da versão sendo vista — ver
// .agents/specs/policy-endorsements/design.md. Sem embed em root_policy_id
// (self-referencing FK — embeds nesse tipo de coluna já se mostraram não
// confiáveis no projeto, ver spec `policies`): resolve a raiz da cadeia com
// uma query, lista os ids da cadeia com outra, e busca os endossos por
// último.
export async function listPolicyEndorsementsByChain(policyId: string) {
  const { data: policy, error: policyError } = await supabase
    .from("policies")
    .select("id, root_policy_id")
    .eq("id", policyId)
    .single();
  if (policyError) throw policyError;

  const rootId = policy.root_policy_id ?? policy.id;

  const { data: chainPolicies, error: chainError } = await supabase
    .from("policies")
    .select("id")
    .or(`id.eq.${rootId},root_policy_id.eq.${rootId}`);
  if (chainError) throw chainError;

  const policyIds = chainPolicies.map((p) => p.id);

  const { data, error } = await supabase
    .from("policy_endorsements")
    .select("*, vehicles(id, plate, brand, model)")
    .in("policy_id", policyIds)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as PolicyEndorsementWithVehicle[];
}
