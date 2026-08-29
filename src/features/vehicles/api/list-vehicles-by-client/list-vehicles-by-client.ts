import { supabase } from "@/shared/lib/supabase";

import type { Vehicle } from "../../types/vehicle";

export async function listVehiclesByClient(clientId: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("client_id", clientId)
    .order("plate");

  if (error) throw error;
  return data as Vehicle[];
}
