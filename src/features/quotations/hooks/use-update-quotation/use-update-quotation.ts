import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateQuotation } from "../../api/update-quotation";
import { quotationKeys } from "../../constants/query-keys";

export function useUpdateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuotation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: quotationKeys.detail(data.id) });
    },
  });
}
