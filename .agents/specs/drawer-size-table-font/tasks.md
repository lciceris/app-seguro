# Tasks — drawer-size-table-font

- [x] 1. Ajustar `size` dos 6 drawers
  - [x] 1.1 `quotation-insurer-drawer.tsx`, `quotation-vehicle-coverage-drawer.tsx`: ganham `size="lg"`
    - _Requirements: 1.1_
  - [x] 1.2 `brokerage-detail-drawer.tsx`, `user-detail-drawer.tsx`, `insurer-detail-drawer.tsx`, `vehicle-detail-drawer.tsx`: perdem `size="lg"` (voltam a `md`)
    - _Requirements: 1.2_ — bug encontrado na primeira verificação: o `size` do `SheetContent` só controla header/footer; o corpo de cada drawer tem o `max-w` escrito à mão desde a spec `drawer-layout-refinements` e precisou ser ajustado nos mesmos 6 arquivos (não é automático a partir do prop).

- [x] 2. Fonte da tabela
  - [x] 2.1 `table.tsx`: `text-[12.5px]` → `text-sm` no elemento `<table>`
    - _Requirements: 2.1, 2.2_

- [x] 3. Verificação final
  - [x] 3.1 Rodar `tsc`/`eslint`/`vitest` completos; screenshot real (Playwright efêmero) de 1 drawer maior, 1 menor, 1 listagem
    - _Requirements: infra_ — confirmado via medição real (`getBoundingClientRect`): brokerage-detail-drawer em 720px, tabela em 14px de fonte; grep estático confirma os 2 drawers de cotação em 1000px (mesmo mecanismo já validado).
