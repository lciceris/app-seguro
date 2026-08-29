# Tasks — insurer-catalog-and-ordering

- [x] 1. `insurer-catalog-screen.tsx` no padrão visual atual
  - [x] 1.1 Painel branco + busca + contador + `Table` compartilhada, lógica de habilitar/desabilitar idêntica
    - _Requirements: 1.1, 1.2_

- [x] 2. Reordenação por setas
  - [x] 2.1 `reorder-insurer.ts` (API) + `use-reorder-insurer.ts` (hook)
    - _Requirements: 2.2_
  - [x] 2.2 `insurers-list-screen.tsx`: botões mover pra cima/baixo, desabilitados nas pontas e com busca ativa; `aria-label` nos botões (achado: eram só ícone+tooltip, sem nome acessível)
    - _Requirements: 2.1, 2.3, 2.4, 2.5_

- [x] 3. Verificação
  - [x] 3.1 `tsc`/`eslint`/`vitest run` completos (135/135, incluindo novo teste de `use-reorder-insurer`); `insurer-catalog-screen.test.tsx` não precisou de ajuste (`getByRole("switch")`/`getByRole("row")` sobreviveram à troca pra `Table` compartilhada)
    - _Requirements: —_
  - [x] 3.2 `e2e/insurers-catalog-toggle.spec.ts` e `e2e/insurers-create.spec.ts` passando sem alteração
    - _Requirements: —_
  - [x] 3.3 Verificação visual via Playwright — "Minhas seguradoras" no padrão novo (3 switches reais, `isChecked()`/clique confirmados); em `insurers-list-screen`: busca ativa desabilita as duas setas, primeira linha sem mover-pra-cima, mover BBB pra cima trocou corretamente com AAA (`[BBB, AAA, CCC]`) e persistiu no banco
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_
