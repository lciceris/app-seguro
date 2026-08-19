import { useMutation, useQueryClient } from "@tanstack/react-query";

import { advanceQuotationStatus } from "../../api/advance-quotation-status";
import { quotationKeys } from "../../constants/query-keys";

export function useAdvanceQuotationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: advanceQuotationStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(data.id) });
    },
  });
}
