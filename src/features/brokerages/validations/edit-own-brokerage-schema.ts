import { z } from "zod";

export const editOwnBrokerageSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  logo_url: z.string().optional(),
  primary_color: z.string().optional(),
});

export type EditOwnBrokerageFormValues = z.infer<typeof editOwnBrokerageSchema>;
