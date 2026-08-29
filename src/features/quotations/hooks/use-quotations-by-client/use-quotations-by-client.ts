import { useQuery } from "@tanstack/react-query";

import { listQuotationsByClient } from "../../api/list-quotations-by-client";
import { quotationKeys } from "../../constants/query-keys";

export function useQuotationsByClient(clientId: string) {
  return useQuery({
    queryKey: quotationKeys.listByClient(clientId),
    queryFn: () => listQuotationsByClient(clientId),
  });
}
