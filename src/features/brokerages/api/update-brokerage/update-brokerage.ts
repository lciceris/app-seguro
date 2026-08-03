import { supabase } from "@/shared/lib/supabase";

// Só nome e plano — logo/cor são responsabilidade exclusiva do brokerage_admin
// da própria corretora (ver update-own-brokerage), e status é uma ação separada
// (deactivate-brokerage/reactivate-brokerage), nunca um UPDATE genérico.
export interface UpdateBrokerageInput {
  id: string;
  name: string;
  plan_id: string | null;
}

export async function updateBrokerage({ id, ...values }: UpdateBrokerageInput) {
  const { data, error } = await supabase
    .from("brokerages")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
