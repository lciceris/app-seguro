import { supabase } from "@/shared/lib/supabase";

import { PLATFORM_BROKERAGE_ID } from "../../constants/platform-brokerage";

export async function listBrokerages() {
  const { data, error } = await supabase
    .from("brokerages")
    .select("*")
    .neq("id", PLATFORM_BROKERAGE_ID)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
