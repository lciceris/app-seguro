import { useMutation, useQueryClient } from "@tanstack/react-query";

import { removeQuotationVehicle } from "../../api/remove-quotation-vehicle";
import { quotationKeys } from "../../constants/query-keys";

export function useRemoveQuotationVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeQuotationVehicle,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.vehicles(variables.quotation_id) });
    },
  });
}
