import { useQuery } from "@tanstack/react-query";

import { listPlans } from "../../api/list-plans";
import { planKeys } from "../../constants/query-keys";

export function usePlans() {
  return useQuery({
    queryKey: planKeys.lists(),
    queryFn: listPlans,
  });
}
