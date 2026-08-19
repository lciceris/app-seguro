import { z } from "zod";

export const editPolicySchema = z.object({
  policy_number: z.string().optional(),
  coverage_start: z.date().nullable(),
  coverage_end: z.date().nullable(),
  premium_amount: z.string().optional(),
  total_fleet_value: z.string().optional(),
});

export type EditPolicyFormValues = z.infer<typeof editPolicySchema>;
