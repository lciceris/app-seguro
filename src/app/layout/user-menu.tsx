import { useAuthStore, useLogout } from "@/features/auth";
import { ROLE_LABELS } from "@/features/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
          <span className="hidden font-medium text-foreground sm:inline">{usuario.full_name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-medium text-foreground">{usuario.full_name}</span>
          <span className="text-xs font-normal text-muted-foreground">{usuario.email}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {ROLE_LABELS[usuario.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Meu perfil</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => logout.mutate()}>Sair</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
