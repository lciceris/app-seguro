import { z } from "zod";

// "none" é o valor sentinela do tipo de cotação (Select não aceita value=""
// diretamente) — convertido pra null no payload da mutation.
export const NO_QUOTATION_TYPE_VALUE = "none";

export const editQuotationSchema = z.object({
  seller_id: z.string().optional(),
  quotation_type: z.string(),
  coverage_start: z.date().nullable(),
  coverage_end: z.date().nullable(),
  coverages: z.string().optional(),
  deductible_pref: z.string().optional(),
  due_date: z.date().nullable(),
  seller_notes: z.string().optional(),
});

export type EditQuotationFormValues = z.infer<typeof editQuotationSchema>;
