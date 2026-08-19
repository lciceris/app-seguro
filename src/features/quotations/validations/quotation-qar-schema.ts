import { z } from "zod";

// "none" é o valor sentinela dos Select de tipo/seguradora de renovação
// (Select não aceita value="" diretamente) — convertido pra null no payload.
export const NO_INSURANCE_TYPE_VALUE = "none";
export const NO_RENEWAL_INSURER_VALUE = "none";
export const NO_RENEWED_POLICY_VALUE = "none";

export const quotationQarSchema = z.object({
  insurance_type: z.string(),
  current_policy_expiry: z.date().nullable(),
  renewal_insurer_id: z.string(),
  renewal_insurer_name: z.string().optional(),
  renewed_policy_id: z.string(),
  sinistralidade: z.string().optional(),
  previous_premium: z.string().optional(),
  desired_premium: z.string().optional(),
  has_risk_management: z.boolean(),
  has_preventive_maintenance: z.boolean(),
  has_logo_or_special_paint: z.boolean(),
  has_defensive_driving: z.boolean(),
  has_tracker: z.boolean(),
  has_cargo: z.boolean(),
  cargo_category: z.string().optional(),
  cargo_type: z.string().optional(),
  circulation_regions: z.string().optional(),
});

export type QuotationQarFormValues = z.infer<typeof quotationQarSchema>;
