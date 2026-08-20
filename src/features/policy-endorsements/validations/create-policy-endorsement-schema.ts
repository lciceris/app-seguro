import { z } from "zod";

export const NO_VEHICLE_VALUE = "none";

const VEHICLE_REQUIRED_TYPES = ["vehicle_inclusion", "vehicle_exclusion", "coverage_change"];
const DESCRIPTION_REQUIRED_TYPES = ["administrative_correction", "cancellation"];

// Espelha exatamente as regras do trigger validate_policy_endorsement_fields
// (banco) — validação aqui é só pra dar feedback cedo no formulário; quem
// garante de verdade é o trigger (ver
// .agents/specs/policy-endorsements/design.md).
export const createPolicyEndorsementSchema = z
  .object({
    endorsement_type: z.enum([
      "vehicle_inclusion",
      "vehicle_exclusion",
      "coverage_change",
      "extension",
      "administrative_correction",
      "cancellation",
    ]),
    description: z.string().optional(),
    vehicle_id: z.string(),
    // Cobertura — vehicle_inclusion / coverage_change (mesmos campos de
    // quotation-vehicle-coverage-schema.ts).
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
    // extension / administrative_correction
    new_coverage_start: z.date().nullable(),
    new_coverage_end: z.date().nullable(),
    new_policy_number: z.string().optional(),
    new_premium_amount: z.string().optional(),
    new_total_fleet_value: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      VEHICLE_REQUIRED_TYPES.includes(data.endorsement_type) &&
      data.vehicle_id === NO_VEHICLE_VALUE
    ) {
      ctx.addIssue({ code: "custom", message: "Selecione o veículo.", path: ["vehicle_id"] });
    }
    if (data.endorsement_type === "extension" && !data.new_coverage_end) {
      ctx.addIssue({
        code: "custom",
        message: "Informe a nova data de fim de vigência.",
        path: ["new_coverage_end"],
      });
    }
    if (
      DESCRIPTION_REQUIRED_TYPES.includes(data.endorsement_type) &&
      (!data.description || data.description.trim() === "")
    ) {
      ctx.addIssue({ code: "custom", message: "Informe o motivo.", path: ["description"] });
    }
  });

export type CreatePolicyEndorsementFormValues = z.infer<typeof createPolicyEndorsementSchema>;
