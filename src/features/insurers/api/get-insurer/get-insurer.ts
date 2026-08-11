import { supabase } from "@/shared/lib/supabase";

export async function getInsurer(id: string) {
  const { data, error } = await supabase.from("insurers").select("*").eq("id", id).single();

  if (error) throw error;
  return data;
}
