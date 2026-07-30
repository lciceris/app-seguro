import { supabase } from "@/shared/lib/supabase";

export async function reactivateUser(id: string) {
  const { data, error } = await supabase
    .from("users")
    .update({ status: "active" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
