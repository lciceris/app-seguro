import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/shared/lib/supabase";

import { authKeys } from "../../constants/query-keys";
import { useAuthStore } from "../../store/auth-store";

/**
 * Reage a SIGNED_OUT emitido pelo próprio SDK do Supabase — cobre tanto o logout
 * explícito (useLogout) quanto um refresh token expirado/inválido detectado em
 * background, que o SDK também resolve encerrando a sessão internamente.
 */
export function useAuthStateListener() {
  const clearUsuario = useAuthStore((state) => state.clearUsuario);
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearUsuario();
        queryClient.setQueryData(authKeys.session, null);
      }
    });

    return () => subscription.unsubscribe();
  }, [clearUsuario, queryClient]);
}
