import { z } from "zod";

// "none" é o valor sentinela do SelectItem de tipo (Select não aceita
// value="" diretamente) — convertido pra null no payload da mutation.
export const NO_QUOTATION_TYPE_VALUE = "none";

// Passo 1 — Cliente: único passo com validação real (cliente obrigatório,
// resto opcional — ver .agents/specs/quotations/requirements.md Requirement 1).
export const quotationStep1Schema = z.object({
  client_id: z.string().min(1, "Selecione um cliente"),
  seller_id: z.string().optional(),
  quotation_type: z.string(),
});

export type QuotationStep1FormValues = z.infer<typeof quotationStep1Schema>;

// Passo 4 — Fechamento: campos que sobraram do formulário antigo
// (Cobertura pretendida + Prazo e observações), todos opcionais.
export const quotationStep4Schema = z.object({
  coverage_start: z.date().nullable(),
  coverage_end: z.date().nullable(),
  coverages: z.string().optional(),
  deductible_pref: z.string().optional(),
  due_date: z.date().nullable(),
  seller_notes: z.string().optional(),
});

export type QuotationStep4FormValues = z.infer<typeof quotationStep4Schema>;
