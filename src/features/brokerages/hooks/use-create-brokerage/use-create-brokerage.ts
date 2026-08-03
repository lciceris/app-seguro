import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createBrokerage } from "../../api/create-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useCreateBrokerage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBrokerage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brokerageKeys.lists() });
    },
  });
}
