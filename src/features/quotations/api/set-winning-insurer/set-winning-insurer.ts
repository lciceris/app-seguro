import { supabase } from "@/shared/lib/supabase";

// O trigger enforce_single_quotation_winner (banco) desmarca automaticamente
// a vencedora anterior da mesma cotação — aqui só marcamos a nova. O CHECK
// (NOT is_winner OR response_status = 'accepted') garante que só uma
// seguradora com retorno aceito pode ser marcada.
export async function setWinningInsurer(id: string) {
  const { error } = await supabase
    .from("quotation_insurers")
    .update({ is_winner: true })
    .eq("id", id);

  if (error) throw error;
}
