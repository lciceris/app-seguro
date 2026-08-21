# Implementation Plan

- [ ] 1. Fundação
  - [ ] 1.1 `npx shadcn add sidebar avatar dropdown-menu`
    - _Requirements: infra_
  - [ ] 1.2 Criar `src/app/layout/nav-items.ts` (`NAV_GROUPS`) — fonte única dos itens de menu por perfil
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ] 1.3 Adicionar `email` em `getSession`/`Usuario` (spec `auth`, sem migration)
    - _Requirements: 4.1_

- [ ] 2. Componentes do shell
  - [ ] 2.1 Criar `src/app/layout/app-sidebar.tsx` — logo/nome da corretora, grupos de `NAV_GROUPS` filtrados por role (grupo some se ficar vazio), item ativo conforme rota atual
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.2_
  - [ ] 2.2 Criar `src/app/layout/user-menu.tsx` — avatar/nome no trigger; dropdown com nome, e-mail, perfil (`ROLE_LABELS` de `@/features/users`), "Meu perfil" desabilitado, "Sair" (`useLogout`)
    - _Requirements: 3.1, 4.1, 4.2, 4.3_
  - [ ] 2.3 Criar `src/app/layout/app-header.tsx` — `SidebarTrigger` + `UserMenu`
    - _Requirements: 1.1, 5.2_
  - [ ] 2.4 Criar `src/app/layout/app-shell.tsx` — `SidebarProvider` + `AppSidebar` + `SidebarInset` (`AppHeader` + `<Outlet/>`)
    - _Requirements: 1.1, 1.3, 5.1, 5.2_

- [ ] 3. Integração no router
  - [ ] 3.1 Refatorar `app-router.tsx` — cada `<ProtectedRoute allowedRoles={...}>` de topo passa a ler o array de `NAV_GROUPS` em vez de repetir inline
    - _Requirements: 2.2_
  - [ ] 3.2 Envolver a árvore de rotas autenticadas com `<ProtectedRoute><AppShell>...</AppShell></ProtectedRoute>`, sem alterar nenhuma rota internamente
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 4. Testes
  - [ ] 4.1 Teste de componente: `app-sidebar` — perfis diferentes veem grupos/itens diferentes (ex. `viewer` não vê "Veículos"; só `platform_admin` vê o grupo "Plataforma"); item ativo reflete a rota atual
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [ ] 4.2 Teste de componente: `user-menu` — mostra nome/e-mail/perfil; "Sair" aciona `useLogout`; "Meu perfil" está desabilitado
    - _Requirements: 3.1, 4.1, 4.2, 4.3_
  - [ ] 4.3 Teste E2E leve: sidebar mostra os itens certos pra um perfil (`seller`) e navegar por ela troca de página corretamente
    - _Requirements: 1.1, 2.1, 2.2, 2.3_
