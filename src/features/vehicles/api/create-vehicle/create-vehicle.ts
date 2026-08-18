import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface CreateVehicleInput {
  brokerage_id: string;
  client_id: string;
  plate: string;
  chassis: string | null;
  identification_code: string | null;
  renavam: string | null;
  brand: string | null;
  model: string | null;
  manufacture_year: number | null;
  model_year: number | null;
  vehicle_type: Database["public"]["Enums"]["vehicle_type"] | null;
  vehicle_usage: Database["public"]["Enums"]["vehicle_usage"] | null;
  fuel_type: string | null;
  fipe_code: string | null;
  fipe_value: number | null;
  declared_value: number | null;
  overnight_zip_code: string | null;
  main_state: string | null;
  has_tracker: boolean;
  tracker_model: string | null;
  accessories: string | null;
  main_driver: string | null;
  has_claim_history: boolean;
  notes: string | null;
}

export async function createVehicle(input: CreateVehicleInput) {
  const { data, error } = await supabase.from("vehicles").insert(input).select().single();

  if (error) throw error;
  return data;
}
