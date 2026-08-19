import { supabase } from "@/shared/lib/supabase";

export async function getQuotationQar(quotationId: string) {
  const { data, error } = await supabase
    .from("quotation_qar")
    .select("*")
    .eq("quotation_id", quotationId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
