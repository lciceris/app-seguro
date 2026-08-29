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

- [x] 4. Addendum — ordem própria por corretora
  - [x] 4.1 Migration `brokerage_insurer_order` (tabela + RLS, mesmo padrão de `brokerage_disabled_insurers`) + `supabase db push` + `gen types`
    - _Requirements: 3.1, 3.2_
  - [x] 4.2 `reorder-brokerage-insurer.ts` (API, `upsert`) + `use-reorder-brokerage-insurer.ts` (hook) + `InsurerCatalogEntry`/`list-insurer-catalog.ts` ganham o embed
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 4.3 `insurer-catalog-screen.tsx`: `sortedInsurers` por `effectiveOrder`, coluna "Ordem" só quando `canToggle`
    - _Requirements: 3.3, 3.4, 3.5_
  - [x] 4.4 Testes: `insurer-catalog-screen.test.tsx` (fixture ganha `brokerage_insurer_order: []`/`logo_url: null`, mock do novo hook, teste novo de mover + de "platform_admin não vê setas"); novo `use-reorder-brokerage-insurer.test.tsx`. `tsc`/`eslint`/`vitest run` completos (137/137); `e2e/insurers-catalog-toggle.spec.ts`/`insurers-create.spec.ts` sem alteração
    - _Requirements: —_
  - [x] 4.5 Verificação visual via Playwright — corretora A move XXX pra baixo, persiste após reload; corretora B (mesmas 2 seguradoras) continua vendo a ordem original — isolamento confirmado, nenhuma troca vaza entre corretoras
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
