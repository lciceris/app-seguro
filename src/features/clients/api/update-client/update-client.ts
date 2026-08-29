import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface UpdateClientInput {
  id: string;
  client_type: Database["public"]["Enums"]["client_type"];
  legal_name: string;
  trade_name: string | null;
  tax_id: string | null;
  birth_date: string | null;
  business_code: string | null;
  industry: string | null;
  state_registration: string | null;
  zip_code: string | null;
  street: string | null;
  street_number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  contact_name: string | null;
  contact_role: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  financial_name: string | null;
  financial_email: string | null;
  notes: string | null;
}

export async function updateClient({ id, ...values }: UpdateClientInput) {
  const { data, error } = await supabase
    .from("clients")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
