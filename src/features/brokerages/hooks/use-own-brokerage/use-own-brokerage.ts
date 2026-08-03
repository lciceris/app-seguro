import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { getOwnBrokerage } from "../../api/get-own-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useOwnBrokerage() {
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useQuery({
    queryKey: brokerageKeys.own(),
    queryFn: () => getOwnBrokerage(brokerageId!),
    enabled: !!brokerageId,
  });
}
