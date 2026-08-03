import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reactivateBrokerage } from "../../api/reactivate-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useReactivateBrokerage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateBrokerage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: brokerageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brokerageKeys.detail(data.id) });
    },
  });
}
