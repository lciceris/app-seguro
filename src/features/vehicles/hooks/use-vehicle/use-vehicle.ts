import { useQuery } from "@tanstack/react-query";

import { getVehicle } from "../../api/get-vehicle";
import { vehicleKeys } from "../../constants/query-keys";

export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => getVehicle(id),
  });
}
