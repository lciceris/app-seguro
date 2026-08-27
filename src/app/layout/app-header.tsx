import { Bell, Moon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { SidebarTrigger } from "@/shared/components/ui/sidebar";

import { UserMenu } from "./user-menu";

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <SidebarTrigger />
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Tema (em breve)">
          <Moon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Notificações (em breve)">
          <Bell />
        </Button>
        <UserMenu />
      </div>
    </header>
  );
}
