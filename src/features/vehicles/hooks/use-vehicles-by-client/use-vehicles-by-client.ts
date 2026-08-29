import { useQuery } from "@tanstack/react-query";

import { listVehiclesByClient } from "../../api/list-vehicles-by-client";
import { vehicleKeys } from "../../constants/query-keys";

export function useVehiclesByClient(clientId: string) {
  return useQuery({
    queryKey: vehicleKeys.listByClient(clientId),
    queryFn: () => listVehiclesByClient(clientId),
  });
}
