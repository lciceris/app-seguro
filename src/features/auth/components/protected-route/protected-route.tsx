import { Navigate, Outlet } from "react-router-dom";

import type { Database } from "@/shared/lib/supabase";

import { INITIAL_ROUTE_BY_ROLE } from "../../constants/initial-route-by-role";
import { useSession } from "../../hooks/use-session";

type UserRole = Database["public"]["Enums"]["user_role"];

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { data: usuario, isLoading } = useSession();

  if (isLoading) return null;

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to={INITIAL_ROUTE_BY_ROLE[usuario.role]} replace />;
  }

  return <Outlet />;
}
