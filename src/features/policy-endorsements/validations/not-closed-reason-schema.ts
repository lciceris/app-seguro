import { z } from "zod";

export const notClosedReasonSchema = z.object({
  not_closed_reason: z.string().min(1, "Informe o motivo de não fechamento"),
});

export type NotClosedReasonFormValues = z.infer<typeof notClosedReasonSchema>;
