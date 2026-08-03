import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateBrokerage } from "../../api/update-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useUpdateBrokerage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBrokerage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: brokerageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: brokerageKeys.detail(data.id) });
    },
  });
}
