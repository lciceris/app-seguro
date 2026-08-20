import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

// Só os campos preenchíveis na abertura do endosso — negociação, resposta do
// cliente e efetivação ficam de fora (preenchidos depois, via
// advance-policy-endorsement-status ou pelo trigger apply_policy_endorsement_effect).
export type CreatePolicyEndorsementInput = Omit<
  Database["public"]["Tables"]["policy_endorsements"]["Insert"],
  | "id"
  | "created_at"
  | "updated_at"
  | "status"
  | "insurer_response_notes"
  | "responded_at"
  | "responded_by"
  | "premium_adjustment"
  | "client_response_notes"
  | "client_responded_at"
  | "client_responded_by"
  | "not_closed_reason"
  | "new_policy_id"
  | "effected_at"
  | "effected_by"
>;

export async function createPolicyEndorsement(input: CreatePolicyEndorsementInput) {
  const { data, error } = await supabase
    .from("policy_endorsements")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}
