import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deactivateClient } from "../../api/deactivate-client";
import { clientKeys } from "../../constants/query-keys";

export function useDeactivateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.id) });
    },
  });
}
