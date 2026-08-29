import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { swapBrokerageInsurerOrder } from "../../api/reorder-brokerage-insurer";
import { insurerKeys } from "../../constants/query-keys";

export function useReorderBrokerageInsurer() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: {
      first: { insurerId: string; display_order: number };
      second: { insurerId: string; display_order: number };
    }) => swapBrokerageInsurerOrder({ brokerageId: brokerageId!, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insurerKeys.catalog() });
    },
  });
}
