import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addClientSeller } from "../../api/add-client-seller";
import { clientKeys } from "../../constants/query-keys";

export function useAddClientSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addClientSeller,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.sellers(variables.clientId) });
    },
  });
}
