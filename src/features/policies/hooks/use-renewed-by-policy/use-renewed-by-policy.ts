import { useQuery } from "@tanstack/react-query";

import { getRenewedByPolicy } from "../../api/get-renewed-by-policy";
import { policyKeys } from "../../constants/query-keys";

export function useRenewedByPolicy(policyId: string) {
  return useQuery({
    queryKey: policyKeys.renewedBy(policyId),
    queryFn: () => getRenewedByPolicy(policyId),
  });
}
