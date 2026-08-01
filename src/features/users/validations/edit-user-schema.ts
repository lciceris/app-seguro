import { z } from "zod";

import { INVITABLE_ROLES } from "./invite-user-schema";

export const EDITABLE_ROLES = INVITABLE_ROLES;

export const editUserSchema = z.object({
  full_name: z.string().min(1, "Informe o nome"),
  phone: z.string().optional(),
  role: z.enum(EDITABLE_ROLES, { message: "Selecione um perfil" }),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;
