import { supabase } from "@/shared/lib/supabase";

import type { VehicleWithClient } from "../../types/vehicle";

export async function listVehicles() {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, clients(id, legal_name)")
    .order("plate");

  if (error) throw error;
  return data as VehicleWithClient[];
}
