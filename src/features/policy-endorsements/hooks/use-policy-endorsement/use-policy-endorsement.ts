import { useQuery } from "@tanstack/react-query";

import { getPolicyEndorsement } from "../../api/get-policy-endorsement";
import { policyEndorsementKeys } from "../../constants/query-keys";

export function usePolicyEndorsement(id: string) {
  return useQuery({
    queryKey: policyEndorsementKeys.detail(id),
    queryFn: () => getPolicyEndorsement(id),
  });
}
