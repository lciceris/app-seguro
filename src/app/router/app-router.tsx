import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/features/auth";
import { HomePage } from "@/pages/home/home-page";
import { LoginPage } from "@/pages/login/login-page";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
