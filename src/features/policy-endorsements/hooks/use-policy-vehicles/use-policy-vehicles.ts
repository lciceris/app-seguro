import { useQuery } from "@tanstack/react-query";

import { listPolicyVehicles } from "../../api/list-policy-vehicles";
import { policyVehicleKeys } from "../../constants/query-keys";

export function usePolicyVehicles(policyId: string) {
  return useQuery({
    queryKey: policyVehicleKeys.byPolicy(policyId),
    queryFn: () => listPolicyVehicles(policyId),
  });
}
