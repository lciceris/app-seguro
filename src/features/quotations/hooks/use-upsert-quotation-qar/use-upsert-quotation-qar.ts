import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { upsertQuotationQar, type UpsertQuotationQarInput } from "../../api/upsert-quotation-qar";
import { quotationKeys } from "../../constants/query-keys";

export function useUpsertQuotationQar() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: Omit<UpsertQuotationQarInput, "brokerage_id">) =>
      upsertQuotationQar({ ...input, brokerage_id: brokerageId! }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.qar(data.quotation_id) });
    },
  });
}
