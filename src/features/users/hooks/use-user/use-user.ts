import { useQuery } from "@tanstack/react-query";

import { getUser } from "../../api/get-user";
import { userKeys } from "../../constants/query-keys";

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
  });
}
