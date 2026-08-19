import type { Database } from "@/shared/lib/supabase";

import type { Quotation } from "../../types/quotation";

type Role = Database["public"]["Enums"]["user_role"];
type Status = Database["public"]["Enums"]["quotation_status"];

export interface StatusAction {
  targetStatus: Status;
  label: string;
  variant: "default" | "outline" | "destructive";
  requiresLostReason: boolean;
}

// Espelha, no frontend, exatamente as transições que o trigger
// enforce_quotation_status_transition permite no banco — só decide quais
// botões mostrar; quem garante de verdade continua sendo o trigger (ver
// .agents/specs/quotations/design.md).
const MANAGE_ROLES: Role[] = ["analyst", "supervisor", "brokerage_admin", "platform_admin"];
const EFFECT_ROLES: Role[] = ["supervisor", "brokerage_admin", "platform_admin"];

export function getAvailableStatusActions(
  quotation: Quotation,
  role: Role,
  userId: string,
): StatusAction[] {
  const isOwnSeller = role === "seller" && quotation.seller_id === userId;

  switch (quotation.status) {
    case "waiting":
      return MANAGE_ROLES.includes(role)
        ? [
            {
              targetStatus: "in_progress",
              label: "Iniciar cotação",
              variant: "default",
              requiresLostReason: false,
            },
          ]
        : [];

    case "in_progress":
      return MANAGE_ROLES.includes(role)
        ? [
            {
              targetStatus: "in_negotiation",
              label: "Iniciar negociação",
              variant: "default",
              requiresLostReason: false,
            },
          ]
        : [];

    case "in_negotiation":
      return MANAGE_ROLES.includes(role)
        ? [
            {
              targetStatus: "presented",
              label: "Apresentar ao cliente",
              variant: "default",
              requiresLostReason: false,
            },
          ]
        : [];

    case "presented":
      return isOwnSeller || EFFECT_ROLES.includes(role)
        ? [
            {
              targetStatus: "waiting_effect",
              label: "Enviar ao cliente",
              variant: "default",
              requiresLostReason: false,
            },
          ]
        : [];

    case "waiting_effect":
      return isOwnSeller || EFFECT_ROLES.includes(role)
        ? [
            {
              targetStatus: "client_accepted",
              label: "Cliente aceitou",
              variant: "default",
              requiresLostReason: false,
            },
            {
              targetStatus: "not_closed",
              label: "Não fechada",
              variant: "destructive",
              requiresLostReason: true,
            },
          ]
        : [];

    case "client_accepted":
      return EFFECT_ROLES.includes(role)
        ? [
            {
              targetStatus: "effected",
              label: "Efetivar",
              variant: "default",
              requiresLostReason: false,
            },
            {
              targetStatus: "not_closed",
              label: "Não fechada",
              variant: "destructive",
              requiresLostReason: true,
            },
          ]
        : [];

    default:
      return [];
  }
}
