import { supabase } from "@/shared/lib/supabase";

import type { InsurerCatalogEntry } from "../../types/insurer";

// Não precisa filtrar os embeds por brokerage_id explicitamente — as policies
// *_select_own já garantem que só a linha da própria corretora (se existir) é
// retornada (ver .agents/specs/insurers/design.md e insurer-catalog-and-ordering).
// A ordenação por brokerage_insurer_order.display_order é feita no cliente
// (insurer-catalog-screen) — PostgREST não ordena a tabela principal por uma
// coluna de embed, só o `order by` abaixo (fallback: catálogo global, nome).
export async function listInsurerCatalog() {
  const { data, error } = await supabase
    .from("insurers")
    .select("*, brokerage_disabled_insurers(brokerage_id), brokerage_insurer_order(display_order)")
    .order("display_order", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return data as InsurerCatalogEntry[];
}
