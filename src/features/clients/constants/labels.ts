import type { Database } from "@/shared/lib/supabase";

export const CLIENT_TYPE_LABELS: Record<Database["public"]["Enums"]["client_type"], string> = {
  individual: "Pessoa física",
  company: "Pessoa jurídica",
};

export const STATUS_LABELS: Record<Database["public"]["Enums"]["client_status"], string> = {
  active: "Ativo",
  inactive: "Inativo",
};

export const STATUS_BADGE_CLASSES: Record<Database["public"]["Enums"]["client_status"], string> = {
  active: "border-transparent bg-success-bg text-success-text",
  inactive: "border-transparent bg-neutral-bg text-neutral-text",
};
