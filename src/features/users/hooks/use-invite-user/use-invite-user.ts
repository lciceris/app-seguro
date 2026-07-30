import { useMutation, useQueryClient } from "@tanstack/react-query";

import { inviteUser } from "../../api/invite-user";
import { userKeys } from "../../constants/query-keys";

export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
