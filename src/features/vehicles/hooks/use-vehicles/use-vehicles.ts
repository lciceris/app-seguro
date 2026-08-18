import { useQuery } from "@tanstack/react-query";

import { listVehicles } from "../../api/list-vehicles";
import { vehicleKeys } from "../../constants/query-keys";

export function useVehicles() {
  return useQuery({
    queryKey: vehicleKeys.lists(),
    queryFn: listVehicles,
  });
}
