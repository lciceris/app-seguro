import { Navigate } from "react-router-dom";

import { LoginScreen, useSession } from "@/features/auth";

export function LoginPage() {
  const { data: usuario, isLoading } = useSession();

  if (!isLoading && usuario) {
    // Redireciona pra rota inicial por perfil — tabela real entra na Task 7 (proteção de rota).
    return <Navigate to="/" replace />;
  }

  return <LoginScreen />;
}
