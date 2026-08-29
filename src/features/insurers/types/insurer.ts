import type { Database } from "@/shared/lib/supabase";

export type Insurer = Database["public"]["Tables"]["insurers"]["Row"];

// Entrada do catálogo (`/my-insurers`) — embed com a preferência da própria
// corretora (ver api/list-insurer-catalog). Array vazio = habilitada.
// brokerage_insurer_order: 0 ou 1 linha (RLS já escopa pra própria corretora) —
// ausente = usa o display_order do catálogo global como fallback.
export type InsurerCatalogEntry = Insurer & {
  brokerage_disabled_insurers: { brokerage_id: string }[];
  brokerage_insurer_order: { display_order: number }[];
};
