import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateVehicle } from "../../api/update-vehicle";
import { vehicleKeys } from "../../constants/query-keys";

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVehicle,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
    },
  });
}
