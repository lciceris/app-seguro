import { useQuery } from "@tanstack/react-query";

import { listPolicies } from "../../api/list-policies";
import { policyKeys } from "../../constants/query-keys";

export function usePolicies() {
  return useQuery({
    queryKey: policyKeys.lists(),
    queryFn: listPolicies,
  });
}
