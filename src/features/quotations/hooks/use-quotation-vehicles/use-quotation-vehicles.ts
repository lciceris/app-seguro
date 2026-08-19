import { useQuery } from "@tanstack/react-query";

import { listQuotationVehicles } from "../../api/list-quotation-vehicles";
import { quotationKeys } from "../../constants/query-keys";

export function useQuotationVehicles(quotationId: string) {
  return useQuery({
    queryKey: quotationKeys.vehicles(quotationId),
    queryFn: () => listQuotationVehicles(quotationId),
  });
}
