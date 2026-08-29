import { supabase } from "@/shared/lib/supabase";

export interface SwapInsurerOrderInput {
  first: { id: string; display_order: number };
  second: { id: string; display_order: number };
}

// Duas seguradoras trocam de posição — cada uma recebe o display_order da
// outra. Sem transação (o client do Supabase não faz multi-statement), mas
// o risco de inconsistência num update sequencial de 2 linhas é aceitável
// aqui (não é dado financeiro, só ordem de exibição).
export async function swapInsurerOrder({ first, second }: SwapInsurerOrderInput) {
  const { error: firstError } = await supabase
    .from("insurers")
    .update({ display_order: first.display_order })
    .eq("id", first.id);
  if (firstError) throw firstError;

  const { error: secondError } = await supabase
    .from("insurers")
    .update({ display_order: second.display_order })
    .eq("id", second.id);
  if (secondError) throw secondError;
}
