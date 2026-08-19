import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface UpdateQuotationVehicleInput {
  quotation_id: string;
  vehicle_id: string;
  coverage_type: Database["public"]["Enums"]["coverage_type"] | null;
  casco_percentage: number | null;
  casco_value: number | null;
  franchise_type: Database["public"]["Enums"]["franchise_type"] | null;
  bonus: number | null;
  claims_count: number | null;
  rcf_dm: number | null;
  rcf_dc: number | null;
  rcf_dmo: number | null;
  app_death: number | null;
  app_disability: number | null;
  assistance: string | null;
  glass_coverage: Database["public"]["Enums"]["glass_coverage_level"] | null;
  reserve_car: string | null;
  bodywork_value: number | null;
  bodywork_type: string | null;
  equipment_value: number | null;
  equipment_type: string | null;
  armoring_value: number | null;
}

export async function updateQuotationVehicle({
  quotation_id,
  vehicle_id,
  ...values
}: UpdateQuotationVehicleInput) {
  const { data, error } = await supabase
    .from("quotation_vehicles")
    .update(values)
    .eq("quotation_id", quotation_id)
    .eq("vehicle_id", vehicle_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
