import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { enableInsurer } from "../../api/enable-insurer";
import { insurerKeys } from "../../constants/query-keys";

export function useEnableInsurer() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (insurerId: string) => enableInsurer({ brokerageId: brokerageId!, insurerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insurerKeys.catalog() });
    },
  });
}
