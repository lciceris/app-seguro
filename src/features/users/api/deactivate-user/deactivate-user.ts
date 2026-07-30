import { supabase } from "@/shared/lib/supabase";

export async function deactivateUser(id: string) {
  const { data, error } = await supabase
    .from("users")
    .update({ status: "inactive" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
