import { useQuery } from "@tanstack/react-query";

import { listPolicyEndorsementsByChain } from "../../api/list-policy-endorsements-by-chain";
import { policyEndorsementKeys } from "../../constants/query-keys";

export function usePolicyEndorsementsByChain(policyId: string) {
  return useQuery({
    queryKey: policyEndorsementKeys.chain(policyId),
    queryFn: () => listPolicyEndorsementsByChain(policyId),
  });
}
