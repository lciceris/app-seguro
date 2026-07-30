import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateUser } from "../../api/update-user";
import { userKeys } from "../../constants/query-keys";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
}
