import { useQuery } from "@tanstack/react-query";

import { listClients } from "../../api/list-clients";
import { clientKeys } from "../../constants/query-keys";

export function useClients() {
  return useQuery({
    queryKey: clientKeys.lists(),
    queryFn: listClients,
  });
}
