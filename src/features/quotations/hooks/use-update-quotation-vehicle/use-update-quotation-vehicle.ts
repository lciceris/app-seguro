import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateQuotationVehicle } from "../../api/update-quotation-vehicle";
import { quotationKeys } from "../../constants/query-keys";

export function useUpdateQuotationVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateQuotationVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.vehicles(data.quotation_id) });
    },
  });
}
