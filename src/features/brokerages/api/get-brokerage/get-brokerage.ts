import { supabase } from "@/shared/lib/supabase";

import type { BrokerageWithPlan } from "../../types/brokerage";

export async function getBrokerage(id: string) {
  const { data, error } = await supabase
    .from("brokerages")
    .select("*, plans(name)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as BrokerageWithPlan;
}
