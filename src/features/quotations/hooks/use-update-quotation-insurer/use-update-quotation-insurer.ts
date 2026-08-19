import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import {
  updateQuotationInsurer,
  type UpdateQuotationInsurerInput,
} from "../../api/update-quotation-insurer";
import { quotationInsurerEventKeys, quotationKeys } from "../../constants/query-keys";

export function useUpdateQuotationInsurer(quotationId: string) {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: Omit<UpdateQuotationInsurerInput, "brokerage_id">) =>
      updateQuotationInsurer({ ...input, brokerage_id: brokerageId! }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.insurers(quotationId) });
      queryClient.invalidateQueries({ queryKey: quotationInsurerEventKeys.list(data.id) });
    },
  });
}
