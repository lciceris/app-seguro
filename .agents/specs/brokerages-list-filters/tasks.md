# Tasks — brokerages-list-filters

- [x] 1. Implementar filtros de status e plano em `brokerages-list-screen.tsx`
  - [x] 1.1 Sentinelas (`ALL_STATUS_VALUE`, `ALL_PLAN_VALUE`, `NO_PLAN_VALUE`), `usePlans()`, estado `statusFilter`/`planFilter`, `useMemo` estendido, `hasActiveFilter`
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1_
  - [x] 1.2 Dois `Select` na toolbar + mensagem de `TableEmptyState` condicionada a `hasActiveFilter`
    - _Requirements: 1.1, 2.1, 3.2_

- [x] 2. Verificação
  - [x] 2.1 `tsc --noEmit`, `eslint` no arquivo, `vitest run` completo — todos limpos
    - _Requirements: —_
  - [x] 2.2 Verificação visual via Playwright: aplicar status/plano isolado e combinado, confirmar contagens e mensagem de vazio
    - _Requirements: 1.2, 2.2, 2.3, 3.1, 3.2_ — script efêmero criou usuário `platform_admin`, um plano temporário e 2 corretoras de teste (ativa c/ plano, inativa sem plano) via service role, logou pelo navegador real e confirmou: baseline mostra as duas; `Ativo` esconde a inativa; `Sem plano` esconde a com-plano; plano específico esconde a sem-plano; busca sem match mostra "Nenhuma corretora encontrada pra esse filtro."; contador "11 de 14 corretoras" atualiza junto. Script e screenshots removidos ao final.
