import { supabase } from "@/shared/lib/supabase";

import type { QuotationInsurerEventWithAuthor } from "../../types/quotation";

export async function listQuotationInsurerEvents(quotationInsurerId: string) {
  const { data, error } = await supabase
    .from("quotation_insurer_events")
    .select("*, users(id, full_name)")
    .eq("quotation_insurer_id", quotationInsurerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as QuotationInsurerEventWithAuthor[];
}
