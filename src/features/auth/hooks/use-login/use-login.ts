import { useMutation } from "@tanstack/react-query";

import { getSession } from "../../api/get-session";
import { login } from "../../api/login";
import { useAuthStore } from "../../store/auth-store";

interface LoginInput {
  email: string;
  password: string;
}

export function useLogin() {
  const setUsuario = useAuthStore((state) => state.setUsuario);

  return useMutation({
    mutationFn: async ({ email, password }: LoginInput) => {
      await login(email, password);
      return getSession();
    },
    onSuccess: (usuario) => {
      setUsuario(usuario);
    },
  });
}
