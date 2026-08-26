# Tasks — sidebar-light-redesign

- [x] 1. Tokens claros em `globals.css`
  - [x] 1.1 `--sidebar`, `--sidebar-foreground`, `--sidebar-primary(-foreground)`, `--sidebar-accent(-foreground)`, `--sidebar-border` viram claros; `--sidebar-ring` mantém
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. `app-sidebar.tsx`
  - [x] 2.1 Header centralizado (logo/iniciais com borda `primary` + nome, sem subtítulo), borda inferior separando do menu
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Item ativo com `!bg-primary/10 !text-primary` (sem barra lateral), grupos com label uppercase/tracking
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2_

- [x] 3. Verificação
  - [x] 3.1 `tsc --noEmit`, `eslint`, `vitest run` completos — todos limpos
    - _Requirements: —_
  - [x] 3.2 Verificação visual via Playwright — confirmado fundo branco, borda direita, header centralizado com logo/borda na cor primária, item ativo com `bg-primary/10`/`text-primary` (computed style bateu com `--primary` do root, não hex fixo)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.1_
  - [x] 3.3 (bug encontrado no processo) `data-active:` no `sidebarMenuButtonVariants`/`SidebarMenuSubButton` (`sidebar.tsx`) casava por presença do atributo, não pelo valor — `data-active="false"` também ativava o fundo, deixando todo item com tom acinzentado permanente, não só no hover. Corrigido pra `data-[active=true]:` nos dois lugares; reverificado (item inativo em repouso = `rgba(0,0,0,0)`, só F8FAFC no hover real).
    - _Requirements: 1.3_
