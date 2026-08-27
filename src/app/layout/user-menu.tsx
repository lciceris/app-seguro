import { ChevronDown, LogOut, User } from "lucide-react";

import { useAuthStore, useLogout } from "@/features/auth";
import { ROLE_LABELS } from "@/features/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return initials
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export function UserMenu() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useLogout();

  if (!usuario) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={usuario.avatar_url ?? undefined} alt={usuario.full_name} />
            <AvatarFallback>{getInitials(usuario.full_name)}</AvatarFallback>
          </Avatar>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="font-medium text-foreground">{usuario.full_name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {ROLE_LABELS[usuario.role]}
            </span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground sm:block" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={usuario.avatar_url ?? undefined} alt={usuario.full_name} />
            <AvatarFallback>{getInitials(usuario.full_name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate font-semibold text-foreground">{usuario.full_name}</span>
            <span className="truncate text-xs text-muted-foreground">{usuario.email}</span>
            <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {ROLE_LABELS[usuario.role]}
            </span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <User />
          Meu perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate()}>
          <LogOut />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
