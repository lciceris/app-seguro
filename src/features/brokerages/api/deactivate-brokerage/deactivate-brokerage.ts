import { supabase } from "@/shared/lib/supabase";

export async function deactivateBrokerage(id: string) {
  const { data, error } = await supabase
    .from("brokerages")
    .update({ status: "inactive" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
