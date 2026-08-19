import { z } from "zod";

export const quotationInsurerResponseSchema = z.object({
  response_status: z.enum(["pending", "accepted", "declined", "waiting_info"]),
  premium_amount: z.string().optional(),
  deductible_amount: z.string().optional(),
  commission_rate: z.string().optional(),
  installments_count: z.string().optional(),
  insurer_quotation_number: z.string().optional(),
  approved_coverages: z.string().optional(),
  analyst_notes: z.string().optional(),
});

export type QuotationInsurerResponseFormValues = z.infer<typeof quotationInsurerResponseSchema>;
