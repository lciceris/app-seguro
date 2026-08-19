import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

// client_id não entra aqui de propósito — trocar o cliente de uma cotação
// que já tem quotation_vehicles quebraria a checagem de integridade do
// trigger validate_quotation_vehicle (veículo precisa ser do mesmo cliente
// da cotação). A Task 6 do design.md já delimitava a edição só aos campos
// gerais, sem client_id.
export interface UpdateQuotationInput {
  id: string;
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
