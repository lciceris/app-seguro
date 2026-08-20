import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPolicyEndorsement } from "../../api/create-policy-endorsement";
import { policyEndorsementKeys } from "../../constants/query-keys";

export function useCreatePolicyEndorsement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPolicyEndorsement,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: policyEndorsementKeys.chain(data.policy_id) });
    },
  });
}
