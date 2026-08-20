import { z } from "zod";

export const insurerResponseSchema = z.object({
  premium_adjustment: z.string().optional(),
  insurer_response_notes: z.string().optional(),
});

export type InsurerResponseFormValues = z.infer<typeof insurerResponseSchema>;
