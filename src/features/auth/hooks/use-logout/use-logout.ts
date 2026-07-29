import { useMutation, useQueryClient } from "@tanstack/react-query";

import { logout } from "../../api/logout";
import { authKeys } from "../../constants/query-keys";
import { useAuthStore } from "../../store/auth-store";

export function useLogout() {
  const clearUsuario = useAuthStore((state) => state.clearUsuario);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUsuario();
      queryClient.setQueryData(authKeys.session, null);
    },
  });
}
