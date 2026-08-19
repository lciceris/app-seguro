import { z } from "zod";

// "none" é o valor sentinela dos Select de tipo de cobertura/franquia/vidros
// (Select não aceita value="" diretamente) — convertido pra null no payload.
export const NO_COVERAGE_TYPE_VALUE = "none";
export const NO_FRANCHISE_TYPE_VALUE = "none";
export const NO_GLASS_COVERAGE_VALUE = "none";

export const quotationVehicleCoverageSchema = z.object({
  coverage_type: z.string(),
  casco_percentage: z.string().optional(),
  casco_value: z.string().optional(),
  franchise_type: z.string(),
  bonus: z.string().optional(),
  claims_count: z.string().optional(),
  rcf_dm: z.string().optional(),
  rcf_dc: z.string().optional(),
  rcf_dmo: z.string().optional(),
  app_death: z.string().optional(),
  app_disability: z.string().optional(),
  assistance: z.string().optional(),
  glass_coverage: z.string(),
  reserve_car: z.string().optional(),
  bodywork_value: z.string().optional(),
  bodywork_type: z.string().optional(),
  equipment_value: z.string().optional(),
  equipment_type: z.string().optional(),
  armoring_value: z.string().optional(),
});

export type QuotationVehicleCoverageFormValues = z.infer<typeof quotationVehicleCoverageSchema>;
