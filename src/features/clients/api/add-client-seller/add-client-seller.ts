import { supabase } from "@/shared/lib/supabase";

export interface AddClientSellerInput {
  clientId: string;
  sellerId: string;
  isPrimary: boolean;
}

export async function addClientSeller({ clientId, sellerId, isPrimary }: AddClientSellerInput) {
  const { error } = await supabase
    .from("client_sellers")
    .insert({ client_id: clientId, seller_id: sellerId, is_primary: isPrimary });

  if (error) throw error;
}
