import { useMutation, useQueryClient } from "@tanstack/react-query";

import { setWinningInsurer } from "../../api/set-winning-insurer";
import { quotationKeys } from "../../constants/query-keys";

export function useSetWinningInsurer(quotationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setWinningInsurer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.insurers(quotationId) });
    },
  });
}
