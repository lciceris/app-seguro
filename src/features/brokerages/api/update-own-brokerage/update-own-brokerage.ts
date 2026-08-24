import { supabase } from "@/shared/lib/supabase";

// Só identidade visual e dados de empresa — plano e status são exclusivos do
// platform_admin (ver update-brokerage/deactivate-brokerage/reactivate-brokerage).
export interface UpdateOwnBrokerageInput {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
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
