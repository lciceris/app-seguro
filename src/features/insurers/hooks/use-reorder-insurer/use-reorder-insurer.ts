import { useMutation, useQueryClient } from "@tanstack/react-query";

import { swapInsurerOrder } from "../../api/reorder-insurer";
import { insurerKeys } from "../../constants/query-keys";

export function useReorderInsurer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: swapInsurerOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insurerKeys.lists() });
    },
  });
}
