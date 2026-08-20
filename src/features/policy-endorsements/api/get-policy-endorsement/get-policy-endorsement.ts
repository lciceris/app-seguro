import { supabase } from "@/shared/lib/supabase";

import type { PolicyEndorsementWithVehicle } from "../../types/policy-endorsement";

export async function getPolicyEndorsement(id: string) {
  const { data, error } = await supabase
    .from("policy_endorsements")
    .select("*, vehicles(id, plate, brand, model)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PolicyEndorsementWithVehicle;
}
