import { supabase } from "@/shared/lib/supabase";

export interface DisableInsurerInput {
  brokerageId: string;
  insurerId: string;
}

export async function disableInsurer({ brokerageId, insurerId }: DisableInsurerInput) {
  const { error } = await supabase
    .from("brokerage_disabled_insurers")
    .insert({ brokerage_id: brokerageId, insurer_id: insurerId });

  if (error) throw error;
}
