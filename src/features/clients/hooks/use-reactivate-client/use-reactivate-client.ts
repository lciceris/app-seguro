import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reactivateClient } from "../../api/reactivate-client";
import { clientKeys } from "../../constants/query-keys";

export function useReactivateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.id) });
    },
  });
}
