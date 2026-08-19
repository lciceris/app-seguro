import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

export interface UpsertQuotationQarInput {
  quotation_id: string;
  brokerage_id: string;
  insurance_type: Database["public"]["Enums"]["quotation_type"] | null;
  current_policy_expiry: string | null;
  renewal_insurer_id: string | null;
  renewal_insurer_name: string | null;
  sinistralidade: string | null;
  previous_premium: number | null;
  desired_premium: number | null;
  has_risk_management: boolean | null;
  has_preventive_maintenance: boolean | null;
  has_logo_or_special_paint: boolean | null;
  has_defensive_driving: boolean | null;
  has_tracker: boolean | null;
  has_cargo: boolean | null;
  cargo_category: string | null;
  cargo_type: string | null;
  circulation_regions: string[] | null;
}

export async function upsertQuotationQar(input: UpsertQuotationQarInput) {
  const { data, error } = await supabase
    .from("quotation_qar")
    .upsert(input, { onConflict: "quotation_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
