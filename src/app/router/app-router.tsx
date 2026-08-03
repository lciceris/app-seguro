import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth";
import { AccountDeactivatedPage } from "@/pages/account-deactivated/account-deactivated-page";
import { HomePage } from "@/pages/home/home-page";
import { LoginPage } from "@/pages/login/login-page";
import { SetPasswordPage } from "@/pages/set-password/set-password-page";
import { AddBrokeragePage } from "@/pages/brokerages/add/add-brokerage-page";
import { BrokeragesPage } from "@/pages/brokerages/brokerages-page";
import { BrokerageDetailPage } from "@/pages/brokerages/[brokerageId]/brokerage-detail-page";
import { AddUserPage } from "@/pages/users/add/add-user-page";
import { EditUserPage } from "@/pages/users/[userId]/edit/edit-user-page";
import { UserDetailPage } from "@/pages/users/[userId]/user-detail-page";
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
        <Route path="/users" element={<UsersPage />}>
          <Route path=":userId" element={<UserDetailPage />} />

          <Route element={<ProtectedRoute allowedRoles={["platform_admin", "brokerage_admin"]} />}>
            <Route path="add" element={<AddUserPage />} />
            <Route path=":userId/edit" element={<EditUserPage />} />
          </Route>
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["platform_admin"]} />}>
        <Route path="/brokerages" element={<BrokeragesPage />}>
          <Route path="add" element={<AddBrokeragePage />} />
          <Route path=":brokerageId" element={<BrokerageDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
