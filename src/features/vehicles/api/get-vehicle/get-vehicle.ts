import { supabase } from "@/shared/lib/supabase";

import type { VehicleWithClient } from "../../types/vehicle";

export async function getVehicle(id: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, clients(id, legal_name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as VehicleWithClient;
}
