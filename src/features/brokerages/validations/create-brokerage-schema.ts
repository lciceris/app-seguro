import { z } from "zod";

export const createBrokerageSchema = z.object({
  brokerage_name: z.string().min(1, "Informe o nome da corretora"),
  admin_full_name: z.string().min(1, "Informe o nome do administrador"),
  admin_email: z.string().min(1, "Informe o e-mail do administrador").email("E-mail inválido"),
});

export type CreateBrokerageFormValues = z.infer<typeof createBrokerageSchema>;
