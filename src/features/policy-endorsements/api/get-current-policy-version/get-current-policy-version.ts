import { supabase } from "@/shared/lib/supabase";

// Dado qualquer policy_id de uma cadeia, acha a versão que não foi
// substituída por endosso (a única sem sucessora dentro da cadeia de
// root_policy_id) — usada pra indicar "essa não é a versão mais recente" e
// linkar pra ela (Requirement 12.3). `superseded` é o único status que
// significa "tem sucessora"; `active`/`cancelled`/`renewed` são todos
// terminais dentro dessa cadeia. Ver .agents/specs/policy-endorsements/design.md.
export async function getCurrentPolicyVersion(policyId: string) {
  const { data: policy, error: policyError } = await supabase
    .from("policies")
    .select("id, root_policy_id")
    .eq("id", policyId)
    .single();
  if (policyError) throw policyError;

  const rootId = policy.root_policy_id ?? policy.id;

  const { data, error } = await supabase
    .from("policies")
    .select("id, policy_number, status")
    .or(`id.eq.${rootId},root_policy_id.eq.${rootId}`)
    .neq("status", "superseded")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
