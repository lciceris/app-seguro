import { supabase } from "@/shared/lib/supabase";

import type { QuotationInsurerWithInsurer } from "../../types/quotation";

export async function listQuotationInsurers(quotationId: string) {
  const { data, error } = await supabase
    .from("quotation_insurers")
    .select("*, insurers(id, name)")
    .eq("quotation_id", quotationId)
    .order("created_at");

  if (error) throw error;
  return data as QuotationInsurerWithInsurer[];
}
