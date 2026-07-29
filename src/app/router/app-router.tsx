import { Route, Routes } from "react-router-dom";

import { LoginPage } from "@/pages/login/login-page";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}
