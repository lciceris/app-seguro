import type { Database } from "@/shared/lib/supabase";

export const CLIENT_TYPE_LABELS: Record<Database["public"]["Enums"]["client_type"], string> = {
  individual: "Pessoa física",
  company: "Pessoa jurídica",
};

export const SEGMENT_LABELS: Record<Database["public"]["Enums"]["client_segment"], string> = {
  lead: "Lead",
  active: "Ativo",
  vip: "VIP",
  inactive: "Inativo",
};

export const SEGMENT_BADGE_CLASSES: Record<Database["public"]["Enums"]["client_segment"], string> =
  {
    lead: "border-transparent bg-slate-100 text-slate-600",
    active: "border-transparent bg-emerald-100 text-emerald-700",
    vip: "border-transparent bg-violet-100 text-violet-700",
    inactive: "border-transparent bg-slate-100 text-slate-500",
  };
