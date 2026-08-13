import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateClient } from "../../api/update-client";
import { clientKeys } from "../../constants/query-keys";

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(data.id) });
    },
  });
}
