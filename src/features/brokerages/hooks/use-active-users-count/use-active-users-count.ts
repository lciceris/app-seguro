import { useQuery } from "@tanstack/react-query";

import { countActiveUsers } from "../../api/count-active-users";
import { brokerageKeys } from "../../constants/query-keys";

export function useActiveUsersCount(brokerageId: string) {
  return useQuery({
    queryKey: [...brokerageKeys.detail(brokerageId), "active-users-count"],
    queryFn: () => countActiveUsers(brokerageId),
  });
}
