import { useQuery } from "@tanstack/react-query";

import { listQuotationInsurerEvents } from "../../api/list-quotation-insurer-events";
import { quotationInsurerEventKeys } from "../../constants/query-keys";

export function useQuotationInsurerEvents(quotationInsurerId: string) {
  return useQuery({
    queryKey: quotationInsurerEventKeys.list(quotationInsurerId),
    queryFn: () => listQuotationInsurerEvents(quotationInsurerId),
  });
}
