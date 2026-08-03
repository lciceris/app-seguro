import { useQuery } from "@tanstack/react-query";

import { getBrokerage } from "../../api/get-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useBrokerage(id: string) {
  return useQuery({
    queryKey: brokerageKeys.detail(id),
    queryFn: () => getBrokerage(id),
  });
}
