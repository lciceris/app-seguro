import type { Database } from "@/shared/lib/supabase";

export type Insurer = Database["public"]["Tables"]["insurers"]["Row"];

// Entrada do catálogo (`/my-insurers`) — embed com a preferência da própria
// corretora (ver api/list-insurer-catalog). Array vazio = habilitada.
export type InsurerCatalogEntry = Insurer & {
  brokerage_disabled_insurers: { brokerage_id: string }[];
};
