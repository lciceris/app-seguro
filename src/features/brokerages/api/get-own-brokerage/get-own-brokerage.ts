import { supabase } from "@/shared/lib/supabase";

export async function getOwnBrokerage(brokerageId: string) {
  const { data, error } = await supabase
    .from("brokerages")
    .select("*")
    .eq("id", brokerageId)
    .single();

  if (error) throw error;
  return data;
}
