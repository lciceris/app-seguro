import { useQuery } from "@tanstack/react-query";

import { getPolicy } from "../../api/get-policy";
import { policyKeys } from "../../constants/query-keys";

export function usePolicy(id: string) {
  return useQuery({
    queryKey: policyKeys.detail(id),
    queryFn: () => getPolicy(id),
  });
}
