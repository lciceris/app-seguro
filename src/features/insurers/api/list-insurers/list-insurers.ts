import { supabase } from "@/shared/lib/supabase";

export async function listInsurers() {
  const { data, error } = await supabase
    .from("insurers")
    .select("*")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}
