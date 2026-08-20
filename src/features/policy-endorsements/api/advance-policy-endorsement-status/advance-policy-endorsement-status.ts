import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface AdvancePolicyEndorsementStatusInput {
  id: string;
  status: Database["public"]["Enums"]["policy_endorsement_status"];
  insurer_response_notes?: string | null;
  premium_adjustment?: number | null;
  client_response_notes?: string | null;
  not_closed_reason?: string | null;
}

// A validação de qual transição é permitida pra qual role fica no trigger
// enforce_policy_endorsement_status_transition (banco) — aqui é só o UPDATE;
// o frontend só mostra as ações válidas, mas quem garante de verdade é o
// trigger. A efetivação de verdade (nova versão de policies, policy_vehicles
// etc.) acontece no trigger apply_policy_endorsement_effect, disparado pelo
// mesmo UPDATE quando status vira 'effected' (ver
// .agents/specs/policy-endorsements/design.md).
export async function advancePolicyEndorsementStatus({
  id,
  status,
  insurer_response_notes,
  premium_adjustment,
  client_response_notes,
  not_closed_reason,
}: AdvancePolicyEndorsementStatusInput) {
  const values: Database["public"]["Tables"]["policy_endorsements"]["Update"] = { status };
  if (insurer_response_notes !== undefined) values.insurer_response_notes = insurer_response_notes;
  if (premium_adjustment !== undefined) values.premium_adjustment = premium_adjustment;
  if (client_response_notes !== undefined) values.client_response_notes = client_response_notes;
  if (not_closed_reason !== undefined) values.not_closed_reason = not_closed_reason;

  const { data, error } = await supabase
    .from("policy_endorsements")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
