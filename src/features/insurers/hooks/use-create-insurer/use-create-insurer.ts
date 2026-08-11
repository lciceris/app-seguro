import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createInsurer } from "../../api/create-insurer";
import { insurerKeys } from "../../constants/query-keys";

export function useCreateInsurer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInsurer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insurerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: insurerKeys.catalog() });
    },
  });
}
