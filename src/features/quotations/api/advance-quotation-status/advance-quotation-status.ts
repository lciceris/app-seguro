import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface AdvanceQuotationStatusInput {
  id: string;
  status: Database["public"]["Enums"]["quotation_status"];
  lost_reason?: string | null;
}

// A validação de qual transição é permitida pra qual role fica no trigger
// enforce_quotation_status_transition (banco) — aqui é só o UPDATE; o
// frontend só mostra os botões válidos, mas quem garante de verdade é o
// trigger (ver .agents/specs/quotations/design.md).
export async function advanceQuotationStatus({
  id,
  status,
  lost_reason,
}: AdvanceQuotationStatusInput) {
  const values: { status: Database["public"]["Enums"]["quotation_status"]; lost_reason?: string } =
    { status };
  if (lost_reason !== undefined && lost_reason !== null) {
    values.lost_reason = lost_reason;
  }

  const { data, error } = await supabase
    .from("quotations")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
