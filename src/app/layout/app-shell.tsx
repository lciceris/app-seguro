import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

// Renderizado dentro de um <ProtectedRoute/> sem allowedRoles (app-router.tsx)
// — por isso pode assumir que `usuario` já está carregado e ativo, sem
// precisar chamar useSession() de novo (ver .agents/specs/app-shell/design.md).
export function AppShell() {
  const primaryColor = useAuthStore((state) => state.usuario?.primary_color);

  // --primary é lido via bg-primary/text-primary/border-primary em todo o app
  // (sidebar, botões, badge de cargo) — setar aqui faz a cor da corretora
  // propagar sem precisar de um token por componente (ver sidebar-light-redesign).
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty("--primary", primaryColor);
    } else {
      document.documentElement.style.removeProperty("--primary");
    }
  }, [primaryColor]);

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
