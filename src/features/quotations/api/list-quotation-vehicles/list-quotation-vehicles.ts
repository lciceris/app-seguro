import { supabase } from "@/shared/lib/supabase";

import type { QuotationVehicleWithVehicle } from "../../types/quotation";

export async function listQuotationVehicles(quotationId: string) {
  const { data, error } = await supabase
    .from("quotation_vehicles")
    .select("*, vehicles(id, plate, brand, model)")
    .eq("quotation_id", quotationId);

  if (error) throw error;
  return data as QuotationVehicleWithVehicle[];
}
