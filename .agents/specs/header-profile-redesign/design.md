# Design Document — header-profile-redesign

## `app-header.tsx`

```tsx
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
```

Sem `onClick` nos dois botões — clicáveis visualmente, sem efeito (Requirement 2.3). Sem bolinha/contador no sino pra não sugerir uma notificação que não existe.

## `user-menu.tsx`

Gatilho — nome + cargo empilhados:

```tsx
<button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
  <Avatar className="h-8 w-8">...</Avatar>
  <span className="hidden flex-col items-start leading-tight sm:flex">
    <span className="text-sm font-medium text-foreground">{usuario.full_name}</span>
    <span className="text-xs text-muted-foreground">{ROLE_LABELS[usuario.role]}</span>
  </span>
  <ChevronDown className="h-4 w-4 text-muted-foreground" />
</button>
```

Dropdown — cartão de perfil no topo em vez de `DropdownMenuLabel` com texto simples:

```tsx
<DropdownMenuContent align="end" className="w-64">
  <div className="flex items-center gap-3 px-2 py-2">
    <Avatar className="h-10 w-10">...</Avatar>
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
    <User /> Meu perfil
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem onClick={() => logout.mutate()}>
    <LogOut /> Sair
  </DropdownMenuItem>
</DropdownMenuContent>
```

`bg-primary/10`/`text-primary` no badge de cargo — mesmo padrão já usado no item ativo da sidebar (spec `sidebar-light-redesign`), reaproveitando a cor dinâmica da corretora em vez de introduzir uma cor nova.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos (`user-menu` não tem teste de componente hoje — grep confirma, então nenhum teste existente deve quebrar por causa da estrutura interna do dropdown).
- Verificação visual via Playwright: abrir o dropdown de verdade (não só o gatilho fechado), confirmar avatar maior, badge de cargo, ícones nos itens, e que os botões de tema/notificação não têm handler (só visual).
