import { z } from "zod";

export const editInsurerSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  cnpj: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("E-mail inválido")]).optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  contact_name: z.string().optional(),
  response_time_days: z.string().optional(),
  display_order: z.string().optional(),
  notes: z.string().optional(),
});

export type EditInsurerFormValues = z.infer<typeof editInsurerSchema>;
