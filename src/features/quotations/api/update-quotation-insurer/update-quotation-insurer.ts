import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface UpdateQuotationInsurerInput {
  id: string;
  response_status: Database["public"]["Enums"]["insurer_response_status"];
  premium_amount: number | null;
  deductible_amount: number | null;
  commission_rate: number | null;
  installments_count: number | null;
  insurer_quotation_number: string | null;
  approved_coverages: string | null;
  analyst_notes: string | null;
  responded_at: string | null;
}

export async function updateQuotationInsurer({ id, ...values }: UpdateQuotationInsurerInput) {
  const { data, error } = await supabase
    .from("quotation_insurers")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
