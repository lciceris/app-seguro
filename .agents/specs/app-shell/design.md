# Design — app-shell

## Overview

Spec puramente de frontend — sem migration, sem RLS, sem tabela nova. Três peças:

1. **Primitivos shadcn novos**: `sidebar`, `avatar`, `dropdown-menu` (via `npx shadcn add`) — o bloco `sidebar` do shadcn já traz colapso responsivo (desktop fixo / mobile off-canvas em `Sheet`) pronto, então o Requirement 5 (responsividade) é resolvido de graça, sem código customizado.
2. **Composição do shell**: `src/app/layout/` — `AppShell` (provider + sidebar + header + `<Outlet/>`), `AppSidebar`, `AppHeader`, `UserMenu`, e `nav-items.ts` (a única fonte de verdade dos itens de menu).
3. **Uma mudança em `app-router.tsx`**: uma única `<Route element={<AppShell />}>` envolvendo todas as rotas autenticadas já existentes — nenhuma delas muda de comportamento.

## `nav-items.ts` — fonte única dos itens de menu

Hoje `app-router.tsx` já declara `allowedRoles` inline em cada `<ProtectedRoute>` de topo. Pra não duplicar essa lista (Requirement 2.2), `nav-items.ts` vira a fonte de verdade, e `app-router.tsx` passa a importar `allowedRoles` de lá em vez de repetir o array:

```ts
// src/app/layout/nav-items.ts
import type { LucideIcon } from "lucide-react";
import { Home, FileText, ShieldCheck, Users, Truck, UserCog, Building2, Landmark } from "lucide-react";
import type { Database } from "@/shared/lib/supabase";

type Role = Database["public"]["Enums"]["user_role"];

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  allowedRoles?: Role[]; // undefined = todo perfil autenticado (ex.: "/")
}

export interface NavGroup {
  label: string | null; // null = grupo sem título (Início)
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ to: "/", label: "Início", icon: Home }],
  },
  {
    label: "Operação",
    items: [
      {
        to: "/quotations",
        label: "Cotações",
        icon: FileText,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor", "analyst", "seller", "viewer"],
      },
      {
        to: "/policies",
        label: "Apólices",
        icon: ShieldCheck,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor", "analyst", "seller", "viewer"],
      },
      {
        to: "/clients",
        label: "Clientes",
        icon: Users,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor", "seller", "viewer"],
      },
      {
        to: "/vehicles",
        label: "Veículos",
        icon: Truck,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor", "seller"],
      },
    ],
  },
  {
    label: "Minha corretora",
    items: [
      {
        to: "/users",
        label: "Usuários",
        icon: UserCog,
        allowedRoles: ["platform_admin", "brokerage_admin", "supervisor"],
      },
      {
        to: "/my-brokerage",
        label: "Dados da corretora",
        icon: Building2,
        allowedRoles: ["platform_admin", "brokerage_admin"],
      },
      {
        to: "/my-insurers",
        label: "Seguradoras contratadas",
        icon: Landmark,
        allowedRoles: ["platform_admin", "brokerage_admin"],
      },
    ],
  },
  {
    label: "Plataforma",
    items: [
      {
        to: "/brokerages",
        label: "Corretoras",
        icon: Building2,
        allowedRoles: ["platform_admin"],
      },
      {
        to: "/admin/insurers",
        label: "Seguradoras (catálogo)",
        icon: Landmark,
        allowedRoles: ["platform_admin"],
      },
    ],
  },
];
```

Rótulos "Dados da corretora"/"Seguradoras contratadas" (grupo "Minha corretora") vs. "Corretoras"/"Seguradoras (catálogo)" (grupo "Plataforma") resolvem o Requirement 2.4 — só `platform_admin` vê o grupo "Plataforma", então a confusão só existiria pra ele, e os rótulos + agrupamento em seções separadas deixam claro qual é qual.

Um `NavGroup` inteiro some da sidebar se nenhum item dele sobra depois do filtro por role (`items.filter(i => !i.allowedRoles || i.allowedRoles.includes(role))`).

## `app-router.tsx` — mudança mínima

```tsx
import { AppShell } from "@/app/layout/app-shell";
import { NAV_GROUPS } from "@/app/layout/nav-items";

function allowedRolesFor(to: string) {
  return NAV_GROUPS.flatMap((g) => g.items).find((i) => i.to === to)?.allowedRoles;
}
```

Cada `<ProtectedRoute allowedRoles={[...]} />` de topo troca o array inline por `allowedRolesFor("/clients")` etc. — mesmo comportamento, uma fonte só. A árvore de rotas ganha um wrapper a mais:

```tsx
<Route path="/login" element={<LoginPage />} />
<Route path="/set-password" element={<SetPasswordPage />} />
<Route path="/account-deactivated" element={<AccountDeactivatedPage />} />

<Route element={<ProtectedRoute />}>
  <Route element={<AppShell />}>
    {/* toda a árvore de rotas autenticadas já existente, sem mudar */}
  </Route>
</Route>
```

O `<ProtectedRoute />` mais externo (sem `allowedRoles`) garante que `usuario` já está carregado e ativo antes do `AppShell` montar — o `AppShell` lê `useAuthStore().usuario` direto (sem chamar `useSession()` de novo; `ProtectedRoute` já fez isso e a store já está populada). Os `<ProtectedRoute allowedRoles={...}>` de cada seção continuam exatamente como estão hoje, aninhados dentro do `AppShell`.

## Componentes

### `AppShell` (`src/app/layout/app-shell.tsx`)

```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <AppHeader />
    <main className="flex-1 overflow-y-auto bg-muted p-6">
      <Outlet />
    </main>
  </SidebarInset>
</SidebarProvider>
```

### `AppSidebar` (`src/app/layout/app-sidebar.tsx`)

- `SidebarHeader`: logo da corretora (`usuario.logo_url`, fallback: `usuario.brokerage_name` em texto).
- `SidebarContent`: um `SidebarGroup` por `NavGroup` de `NAV_GROUPS` (pulando grupos vazios pro perfil atual), `SidebarMenuButton` por item, `isActive` via `useLocation().pathname === item.to || pathname.startsWith(item.to + "/")` (com tratamento especial pra `/` — só ativo em match exato, senão toda rota seria "Início" ativo).
- Cor: sidebar em `bg-[#0F172A]` fixo (já documentado como padrão visual no projeto antigo, reaproveitado aqui), item ativo usa `var(--primary)` (cor dinâmica da corretora).

### `AppHeader` (`src/app/layout/app-header.tsx`)

- `SidebarTrigger` (hambúrguer, já vem do primitivo shadcn — abre/fecha em mobile, colapsa em desktop).
- `UserMenu` alinhado à direita.

### `UserMenu` (`src/app/layout/user-menu.tsx`)

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="flex items-center gap-2">
      <Avatar>
        <AvatarImage src={usuario.avatar_url ?? undefined} />
        <AvatarFallback>{getInitials(usuario.full_name)}</AvatarFallback>
      </Avatar>
      <span>{usuario.full_name}</span>
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>
      {usuario.full_name}
      <span className="block text-xs text-muted-foreground">{usuario.email}</span>
      <span className="block text-xs text-muted-foreground">{ROLE_LABELS[usuario.role]}</span>
    </DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem disabled>Meu perfil</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => logout.mutate()}>Sair</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

`usuario.email` não existe hoje na store (`Usuario` só tem `id/brokerage_id/role/status/full_name/avatar_url/brokerage_*`) — precisa entrar em `getSession`/`Usuario` (spec `auth`, já embeda de `users`; só adicionar `email` na `select` e no tipo, sem migration). `ROLE_LABELS` já existe em `features/users/constants/role-labels.ts` (exportado no barrel `@/features/users`) — reaproveitado aqui, não cria um segundo.

"Meu perfil" fica **desabilitado** (`disabled`, sem `onClick`/link) — não existe tela ainda (Requirement 4.3), e um item desabilitado é mais honesto que um link morto ou uma rota placeholder sem conteúdo.

## Requirements não cobertos por essa spec (fora de escopo, registrado por transparência)

- Edição de perfil, troca de senha, upload de avatar — spec futura à parte.
- Bottom-nav mobile dedicado — o off-canvas do shadcn sidebar já cobre mobile; um bottom-nav é uma decisão de produto adicional, não pedida aqui.

## Testes

- Componente: `app-sidebar.test.tsx` — perfis diferentes veem grupos/itens diferentes (ex.: `viewer` não vê "Veículos"; só `platform_admin` vê o grupo "Plataforma"); item ativo reflete a rota atual.
- Componente: `user-menu.test.tsx` — mostra nome/e-mail/role; clicar em "Sair" aciona o logout; "Meu perfil" está desabilitado.
- E2E: um teste leve validando que a sidebar aparece com os itens certos pra um perfil (ex. `seller`) e que navegar por ela troca de página — não repete os fluxos de negócio já cobertos pelas specs de cada domínio.
