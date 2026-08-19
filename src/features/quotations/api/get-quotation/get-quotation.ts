import { supabase } from "@/shared/lib/supabase";

import type { QuotationWithRelations } from "../../types/quotation";

export async function getQuotation(id: string) {
  const { data, error } = await supabase
    .from("quotations")
    .select("*, clients(id, legal_name), seller:users!quotations_seller_id_fkey(id, full_name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as QuotationWithRelations;
}
