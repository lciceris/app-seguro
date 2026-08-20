import { useMutation, useQueryClient } from "@tanstack/react-query";

import { advancePolicyEndorsementStatus } from "../../api/advance-policy-endorsement-status";
import { policyEndorsementKeys, policyVehicleKeys } from "../../constants/query-keys";

export function useAdvancePolicyEndorsementStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: advancePolicyEndorsementStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: policyEndorsementKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: policyEndorsementKeys.chain(data.policy_id) });
      queryClient.invalidateQueries({ queryKey: policyVehicleKeys.byPolicy(data.policy_id) });
      if (data.new_policy_id) {
        queryClient.invalidateQueries({ queryKey: policyVehicleKeys.byPolicy(data.new_policy_id) });
      }
    },
  });
}
