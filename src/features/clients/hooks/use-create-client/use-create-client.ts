import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { createClient, type CreateClientInput } from "../../api/create-client";
import { clientKeys } from "../../constants/query-keys";

export function useCreateClient() {
  const queryClient = useQueryClient();
  const brokerageId = useAuthStore((state) => state.usuario?.brokerage_id);

  return useMutation({
    mutationFn: (input: Omit<CreateClientInput, "brokerage_id">) =>
      createClient({ ...input, brokerage_id: brokerageId! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
