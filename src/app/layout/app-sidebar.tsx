import { Link, useLocation } from "react-router-dom";

import { useAuthStore } from "@/features/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";

import { NAV_GROUPS } from "./nav-items";

function isItemActive(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppSidebar() {
  const usuario = useAuthStore((state) => state.usuario);
  const location = useLocation();

  if (!usuario) return null;

  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.allowedRoles || item.allowedRoles.includes(usuario.role),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <Sidebar>
      <SidebarHeader className="px-2 py-3">
        <div className="flex items-center gap-2 px-2">
          {usuario.logo_url ? (
            <img
              src={usuario.logo_url}
              alt={usuario.brokerage_name ?? "Corretora"}
              className="h-7 w-7 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
              {(usuario.brokerage_name ?? "C").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {usuario.brokerage_name ?? "Corretora"}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, index) => (
          <SidebarGroup key={group.label ?? `group-${index}`}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isItemActive(location.pathname, item.to)}>
                      <Link to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
