import { z } from "zod";

export const editClientSchema = z.object({
  client_type: z.enum(["individual", "company"]),
  legal_name: z.string().min(1, "Informe o nome"),
  trade_name: z.string().optional(),
  tax_id: z.string().optional(),
  birth_date: z.date().nullable(),
  business_code: z.string().optional(),
  industry: z.string().optional(),
  state_registration: z.string().optional(),
  zip_code: z.string().optional(),
  street: z.string().optional(),
  street_number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  contact_name: z.string().optional(),
  contact_role: z.string().optional(),
  contact_email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  contact_phone: z.string().optional(),
  financial_name: z.string().optional(),
  financial_email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  notes: z.string().optional(),
});

export type EditClientFormValues = z.infer<typeof editClientSchema>;
