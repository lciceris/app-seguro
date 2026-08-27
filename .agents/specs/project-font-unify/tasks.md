# Tasks — project-font-unify

- [x] 1. Sidebar: gap entre itens
  - [x] 1.1 `<SidebarMenu className="gap-1.5">` em `app-sidebar.tsx`
    - _Requirements: 1.1_

- [x] 2. Fonte única no projeto
  - [x] 2.1 Remove import do Inter, token `--font-data` e a regra `table { font-family }` em `globals.css`
    - _Requirements: 2.1_
  - [x] 2.2 `npm uninstall @fontsource-variable/inter`
    - _Requirements: 2.2_
  - [x] 2.3 Atualiza `docs/dev/ui-guidelines.md` (tabela de tipografia)
    - _Requirements: —_

- [x] 3. Verificação
  - [x] 3.1 `tsc --noEmit`, `eslint`, `vitest run` completos — todos limpos
    - _Requirements: —_
  - [x] 3.2 Verificação visual via Playwright — gap real entre itens da sidebar (boundingBox), `font-family` computado numa tabela real = Plus Jakarta Sans
    - _Requirements: 1.1, 2.1, 2.3_
