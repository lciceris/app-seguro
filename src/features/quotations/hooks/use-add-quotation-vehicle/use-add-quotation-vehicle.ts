import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addQuotationVehicle } from "../../api/add-quotation-vehicle";
import { quotationKeys } from "../../constants/query-keys";

export function useAddQuotationVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addQuotationVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.vehicles(data.quotation_id) });
    },
  });
}
