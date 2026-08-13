import { useQuery } from "@tanstack/react-query";

import { listClientSellers } from "../../api/list-client-sellers";
import { clientKeys } from "../../constants/query-keys";

export function useClientSellers(clientId: string) {
  return useQuery({
    queryKey: clientKeys.sellers(clientId),
    queryFn: () => listClientSellers(clientId),
  });
}
