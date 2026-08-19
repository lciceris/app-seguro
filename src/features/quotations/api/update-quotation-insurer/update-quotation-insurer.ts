import { supabase } from "@/shared/lib/supabase";
import type { Database } from "@/shared/lib/supabase";

import { INSURER_RESPONSE_STATUS_LABELS } from "../../constants/labels";

export interface UpdateQuotationInsurerInput {
  id: string;
  brokerage_id: string;
  response_status: Database["public"]["Enums"]["insurer_response_status"];
  premium_amount: number | null;
  deductible_amount: number | null;
  commission_rate: number | null;
  installments_count: number | null;
  insurer_quotation_number: string | null;
  approved_coverages: string | null;
  analyst_notes: string | null;
}

// Campos "relevantes" do retorno (Requirement 5.3) cuja alteração vira um
// evento `system` automático em quotation_insurer_events (Requirement 8.2) —
// registrado no frontend (não num trigger de banco) porque é aqui que temos o
// valor "antes" já carregado, sem precisar de mais uma leitura no servidor.
const FIELD_LABELS: Record<string, string> = {
  response_status: "Status da resposta",
  premium_amount: "Prêmio proposto",
  deductible_amount: "Franquia",
  commission_rate: "Comissão",
  installments_count: "Parcelas",
  insurer_quotation_number: "Número da proposta",
  approved_coverages: "Coberturas aprovadas",
  analyst_notes: "Notas do calculista",
};

function formatValue(field: string, value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (field === "response_status") {
    return INSURER_RESPONSE_STATUS_LABELS[
      value as Database["public"]["Enums"]["insurer_response_status"]
    ];
  }
  return String(value);
}

export async function updateQuotationInsurer({
  id,
  brokerage_id,
  ...values
}: UpdateQuotationInsurerInput) {
  const { data: previous, error: previousError } = await supabase
    .from("quotation_insurers")
    .select("*")
    .eq("id", id)
    .single();
  if (previousError) throw previousError;

  const responded_at =
    values.response_status !== previous.response_status
      ? new Date().toISOString()
      : previous.responded_at;

  const { data, error } = await supabase
    .from("quotation_insurers")
    .update({ ...values, responded_at })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const changedFields = Object.keys(FIELD_LABELS).filter(
    (field) => previous[field as keyof typeof previous] !== values[field as keyof typeof values],
  );

  if (changedFields.length > 0) {
    const { error: eventsError } = await supabase.from("quotation_insurer_events").insert(
      changedFields.map((field) => ({
        quotation_insurer_id: id,
        brokerage_id,
        event_type: "system" as const,
        content: `${FIELD_LABELS[field]} alterado`,
        field_changed: field,
        old_value: formatValue(field, previous[field as keyof typeof previous]),
        new_value: formatValue(field, values[field as keyof typeof values]),
        author_id: user?.id ?? null,
      })),
    );
    if (eventsError) throw eventsError;
  }

  return data;
}
