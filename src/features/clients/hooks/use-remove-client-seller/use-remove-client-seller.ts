import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeClientSeller } from "../../api/remove-client-seller";
import { clientKeys } from "../../constants/query-keys";

export function useRemoveClientSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeClientSeller,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.sellers(variables.clientId) });
    },
  });
}
