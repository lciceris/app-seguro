import { useMutation } from "@tanstack/react-query";

import { setPassword } from "../../api/set-password";

export function useSetPassword() {
  return useMutation({
    mutationFn: (password: string) => setPassword(password),
  });
}
