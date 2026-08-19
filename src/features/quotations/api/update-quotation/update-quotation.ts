import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface UpdateQuotationInput {
  id: string;
  client_id: string;
  seller_id: string | null;
  quotation_type: Database["public"]["Enums"]["quotation_type"] | null;
  coverage_start: string | null;
  coverage_end: string | null;
  coverages: string[] | null;
  deductible_pref: string | null;
  due_date: string | null;
  seller_notes: string | null;
}

export async function updateQuotation({ id, ...values }: UpdateQuotationInput) {
  const { data, error } = await supabase
    .from("quotations")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
