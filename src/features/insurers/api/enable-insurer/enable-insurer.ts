import { supabase } from "@/shared/lib/supabase";

export interface EnableInsurerInput {
  brokerageId: string;
  insurerId: string;
}

export async function enableInsurer({ brokerageId, insurerId }: EnableInsurerInput) {
  const { error } = await supabase
    .from("brokerage_disabled_insurers")
    .delete()
    .eq("brokerage_id", brokerageId)
    .eq("insurer_id", insurerId);

  if (error) throw error;
}
