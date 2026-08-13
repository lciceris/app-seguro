import { useQuery } from "@tanstack/react-query";

import { getClient } from "../../api/get-client";
import { clientKeys } from "../../constants/query-keys";

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClient(id),
  });
}
