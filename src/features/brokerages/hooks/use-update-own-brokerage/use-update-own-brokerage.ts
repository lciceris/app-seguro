import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/features/auth";

import { updateOwnBrokerage } from "../../api/update-own-brokerage";
import { brokerageKeys } from "../../constants/query-keys";

export function useUpdateOwnBrokerage() {
  const queryClient = useQueryClient();
  const usuario = useAuthStore((state) => state.usuario);
  const setUsuario = useAuthStore((state) => state.setUsuario);

  return useMutation({
    mutationFn: updateOwnBrokerage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: brokerageKeys.own() });
      if (usuario) {
        setUsuario({
          ...usuario,
          brokerage_name: data.name,
          primary_color: data.primary_color,
          logo_url: data.logo_url,
        });
      }
    },
  });
}
