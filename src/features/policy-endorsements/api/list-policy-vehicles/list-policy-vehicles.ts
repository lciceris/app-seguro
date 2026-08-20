import { supabase } from "@/shared/lib/supabase";

import type { PolicyVehicleWithVehicle } from "../../types/policy-endorsement";

export async function listPolicyVehicles(policyId: string) {
  const { data, error } = await supabase
    .from("policy_vehicles")
    .select("*, vehicles(id, plate, brand, model)")
    .eq("policy_id", policyId);

  if (error) throw error;
  return data as PolicyVehicleWithVehicle[];
}
