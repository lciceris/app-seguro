import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deactivateBrokerage } from "../../api/deactivate-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useDeactivateBrokerage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateBrokerage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: brokerageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brokerageKeys.detail(data.id) });
    },
  });
}
