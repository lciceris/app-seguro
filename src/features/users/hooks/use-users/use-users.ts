import { useQuery } from "@tanstack/react-query";

import { listUsers } from "../../api/list-users";
import { userKeys } from "../../constants/query-keys";

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: listUsers,
  });
}
