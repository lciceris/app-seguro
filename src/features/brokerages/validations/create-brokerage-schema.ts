import { z } from "zod";

// "none" é o valor sentinela do SelectItem de "Sem plano" (Select não aceita
// value="" nem null diretamente) — convertido pra null no payload da mutation.
export const NO_PLAN_VALUE = "none";

// O representante (Requirement 2) é convidado automaticamente como primeiro
// brokerage_admin da corretora — não existe um "primeiro administrador"
// separado do representante, os dois são a mesma pessoa.
export const createBrokerageSchema = z.object({
  brokerage_name: z.string().min(1, "Informe o nome da corretora"),
  plan_id: z.string(),
  plan_expires_at: z.date().nullable(),
  primary_color: z.string().optional(),
  trade_name: z.string().optional(),
  tax_id: z.string().optional(),
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
  representative_name: z.string().min(1, "Informe o nome do representante"),
  representative_email: z
    .string()
    .min(1, "Informe o e-mail do representante")
    .email("E-mail inválido"),
  financial_name: z.string().optional(),
  financial_email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
});

export type CreateBrokerageFormValues = z.infer<typeof createBrokerageSchema>;
