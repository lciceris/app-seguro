import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateOwnBrokerage } from "../../api/update-own-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useUpdateOwnBrokerage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOwnBrokerage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brokerageKeys.own() });
    },
  });
}
