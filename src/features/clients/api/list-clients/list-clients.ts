import { supabase } from "@/shared/lib/supabase";

export async function listClients() {
  const { data, error } = await supabase.from("clients").select("*").order("legal_name");

  if (error) throw error;
  return data;
}
