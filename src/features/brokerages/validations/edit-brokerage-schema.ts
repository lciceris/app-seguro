import { z } from "zod";

// "none" é o valor sentinela do SelectItem de "Sem plano" (Select não aceita
// value="" nem null diretamente) — convertido pra null no payload da mutation.
export const NO_PLAN_VALUE = "none";

export const editBrokerageSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  plan_id: z.string(),
});

export type EditBrokerageFormValues = z.infer<typeof editBrokerageSchema>;
