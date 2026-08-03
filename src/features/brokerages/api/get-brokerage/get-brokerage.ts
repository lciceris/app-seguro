import { supabase } from "@/shared/lib/supabase";

export async function getBrokerage(id: string) {
  const { data, error } = await supabase.from("brokerages").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}
