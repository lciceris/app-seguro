import { supabase } from "@/shared/lib/supabase";

export async function getClient(id: string) {
  const { data, error } = await supabase.from("clients").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}
