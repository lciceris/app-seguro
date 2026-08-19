import { useQuery } from "@tanstack/react-query";

import { listQuotationInsurers } from "../../api/list-quotation-insurers";
import { quotationKeys } from "../../constants/query-keys";

export function useQuotationInsurers(quotationId: string) {
  return useQuery({
    queryKey: quotationKeys.insurers(quotationId),
    queryFn: () => listQuotationInsurers(quotationId),
  });
}
