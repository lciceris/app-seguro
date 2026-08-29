import { supabase } from "@/shared/lib/supabase";

export interface SwapBrokerageInsurerOrderInput {
  brokerageId: string;
  first: { insurerId: string; display_order: number };
  second: { insurerId: string; display_order: number };
}

// Cada corretora tem a própria ordem (brokerage_insurer_order), separada do
// catálogo global (insurers.display_order) — upsert porque a linha pode não
// existir ainda (corretora nunca reordenou essa seguradora antes).
export async function swapBrokerageInsurerOrder({
  brokerageId,
  first,
  second,
}: SwapBrokerageInsurerOrderInput) {
  const { error: firstError } = await supabase.from("brokerage_insurer_order").upsert(
    {
      brokerage_id: brokerageId,
      insurer_id: first.insurerId,
      display_order: first.display_order,
    },
    { onConflict: "brokerage_id,insurer_id" },
  );
  if (firstError) throw firstError;

  const { error: secondError } = await supabase.from("brokerage_insurer_order").upsert(
    {
      brokerage_id: brokerageId,
      insurer_id: second.insurerId,
      display_order: second.display_order,
    },
    { onConflict: "brokerage_id,insurer_id" },
  );
  if (secondError) throw secondError;
}
