import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface CreateQuotationInput {
  brokerage_id: string;
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

export async function createQuotation(input: CreateQuotationInput) {
  // `number` é sobrescrito pelo trigger generate_quotation_number (BEFORE
  // INSERT) — o valor aqui nunca é usado, mas a coluna não tem DEFAULT (só
  // trigger), então o tipo gerado exige o campo.
  const { data, error } = await supabase
    .from("quotations")
    .insert({ ...input, number: "" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
