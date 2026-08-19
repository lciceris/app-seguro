import type { Database } from "@/shared/lib/supabase";

export const QUOTATION_STATUS_LABELS: Record<
  Database["public"]["Enums"]["quotation_status"],
  string
> = {
  waiting: "Aguardando",
  in_progress: "Em Cotação",
  in_negotiation: "Em Negociação",
  presented: "Apresentada",
  waiting_effect: "Aguardando Efetivação",
  client_accepted: "Cliente Aceitou",
  effected: "Efetivada",
  not_closed: "Não Fechada",
};

// Mesma paleta já usada no CLAUDE.md pra badges de status de cotação —
// client_accepted é novo, entre waiting_effect (amber) e effected (emerald).
export const QUOTATION_STATUS_BADGE_CLASSES: Record<
  Database["public"]["Enums"]["quotation_status"],
  string
> = {
  waiting: "border-transparent bg-slate-100 text-slate-600",
  in_progress: "border-transparent bg-sky-100 text-sky-700",
  in_negotiation: "border-transparent bg-violet-100 text-violet-700",
  presented: "border-transparent bg-blue-100 text-blue-700",
  waiting_effect: "border-transparent bg-amber-100 text-amber-700",
  client_accepted: "border-transparent bg-lime-100 text-lime-700",
  effected: "border-transparent bg-emerald-100 text-emerald-700",
  not_closed: "border-transparent bg-red-100 text-red-700",
};

export const QUOTATION_TYPE_LABELS: Record<Database["public"]["Enums"]["quotation_type"], string> =
  {
    new: "Novo",
    renewal: "Renovação",
  };

export const INSURER_RESPONSE_STATUS_LABELS: Record<
  Database["public"]["Enums"]["insurer_response_status"],
  string
> = {
  pending: "Pendente",
  accepted: "Aceita",
  declined: "Recusada",
  waiting_info: "Aguardando info",
};

export const INSURER_RESPONSE_STATUS_BADGE_CLASSES: Record<
  Database["public"]["Enums"]["insurer_response_status"],
  string
> = {
  pending: "border-transparent bg-slate-100 text-slate-600",
  accepted: "border-transparent bg-emerald-100 text-emerald-700",
  declined: "border-transparent bg-red-100 text-red-700",
  waiting_info: "border-transparent bg-amber-100 text-amber-700",
};

export const COVERAGE_TYPE_LABELS: Record<Database["public"]["Enums"]["coverage_type"], string> = {
  rcf: "RCF (Responsabilidade Civil Facultativa)",
  total: "Compreensiva (Total)",
  vd: "Valor Determinado",
};

export const FRANCHISE_TYPE_LABELS: Record<Database["public"]["Enums"]["franchise_type"], string> =
  {
    normal: "Normal",
    reduced: "Reduzida",
  };

export const GLASS_COVERAGE_LEVEL_LABELS: Record<
  Database["public"]["Enums"]["glass_coverage_level"],
  string
> = {
  basic: "Básico",
  complete: "Completo",
  armored: "Blindado",
};
