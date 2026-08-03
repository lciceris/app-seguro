import { supabase } from "@/shared/lib/supabase";

// Só identidade visual — plano e status são exclusivos do platform_admin
// (ver update-brokerage/deactivate-brokerage/reactivate-brokerage).
export interface UpdateOwnBrokerageInput {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
}

export async function updateOwnBrokerage({ id, ...values }: UpdateOwnBrokerageInput) {
  const { data, error } = await supabase
    .from("brokerages")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
