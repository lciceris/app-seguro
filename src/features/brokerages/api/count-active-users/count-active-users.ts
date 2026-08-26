import { supabase } from "@/shared/lib/supabase";

export async function countActiveUsers(brokerageId: string) {
  const { data, error } = await supabase.rpc("count_active_users", {
    p_brokerage_id: brokerageId,
  });

  if (error) throw error;
  return data;
}
