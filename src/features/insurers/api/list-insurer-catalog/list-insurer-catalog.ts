import { supabase } from "@/shared/lib/supabase";

import type { InsurerCatalogEntry } from "../../types/insurer";

// Não precisa filtrar o embed por brokerage_id explicitamente — a policy
// brokerage_disabled_insurers_select_own já garante que só a linha da própria
// corretora (se existir) é retornada (ver .agents/specs/insurers/design.md).
export async function listInsurerCatalog() {
  const { data, error } = await supabase
    .from("insurers")
    .select("*, brokerage_disabled_insurers(brokerage_id)")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data as InsurerCatalogEntry[];
}
