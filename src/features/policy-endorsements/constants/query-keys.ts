export const policyEndorsementKeys = {
  all: ["policy-endorsements"] as const,
  chains: () => [...policyEndorsementKeys.all, "chain"] as const,
  // Chave pela apólice de partida (não pela raiz) — cada versão vista abre
  // sua própria entrada de cache, mas todas listam a mesma cadeia via
  // root_policy_id (ver list-policy-endorsements-by-chain).
  chain: (policyId: string) => [...policyEndorsementKeys.chains(), policyId] as const,
  details: () => [...policyEndorsementKeys.all, "detail"] as const,
  detail: (id: string) => [...policyEndorsementKeys.details(), id] as const,
  currentVersion: (policyId: string) =>
    [...policyEndorsementKeys.all, "current-version", policyId] as const,
};

export const policyVehicleKeys = {
  all: ["policy-vehicles"] as const,
  byPolicy: (policyId: string) => [...policyVehicleKeys.all, policyId] as const,
};
