import { supabase } from "@/shared/lib/supabase";

export interface RemoveQuotationVehicleInput {
  quotation_id: string;
  vehicle_id: string;
}

export async function removeQuotationVehicle({
  quotation_id,
  vehicle_id,
}: RemoveQuotationVehicleInput) {
  const { error } = await supabase
    .from("quotation_vehicles")
    .delete()
    .eq("quotation_id", quotation_id)
    .eq("vehicle_id", vehicle_id);

  if (error) throw error;
}
