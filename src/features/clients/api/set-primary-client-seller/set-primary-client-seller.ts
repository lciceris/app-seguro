import { supabase } from "@/shared/lib/supabase";

// O trigger enforce_single_primary_seller (banco) desmarca automaticamente
// o principal anterior do mesmo cliente — aqui só marcamos o novo.
export async function setPrimaryClientSeller(id: string) {
  const { error } = await supabase.from("client_sellers").update({ is_primary: true }).eq("id", id);

  if (error) throw error;
}
