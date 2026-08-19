import { supabase } from "@/shared/lib/supabase";

export interface UpdatePolicyInput {
  id: string;
  policy_number: string | null;
  coverage_start: string | null;
  coverage_end: string | null;
  premium_amount: number | null;
  total_fleet_value: number | null;
}

export async function updatePolicy({ id, ...values }: UpdatePolicyInput) {
  const { data, error } = await supabase
    .from("policies")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
