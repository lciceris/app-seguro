import { useMutation } from "@tanstack/react-query";

import { updateUserPassword } from "../../api/update-user-password";

export function useUpdateUserPassword() {
  return useMutation({
    mutationFn: updateUserPassword,
  });
}
