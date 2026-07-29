import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { getSession } from "../../api/get-session";
import { authKeys } from "../../constants/query-keys";
import { useAuthStore } from "../../store/auth-store";

export function useSession() {
  const setUsuario = useAuthStore((state) => state.setUsuario);

  const query = useQuery({
    queryKey: authKeys.session,
    queryFn: getSession,
  });

  useEffect(() => {
    if (query.data !== undefined) {
      setUsuario(query.data);
    }
  }, [query.data, setUsuario]);

  return query;
}
