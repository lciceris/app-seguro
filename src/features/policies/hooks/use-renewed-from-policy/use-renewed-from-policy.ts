import { useQuery } from "@tanstack/react-query";

import { getRenewedFromPolicy } from "../../api/get-renewed-from-policy";
import { policyKeys } from "../../constants/query-keys";

export function useRenewedFromPolicy(renewedFromPolicyId: string | null) {
  return useQuery({
    queryKey: policyKeys.renewedFromSummary(renewedFromPolicyId ?? "none"),
    queryFn: () => getRenewedFromPolicy(renewedFromPolicyId!),
    enabled: renewedFromPolicyId !== null,
  });
}
