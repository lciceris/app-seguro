import { useQuery } from "@tanstack/react-query";

import { listBrokerages } from "../../api/list-brokerages";
import { brokerageKeys } from "../../constants/query-keys";

export function useBrokerages() {
  return useQuery({
    queryKey: brokerageKeys.lists(),
    queryFn: listBrokerages,
  });
}
