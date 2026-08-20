import type { Database } from "@/shared/lib/supabase";

import type { DerivedPolicyStatus } from "../lib/get-derived-policy-status";

export const POLICY_STATUS_LABELS: Record<Database["public"]["Enums"]["policy_status"], string> = {
  active: "Ativa",
  cancelled: "Cancelada",
  renewed: "Renovada",
  superseded: "Substituída por endosso",
};

// Status derivado — o que aparece de fato na listagem/detalhe (sobrepõe o
// persistido quando ele é `active`, ver get-derived-policy-status.ts).
export const DERIVED_POLICY_STATUS_LABELS: Record<DerivedPolicyStatus, string> = {
  active: "Vigente",
  expiring_soon: "Vencendo em breve",
  expired: "Vencida",
  cancelled: "Cancelada",
  renewed: "Renovada",
  superseded: "Substituída por endosso",
};

export const DERIVED_POLICY_STATUS_BADGE_CLASSES: Record<DerivedPolicyStatus, string> = {
  active: "border-transparent bg-emerald-100 text-emerald-700",
  expiring_soon: "border-transparent bg-amber-100 text-amber-700",
  expired: "border-transparent bg-red-100 text-red-700",
  cancelled: "border-transparent bg-slate-100 text-slate-500",
  renewed: "border-transparent bg-violet-100 text-violet-700",
  superseded: "border-transparent bg-slate-100 text-slate-600",
};
