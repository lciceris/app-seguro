import { supabase } from "@/shared/lib/supabase";

import type { PolicyWithRelations } from "../../types/policy";

export async function getPolicy(id: string) {
  const { data, error } = await supabase
    .from("policies")
    .select("*, clients(id, legal_name), insurers(id, name), quotations(id, number)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PolicyWithRelations;
}
