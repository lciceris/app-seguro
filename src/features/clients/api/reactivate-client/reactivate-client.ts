import { supabase } from "@/shared/lib/supabase";

export async function reactivateClient(id: string) {
  const { data, error } = await supabase
    .from("clients")
    .update({ segment: "active" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
