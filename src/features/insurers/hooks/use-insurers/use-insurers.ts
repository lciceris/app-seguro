import { useQuery } from "@tanstack/react-query";

import { listInsurers } from "../../api/list-insurers";
import { insurerKeys } from "../../constants/query-keys";

export function useInsurers() {
  return useQuery({
    queryKey: insurerKeys.lists(),
    queryFn: listInsurers,
  });
}
