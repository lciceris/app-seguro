import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { createQuotation, type CreateQuotationInput } from "../../api/create-quotation";
import { quotationKeys } from "../../constants/query-keys";

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: Omit<CreateQuotationInput, "brokerage_id">) =>
      createQuotation({ ...input, brokerage_id: brokerageId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
    },
  });
}
