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
      <SidebarHeader className="border-b border-sidebar-border px-3 pt-5 pb-4">
        <div className="flex flex-col items-center gap-2 text-center">
          {usuario.logo_url ? (
            <img
              src={usuario.logo_url}
              alt={usuario.brokerage_name ?? "Corretora"}
              className="h-9 w-9 rounded-lg border-2 border-primary object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-primary bg-sidebar-accent text-sm font-bold text-foreground">
              {(usuario.brokerage_name ?? "C").charAt(0).toUpperCase()}
            </div>
          )}
          <span className="max-w-full truncate text-sm font-semibold text-foreground">
            {usuario.brokerage_name ?? "Corretora"}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group, index) => (
          <SidebarGroup key={group.label ?? `group-${index}`}>
            {group.label && (
              <SidebarGroupLabel className="mt-4 mb-0.5 h-auto px-3 py-1.5 text-[10.5px] font-bold tracking-wider text-sidebar-foreground/60 uppercase">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = isItemActive(location.pathname, item.to);
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={active ? "!bg-primary/10 !text-primary" : undefined}
                      >
                        <Link to={item.to}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
