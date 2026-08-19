import { useQuery } from "@tanstack/react-query";

import { getQuotation } from "../../api/get-quotation";
import { quotationKeys } from "../../constants/query-keys";

export function useQuotation(id: string) {
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => getQuotation(id),
  });
}
