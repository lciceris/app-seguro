import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth";
import { AccountDeactivatedPage } from "@/pages/account-deactivated/account-deactivated-page";
import { HomePage } from "@/pages/home/home-page";
import { LoginPage } from "@/pages/login/login-page";
import { SetPasswordPage } from "@/pages/set-password/set-password-page";
import { UsersPage } from "@/pages/users/users-page";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />
      <Route path="/account-deactivated" element={<AccountDeactivatedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute allowedRoles={["platform_admin", "brokerage_admin", "supervisor"]} />
        }
      >
        <Route path="/users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}
