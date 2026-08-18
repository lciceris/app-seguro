import { supabase } from "@/shared/lib/supabase";

export async function deactivateVehicle(id: string) {
  const { data, error } = await supabase
    .from("vehicles")
    .update({ is_active: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
