import { z } from "zod";

import { isValidCnpj, isValidCpf } from "@/shared/lib/document-validators";

export const createClientSchema = z
  .object({
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
  })
  .superRefine((data, ctx) => {
    if (!data.tax_id) return;
    const isValid =
      data.client_type === "company" ? isValidCnpj(data.tax_id) : isValidCpf(data.tax_id);
    if (!isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tax_id"],
        message: data.client_type === "company" ? "CNPJ inválido" : "CPF inválido",
      });
    }
  });

export type CreateClientFormValues = z.infer<typeof createClientSchema>;
