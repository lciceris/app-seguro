import { supabase } from "@/shared/lib/supabase";

import type { PolicyWithRelations } from "../../types/policy";

export async function listPolicies() {
  const { data, error } = await supabase
    .from("policies")
    .select("*, clients(id, legal_name), insurers(id, name), quotations(id, number)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PolicyWithRelations[];
}
