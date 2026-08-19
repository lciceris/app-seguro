import { useQuery } from "@tanstack/react-query";

import { getQuotationQar } from "../../api/get-quotation-qar";
import { quotationKeys } from "../../constants/query-keys";

export function useQuotationQar(quotationId: string) {
  return useQuery({
    queryKey: quotationKeys.qar(quotationId),
    queryFn: () => getQuotationQar(quotationId),
  });
}
