import { useMutation } from "@tanstack/react-query";

import { logout } from "../../api/logout";
import { useAuthStore } from "../../store/auth-store";

export function useLogout() {
  const clearUsuario = useAuthStore((state) => state.clearUsuario);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearUsuario();
    },
  });
}
