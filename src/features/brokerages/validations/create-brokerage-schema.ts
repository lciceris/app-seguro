import { z } from "zod";

export const createBrokerageSchema = z.object({
  brokerage_name: z.string().min(1, "Informe o nome da corretora"),
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
  representative_name: z.string().optional(),
  representative_email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  financial_name: z.string().optional(),
  financial_email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  admin_full_name: z.string().min(1, "Informe o nome do administrador"),
  admin_email: z.string().min(1, "Informe o e-mail do administrador").email("E-mail inválido"),
});

export type CreateBrokerageFormValues = z.infer<typeof createBrokerageSchema>;
