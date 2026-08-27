# Tasks — sidebar-flat-nav

- [x] 1. `app-sidebar.tsx`
  - [x] 1.1 Achata `NAV_GROUPS` num array único, remove `SidebarGroupLabel` e o `.map` por grupo — um só `SidebarGroup`/`SidebarMenu`
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 Item: `text-[14.5px] font-medium`, ativo com `!font-bold` (mantendo `!bg-primary/10 !text-primary` já existentes)
    - _Requirements: 2.1, 2.2_

- [x] 2. Ajustar `app-sidebar.test.tsx`
  - [x] 2.1 Troca as 3 asserções em cima do texto do rótulo de grupo por asserções em item real (rótulo não existe mais)
    - _Requirements: 1.1_

- [x] 3. Verificação
  - [x] 3.1 `tsc --noEmit`, `eslint`, `vitest run` completos — todos limpos
    - _Requirements: —_
  - [x] 3.2 Verificação visual via Playwright — confirmar lista contínua sem gap diferenciado, `font-size: 14.5px` via computed style, `font-weight: 700` no ativo
    - _Requirements: 1.1, 1.2, 2.1, 2.2_
