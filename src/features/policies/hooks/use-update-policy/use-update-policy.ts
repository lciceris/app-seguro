import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updatePolicy } from "../../api/update-policy";
import { policyKeys } from "../../constants/query-keys";

export function useUpdatePolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePolicy,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: policyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: policyKeys.detail(data.id) });
    },
  });
}
