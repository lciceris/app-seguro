import { useEffect } from "react";

import { AccountDeactivatedScreen, useLogout } from "@/features/auth";

export function AccountDeactivatedPage() {
  const logout = useLogout();

  useEffect(() => {
    logout.mutate();
    // logout.mutate é estável; incluir o objeto `logout` inteiro causaria loop,
    // já que seu estado (isPending/isSuccess) muda a cada chamada.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logout.mutate]);

  return <AccountDeactivatedScreen />;
}
