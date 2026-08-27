# Design Document — sidebar-flat-nav

## `app-sidebar.tsx`

Achata `NAV_GROUPS` num array único de itens (já filtrado por `allowedRoles`) e renderiza um só `SidebarGroup`/`SidebarMenu`, sem `SidebarGroupLabel`:

```diff
-  const groups = NAV_GROUPS.map((group) => ({
-    ...group,
-    items: group.items.filter(
-      (item) => !item.allowedRoles || item.allowedRoles.includes(usuario.role),
-    ),
-  })).filter((group) => group.items.length > 0);
+  const items = NAV_GROUPS.flatMap((group) => group.items).filter(
+    (item) => !item.allowedRoles || item.allowedRoles.includes(usuario.role),
+  );
```

```diff
-{groups.map((group, index) => (
-  <SidebarGroup key={group.label ?? `group-${index}`}>
-    {group.label && <SidebarGroupLabel ...>{group.label}</SidebarGroupLabel>}
-    <SidebarGroupContent><SidebarMenu>
-      {group.items.map((item) => ...)}
-    </SidebarMenu></SidebarGroupContent>
-  </SidebarGroup>
-))}
+<SidebarGroup>
+  <SidebarGroupContent><SidebarMenu>
+    {items.map((item) => ...)}
+  </SidebarMenu></SidebarGroupContent>
+</SidebarGroup>
```

Um só `SidebarGroup` elimina o `p-2` que se acumulava entre grupos anteriores (cada `SidebarGroup` tem padding próprio) — sem isso, não sobra nenhum espaçamento diferenciado entre os antigos blocos, atendendo Requirement 1.2 sem precisar de CSS extra.

`NAV_GROUPS` (em `nav-items.ts`) não muda — continua sendo a fonte de `allowedRoles` e de `allowedRolesFor()`, só deixa de ser usado pra desenhar separação visual.

## Fonte

Plus Jakarta Sans já é a fonte padrão do body (`html { @apply font-sans }` em `globals.css`) — os itens da sidebar já herdam ela, não precisa de classe de família nova. Só tamanho/peso:

```diff
 <SidebarMenuButton
   asChild
   isActive={active}
-  className={active ? "!bg-primary/10 !text-primary" : undefined}
+  className={cn(
+    "text-[14.5px] font-medium",
+    active && "!bg-primary/10 !text-primary !font-bold",
+  )}
 >
```

`!font-bold` com `!important` pelo mesmo motivo do `!bg-primary/10`/`!text-primary` da spec anterior: o variant base (`sidebarMenuButtonVariants`) já tem `data-[active=true]:font-medium`, que empataria/venceria em especificidade contra um `font-bold` sem `!important`.

## Testes existentes afetados

`app-sidebar.test.tsx` tinha 3 asserções em cima do texto do rótulo de grupo (`getByText("Plataforma")`, `queryByText("Plataforma")`, `queryByText("Minha corretora")`) — como o rótulo deixa de existir, viram asserções por item real (ex.: `queryByRole("link", { name: "Usuários" })`), preservando a intenção original (verificar filtro por papel) sem depender de um texto que não é mais renderizado.

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos.
- Verificação visual via Playwright: lista contínua sem nenhum gap/linha diferenciada entre os antigos blocos, tamanho de fonte 14.5px confirmado via computed style, peso 700 no item ativo.
