import { useQuery } from "@tanstack/react-query";

import { getInsurer } from "../../api/get-insurer";
import { insurerKeys } from "../../constants/query-keys";

export function useInsurer(id: string) {
  return useQuery({
    queryKey: insurerKeys.detail(id),
    queryFn: () => getInsurer(id),
  });
}
