# Tasks — sidebar-flat-nav

- [x] 1. `app-sidebar.tsx`
  - [x] 1.1 Achata `NAV_GROUPS` num array único, remove `SidebarGroupLabel` e o `.map` por grupo — um só `SidebarGroup`/`SidebarMenu`
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Item: `text-[14.5px] font-medium`, ativo com `!font-bold` (mantendo `!bg-primary/10 !text-primary` já existentes)
    - _Requirements: 2.1, 2.2_

- [x] 2. Ajustar `app-sidebar.test.tsx`
  - [x] 2.1 Troca as 3 asserções em cima do texto do rótulo de grupo por asserções em item real (rótulo não existe mais)
    - _Requirements: 1.1_
  - [x] 2.2 (achado depois, ao revisar specs/testes da rodada) `e2e/app-shell.spec.ts` também tinha 2 asserções em cima do texto do rótulo (`getByText("Minha corretora")`/`getByText("Plataforma")` `.not.toBeVisible()`) — passavam de forma vazia (o texto nunca mais existe, pra nenhum papel) sem testar o filtro por papel de verdade. Trocadas por `getByRole("link", { name: "Dados da corretora" })`/`"Corretoras"` `.not.toBeVisible()`, que preservam a intenção original. Rodado `npx playwright test` completo pra conferir: 5 specs falharam na primeira passada só por timeout de login (flakiness do servidor/Supabase compartilhado sob carga de 25 specs sequenciais), todos passaram isolados depois — sem regressão real.
    - _Requirements: 1.1_

- [x] 3. Verificação
  - [x] 3.1 `tsc --noEmit`, `eslint`, `vitest run` completos — todos limpos
    - _Requirements: —_
  - [x] 3.2 Verificação visual via Playwright — confirmar lista contínua sem gap diferenciado, `font-size: 14.5px` via computed style, `font-weight: 700` no ativo
    - _Requirements: 1.1, 1.2, 2.1, 2.2_
