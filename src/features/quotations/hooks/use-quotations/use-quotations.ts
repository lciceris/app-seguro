import { useQuery } from "@tanstack/react-query";

import { listQuotations } from "../../api/list-quotations";
import { quotationKeys } from "../../constants/query-keys";

export function useQuotations() {
  return useQuery({
    queryKey: quotationKeys.lists(),
    queryFn: listQuotations,
  });
}
