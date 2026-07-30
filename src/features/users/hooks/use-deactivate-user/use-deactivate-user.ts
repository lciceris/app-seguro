import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deactivateUser } from "../../api/deactivate-user";
import { userKeys } from "../../constants/query-keys";

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
}
