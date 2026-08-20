import type { Database } from "@/shared/lib/supabase";

import type { PolicyEndorsement } from "../../types/policy-endorsement";

type Role = Database["public"]["Enums"]["user_role"];
type Status = Database["public"]["Enums"]["policy_endorsement_status"];

export interface EndorsementAction {
  targetStatus: Status;
  label: string;
  variant: "default" | "outline" | "destructive";
  // "waiting" -> "presented" e qualquer transição pra "not_closed" exigem
  // dados extras (ajuste de prêmio/notas, ou motivo) — a navegação interna do
  // drawer troca de view em vez de abrir modal (CLAUDE.md regra 4).
  form: "insurer-response" | "not-closed-reason" | null;
}

// Espelha, no frontend, exatamente as transições que o trigger
// enforce_policy_endorsement_status_transition permite no banco — só decide
// quais botões mostrar; quem garante de verdade continua sendo o trigger
// (ver .agents/specs/policy-endorsements/design.md).
const INSURER_NEGOTIATION_ROLES: Role[] = [
  "analyst",
  "supervisor",
  "brokerage_admin",
  "platform_admin",
];
const EFFECT_ROLES: Role[] = ["supervisor", "brokerage_admin", "platform_admin"];

export function getAvailableEndorsementActions(
  endorsement: Pick<PolicyEndorsement, "status">,
  role: Role,
): EndorsementAction[] {
  switch (endorsement.status) {
    case "waiting":
      return INSURER_NEGOTIATION_ROLES.includes(role)
        ? [
            {
              targetStatus: "presented",
              label: "Registrar retorno da seguradora",
              variant: "default",
              form: "insurer-response",
            },
            {
              targetStatus: "not_closed",
              label: "Não fechado",
              variant: "destructive",
              form: "not-closed-reason",
            },
          ]
        : [];

    case "presented":
      return role === "seller" || EFFECT_ROLES.includes(role)
        ? [
            {
              targetStatus: "client_accepted",
              label: "Cliente aceitou",
              variant: "default",
              form: null,
            },
            {
              targetStatus: "not_closed",
              label: "Não fechado",
              variant: "destructive",
              form: "not-closed-reason",
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
              form: null,
            },
            {
              targetStatus: "not_closed",
              label: "Não fechado",
              variant: "destructive",
              form: "not-closed-reason",
            },
          ]
        : [];

    default:
      return [];
  }
}
