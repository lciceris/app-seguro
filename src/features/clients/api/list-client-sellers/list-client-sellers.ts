import { supabase } from "@/shared/lib/supabase";

import type { ClientSellerWithUser } from "../../types/client";

export async function listClientSellers(clientId: string) {
  const { data, error } = await supabase
    .from("client_sellers")
    .select("*, users(id, full_name)")
    .eq("client_id", clientId)
    .order("is_primary", { ascending: false })
    .order("created_at");

  if (error) throw error;
  return data as ClientSellerWithUser[];
}
