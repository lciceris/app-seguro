import { useQuery } from "@tanstack/react-query";

import { listPoliciesByClientDetailed } from "../../api/list-policies-by-client-detailed";
import { policyKeys } from "../../constants/query-keys";

export function usePoliciesByClientDetailed(clientId: string) {
  return useQuery({
    queryKey: policyKeys.listByClientDetailed(clientId),
    queryFn: () => listPoliciesByClientDetailed(clientId),
  });
}
