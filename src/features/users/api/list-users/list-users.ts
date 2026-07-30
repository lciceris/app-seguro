import { supabase } from "@/shared/lib/supabase";

export async function listUsers() {
  const { data, error } = await supabase.from("users").select("*").order("full_name");

  if (error) throw error;
  return data;
}
