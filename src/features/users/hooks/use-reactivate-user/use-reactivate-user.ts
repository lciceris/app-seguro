import { useMutation, useQueryClient } from "@tanstack/react-query";

import { reactivateUser } from "../../api/reactivate-user";
import { userKeys } from "../../constants/query-keys";

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reactivateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
}
