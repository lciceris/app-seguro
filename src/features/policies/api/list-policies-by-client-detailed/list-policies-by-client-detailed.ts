import { supabase } from "@/shared/lib/supabase";

import type { PolicyWithRelations } from "../../types/policy";

// Versão completa pro hub de detalhe do cliente — diferente de
// list-policies-by-client (que só traz id/número pro seletor de "apólice
// anterior" do QAR e não deve carregar embeds extras).
export async function listPoliciesByClientDetailed(clientId: string) {
  const { data, error } = await supabase
    .from("policies")
    .select("*, clients(id, legal_name), insurers(id, name), quotations(id, number)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as PolicyWithRelations[];
}
