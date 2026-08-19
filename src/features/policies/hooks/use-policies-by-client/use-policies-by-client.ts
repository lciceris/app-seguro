import { useQuery } from "@tanstack/react-query";

import { listPoliciesByClient } from "../../api/list-policies-by-client";
import { policyKeys } from "../../constants/query-keys";

export function usePoliciesByClient(clientId: string) {
  return useQuery({
    queryKey: policyKeys.listByClient(clientId),
    queryFn: () => listPoliciesByClient(clientId),
  });
}
