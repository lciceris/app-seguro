import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deactivateVehicle } from "../../api/deactivate-vehicle";
import { vehicleKeys } from "../../constants/query-keys";

export function useDeactivateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
    },
  });
}
