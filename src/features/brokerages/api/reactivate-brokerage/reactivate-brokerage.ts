import { supabase } from "@/shared/lib/supabase";

export async function reactivateBrokerage(id: string) {
  const { data, error } = await supabase
    .from("brokerages")
    .update({ status: "active" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
