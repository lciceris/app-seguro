import { Bell, Moon, Sun } from "lucide-react";

import { useThemeStore } from "@/shared/store/theme-store";
import { Button } from "@/shared/components/ui/button";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

import { UserMenu } from "./user-menu";

export function AppHeader() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Alternar tema" onClick={toggleTheme}>
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Notificações (em breve)">
          <Bell />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
