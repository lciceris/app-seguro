import { supabase } from "@/shared/lib/supabase";

export interface RemoveClientSellerInput {
  clientSellerId: string;
  clientId: string;
  // id (client_sellers.id) do vendedor que deve virar o novo principal —
  // obrigatório só quando o removido é o principal e restam outros vínculos
  // (ver .agents/specs/clients/design.md, Requirement 5.2).
  newPrimaryId?: string;
}

export async function removeClientSeller({
  clientSellerId,
  clientId,
  newPrimaryId,
}: RemoveClientSellerInput) {
  const { data: current, error: currentError } = await supabase
    .from("client_sellers")
    .select("is_primary")
    .eq("id", clientSellerId)
    .single();
  if (currentError) throw currentError;

  if (current.is_primary) {
    const { count, error: countError } = await supabase
      .from("client_sellers")
      .select("id", { count: "exact", head: true })
      .eq("client_id", clientId)
      .neq("id", clientSellerId);
    if (countError) throw countError;

    if (count && count > 0) {
      if (!newPrimaryId) {
        throw new Error(
          "Escolha um novo vendedor principal antes de remover o vendedor principal atual.",
        );
      }

      const { error: promoteError } = await supabase
        .from("client_sellers")
        .update({ is_primary: true })
        .eq("id", newPrimaryId);
      if (promoteError) throw promoteError;
    }
  }

  const { error: deleteError } = await supabase
    .from("client_sellers")
    .delete()
    .eq("id", clientSellerId);
  if (deleteError) throw deleteError;
}
