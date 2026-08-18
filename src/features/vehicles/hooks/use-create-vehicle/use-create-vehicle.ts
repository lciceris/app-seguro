import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { createVehicle, type CreateVehicleInput } from "../../api/create-vehicle";
import { vehicleKeys } from "../../constants/query-keys";

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: Omit<CreateVehicleInput, "brokerage_id">) =>
      createVehicle({ ...input, brokerage_id: brokerageId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
}
