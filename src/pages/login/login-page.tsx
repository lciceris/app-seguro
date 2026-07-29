import { Navigate } from "react-router-dom";

import { INITIAL_ROUTE_BY_ROLE, LoginScreen, useSession } from "@/features/auth";

export function LoginPage() {
  const { data: usuario, isLoading } = useSession();

  if (!isLoading && usuario) {
    return <Navigate to={INITIAL_ROUTE_BY_ROLE[usuario.role]} replace />;
  }

  return <LoginScreen />;
}
