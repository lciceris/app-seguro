import { supabase } from "@/shared/lib/supabase";

export async function deactivateClient(id: string) {
  const { data, error } = await supabase
    .from("clients")
    .update({ segment: "inactive" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
