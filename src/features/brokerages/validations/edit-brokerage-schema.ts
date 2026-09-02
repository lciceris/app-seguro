import { z } from "zod";

import { isValidCnpj } from "@/shared/lib/document-validators";

// "none" é o valor sentinela do SelectItem de "Sem plano" (Select não aceita
// value="" nem null diretamente) — convertido pra null no payload da mutation.
export const NO_PLAN_VALUE = "none";

// Mesmo conjunto de campos de empresa da criação (Requirement 2.2) — a edição
// pelo platform_admin agora é simétrica à criação, exceto logo/cor (exclusivos
// do brokerage_admin, Requirement 6).
export const editBrokerageSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  plan_id: z.string(),
  plan_expires_at: z.date().nullable(),
  trade_name: z.string().optional(),
  tax_id: z.string().min(1, "Informe o CNPJ").refine(isValidCnpj, "CNPJ inválido"),
  business_code: z.string().optional(),
  state_registration: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  phone: z.string().optional(),
  zip_code: z.string().optional(),
  street: z.string().optional(),
  street_number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  representative_name: z.string().optional(),
  representative_email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  financial_name: z.string().optional(),
  financial_email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
});

export type EditBrokerageFormValues = z.infer<typeof editBrokerageSchema>;
