import { z } from "zod";

export const createInsurerSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  cnpj: z.string().min(1, "Informe o CNPJ"),
  email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  contact_name: z.string().optional(),
  response_time_days: z.string().optional(),
  display_order: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInsurerFormValues = z.infer<typeof createInsurerSchema>;
