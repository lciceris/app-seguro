import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setPrimaryClientSeller } from "../../api/set-primary-client-seller";
import { clientKeys } from "../../constants/query-keys";

export interface SetPrimaryClientSellerInput {
  id: string;
  clientId: string;
}

export function useSetPrimaryClientSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: SetPrimaryClientSellerInput) => setPrimaryClientSeller(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.sellers(variables.clientId) });
    },
  });
}
