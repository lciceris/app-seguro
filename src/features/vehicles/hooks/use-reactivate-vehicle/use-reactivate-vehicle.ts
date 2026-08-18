import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reactivateVehicle } from "../../api/reactivate-vehicle";
import { vehicleKeys } from "../../constants/query-keys";

export function useReactivateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
    },
  });
}
