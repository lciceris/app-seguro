import { z } from "zod";

export const INVITABLE_ROLES = [
  "brokerage_admin",
  "supervisor",
  "seller",
  "analyst",
  "viewer",
] as const;

export const inviteUserSchema = z.object({
  full_name: z.string().min(1, "Informe o nome"),
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  phone: z.string().optional(),
  role: z.enum(INVITABLE_ROLES, { message: "Selecione um perfil" }),
});

export type InviteUserFormValues = z.infer<typeof inviteUserSchema>;
