import { supabase } from "@/shared/lib/supabase";

// Mesmo conjunto de campos de empresa da criação — logo/cor continuam
// exclusivos do brokerage_admin (ver update-own-brokerage), e status é uma
// ação separada (deactivate-brokerage/reactivate-brokerage), nunca um UPDATE
// genérico.
export interface UpdateBrokerageInput {
  id: string;
  name: string;
  plan_id: string | null;
  plan_expires_at: string | null;
  trade_name: string | null;
  tax_id: string | null;
  business_code: string | null;
  state_registration: string | null;
  email: string | null;
  phone: string | null;
  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  representative_name: string | null;
  representative_email: string | null;
  financial_name: string | null;
  financial_email: string | null;
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
