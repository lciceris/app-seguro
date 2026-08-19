export const policyKeys = {
  all: ["policies"] as const,
  lists: () => [...policyKeys.all, "list"] as const,
  listByClient: (clientId: string) => [...policyKeys.lists(), "by-client", clientId] as const,
  details: () => [...policyKeys.all, "detail"] as const,
  detail: (id: string) => [...policyKeys.details(), id] as const,
  attachments: (policyId: string) => [...policyKeys.detail(policyId), "attachments"] as const,
  renewedBy: (policyId: string) => [...policyKeys.detail(policyId), "renewed-by"] as const,
  renewedFromSummary: (policyId: string) =>
    [...policyKeys.all, "renewed-from-summary", policyId] as const,
};
