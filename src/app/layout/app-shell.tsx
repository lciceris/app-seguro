import { Outlet } from "react-router-dom";

import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

// Renderizado dentro de um <ProtectedRoute/> sem allowedRoles (app-router.tsx)
// — por isso pode assumir que `usuario` já está carregado e ativo, sem
// precisar chamar useSession() de novo (ver .agents/specs/app-shell/design.md).
export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-muted p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
