import type { Database } from "@/shared/lib/supabase";

export const POLICY_ENDORSEMENT_TYPE_LABELS: Record<
  Database["public"]["Enums"]["policy_endorsement_type"],
  string
> = {
  vehicle_inclusion: "Inclusão de veículo",
  vehicle_exclusion: "Exclusão de veículo",
  coverage_change: "Alteração de cobertura",
  extension: "Prorrogação de vigência",
  administrative_correction: "Correção administrativa",
  cancellation: "Cancelamento",
};

export const POLICY_ENDORSEMENT_STATUS_LABELS: Record<
  Database["public"]["Enums"]["policy_endorsement_status"],
  string
> = {
  waiting: "Aguardando seguradora",
  presented: "Aguardando cliente",
  client_accepted: "Cliente aceitou",
  effected: "Efetivado",
  not_closed: "Não fechado",
};

// Mesma paleta usada pros estágios equivalentes de quotation_status.
export const POLICY_ENDORSEMENT_STATUS_BADGE_CLASSES: Record<
  Database["public"]["Enums"]["policy_endorsement_status"],
  string
> = {
  waiting: "border-transparent bg-slate-100 text-slate-600",
  presented: "border-transparent bg-blue-100 text-blue-700",
  client_accepted: "border-transparent bg-lime-100 text-lime-700",
  effected: "border-transparent bg-emerald-100 text-emerald-700",
  not_closed: "border-transparent bg-red-100 text-red-700",
};
