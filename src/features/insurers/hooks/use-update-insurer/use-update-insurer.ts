import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateInsurer } from "../../api/update-insurer";
import { insurerKeys } from "../../constants/query-keys";

export function useUpdateInsurer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInsurer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: insurerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: insurerKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: insurerKeys.catalog() });
    },
  });
}
