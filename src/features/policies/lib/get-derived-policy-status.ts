import type { Policy } from "../types/policy";

const EXPIRING_SOON_THRESHOLD_DAYS = 30;

export type DerivedPolicyStatus = "active" | "expiring_soon" | "expired" | "cancelled" | "renewed";

// Status persistido (`cancelled`/`renewed`) sempre vence — uma apólice
// substituída ou cancelada não "vence" por data. `coverage_end` ausente
// não é suficiente pra calcular vencimento, então fica `active`. Mesma
// lógica do modelo antigo (fleet-auth-gate), que nunca persistia
// expiring_soon/expired — sempre calculado no frontend a partir da data.
export function getDerivedPolicyStatus(
  policy: Pick<Policy, "status" | "coverage_end">,
): DerivedPolicyStatus {
  if (policy.status !== "active") return policy.status;
  if (!policy.coverage_end) return "active";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const coverageEnd = new Date(`${policy.coverage_end}T00:00:00`);
  const daysUntil = Math.floor((coverageEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return "expired";
  if (daysUntil <= EXPIRING_SOON_THRESHOLD_DAYS) return "expiring_soon";
  return "active";
}
