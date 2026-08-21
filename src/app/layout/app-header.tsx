import { SidebarTrigger } from "@/shared/components/ui/sidebar";

import { UserMenu } from "./user-menu";

export function AppHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <SidebarTrigger />
      <UserMenu />
    </header>
  );
}
