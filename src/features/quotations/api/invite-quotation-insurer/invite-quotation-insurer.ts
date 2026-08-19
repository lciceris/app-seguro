import { supabase } from "@/shared/lib/supabase";

export interface InviteQuotationInsurerInput {
  quotation_id: string;
  insurer_id: string;
  brokerage_id: string;
}

export async function inviteQuotationInsurer(input: InviteQuotationInsurerInput) {
  const { data, error } = await supabase.from("quotation_insurers").insert(input).select().single();

  if (error) throw error;
  return data;
}
