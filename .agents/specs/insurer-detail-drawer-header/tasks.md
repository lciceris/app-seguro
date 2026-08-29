# Tasks — insurer-detail-drawer-header

- [x] 1. `insurer-detail-drawer.tsx`
  - [x] 1.1 Avatar (logo/inicial, borda `border-primary`) no `SheetHeader`, remove `<img>` solto do corpo
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 Cards do corpo em `grid grid-cols-2 gap-x-6 gap-y-4`
    - _Requirements: 2.1_

- [x] 2. Verificação
  - [x] 2.1 `tsc`/`eslint`/`vitest run` completos (137/137)
    - _Requirements: —_
  - [x] 2.2 Verificação visual via Playwright — avatar com fallback de inicial no header (borda `border-primary`), campos em grid de 2 colunas, sem quebra
    - _Requirements: 1.1, 1.2, 2.1_
