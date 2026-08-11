import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { disableInsurer } from "../../api/disable-insurer";
import { insurerKeys } from "../../constants/query-keys";

export function useDisableInsurer() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (insurerId: string) => disableInsurer({ brokerageId: brokerageId!, insurerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insurerKeys.catalog() });
    },
  });
}
