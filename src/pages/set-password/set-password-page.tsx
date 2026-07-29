import { Navigate } from "react-router-dom";

import { SetPasswordScreen, useSession } from "@/features/auth";

export function SetPasswordPage() {
  const { data: usuario, isLoading } = useSession();

  if (isLoading) return null;

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <SetPasswordScreen />;
}
