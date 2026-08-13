import type { Database } from "@/shared/lib/supabase";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type ClientSeller = Database["public"]["Tables"]["client_sellers"]["Row"];

// Vendedor vinculado com o embed do próprio usuário (nome), usado na seção
// de vendedores do client-detail-drawer.
export type ClientSellerWithUser = ClientSeller & {
  users: { id: string; full_name: string } | null;
};
