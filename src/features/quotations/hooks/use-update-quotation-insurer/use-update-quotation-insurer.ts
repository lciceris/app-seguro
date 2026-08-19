import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  updateQuotationInsurer,
  type UpdateQuotationInsurerInput,
} from "../../api/update-quotation-insurer";
import { quotationKeys } from "../../constants/query-keys";

export function useUpdateQuotationInsurer(quotationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateQuotationInsurerInput) => updateQuotationInsurer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.insurers(quotationId) });
    },
  });
}
