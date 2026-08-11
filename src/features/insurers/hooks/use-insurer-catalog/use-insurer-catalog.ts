import { useQuery } from "@tanstack/react-query";

import { listInsurerCatalog } from "../../api/list-insurer-catalog";
import { insurerKeys } from "../../constants/query-keys";

export function useInsurerCatalog() {
  return useQuery({
    queryKey: insurerKeys.catalog(),
    queryFn: listInsurerCatalog,
  });
}
