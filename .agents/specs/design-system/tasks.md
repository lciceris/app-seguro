# Tasks — design-system

- [x] 1. Tokens de cor e tipografia
  - [x] 1.1 Adicionar tokens `--success`/`--success-bg`/`--success-text`, `--neutral-bg`/`--neutral-text`, `--warning`/`--warning-bg`/`--warning-text` em `src/styles/globals.css` (`:root` + `@theme inline`)
    - _Requirements: 5.1_
  - [x] 1.2 Instalar `@fontsource/ibm-plex-mono` (a versão variable não existe pra essa fonte), importar em `globals.css`, adicionar `--font-mono-data` e a utility `font-mono-data` (via `@utility`, Tailwind v4) pra dado técnico de tabela (CNPJ, telefone, CEP, data, ID)
    - _Requirements: 5.1_

- [x] 2. Grid de 2 colunas nos formulários (sweep mecânico, sem mudança de campo/validação)
  - [x] 2.1 `clients`: `create-client-drawer.tsx`, `edit-client-drawer.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.2 `vehicles`: `create-vehicle-drawer.tsx`, `edit-vehicle-drawer.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.3 `quotations`: `create-quotation-drawer.tsx`, `edit-quotation-drawer.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.4 `insurers`: `create-insurer-drawer.tsx`, `edit-insurer-drawer.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.5 `policies`: `edit-policy-drawer.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.6 `policy-endorsements`: `create-policy-endorsement-drawer.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.7 `users`: `invite-user-drawer.tsx`, `edit-user-drawer.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. `DetailField` compartilhado
  - [x] 3.1 Criar `src/shared/components/ui/detail-field.tsx` + teste (renderiza "Não informado" pra valor nulo/vazio)
    - _Requirements: 2.1, 2.2_
  - [x] 3.2 Migrar `client-detail-drawer.tsx`
    - _Requirements: 2.3_
  - [x] 3.3 Migrar `vehicle-detail-drawer.tsx`
    - _Requirements: 2.3_
  - [x] 3.4 Migrar `insurer-detail-drawer.tsx`
    - _Requirements: 2.3_
  - [x] 3.5 Migrar `policy-detail-drawer.tsx`
    - _Requirements: 2.3_
  - [x] 3.6 Migrar `brokerage-detail-drawer.tsx`
    - _Requirements: 2.3_
  - [x] 3.7 Migrar `policy-endorsement-detail-drawer.tsx` — corrige o drift (`if (!value) return null` some pra "Não informado"); nenhum teste existente cobria o caso de valor vazio, então nada precisou de ajuste
    - _Requirements: 2.2, 2.3_

- [x] 4. Tabela compartilhada, densidade nova
  - [x] 4.1 Criar primitivo(s) em `src/shared/components/ui/` (wrapper, header, linha, empty state, skeleton) com a densidade de `design.md` (`px-3 py-1.5`, `text-[12.5px]`, mono+tabular-nums em coluna técnica)
    - _Requirements: 3.1, 5.1, 5.2_
  - [x] 4.2 Migrar `clients-list-screen.tsx`
    - _Requirements: 3.2_
  - [x] 4.3 Migrar `vehicles-list-screen.tsx`
    - _Requirements: 3.2_
  - [x] 4.4 Migrar `quotations-list-screen.tsx`
    - _Requirements: 3.2_
  - [x] 4.5 Migrar `insurers-list-screen.tsx`
    - _Requirements: 3.2_
  - [x] 4.6 Migrar `policies-list-screen.tsx`
    - _Requirements: 3.2_
  - [x] 4.7 Migrar `users-list-screen.tsx`
    - _Requirements: 3.2_
  - [x] 4.8 Migrar `brokerages-list-screen.tsx`
    - _Requirements: 3.2_

- [x] 5. Badge de status ativo/inativo com tokens novos (troca `bg-emerald-100 text-emerald-700`/`bg-slate-100 text-slate-500` hardcoded pelos tokens do Task 1.1)
  - [x] 5.1 `brokerages-list-screen.tsx` + `brokerage-detail-drawer.tsx`
    - _Requirements: 5.1, 5.2_
  - [x] 5.2 `users-list-screen.tsx` + `user-detail-drawer.tsx`
    - _Requirements: 5.1, 5.2_
  - [x] 5.3 `vehicles-list-screen.tsx` + `vehicle-detail-drawer.tsx`
    - _Requirements: 5.1, 5.2_

- [ ] 6. Botão destrutivo nas confirmações de desativação (`variant="destructive"`, token já existente)
  - [ ] 6.1 `deactivate-client-confirm-dialog.tsx`
    - _Requirements: 4.1, 4.2_
  - [ ] 6.2 `deactivate-confirm-dialog.tsx` (users)
    - _Requirements: 4.1, 4.2_
  - [ ] 6.3 `deactivate-vehicle-confirm-dialog.tsx`
    - _Requirements: 4.1, 4.2_
  - [ ] 6.4 `deactivate-brokerage-confirm-dialog.tsx`
    - _Requirements: 4.1, 4.2_

- [ ] 7. Documentação viva
  - [ ] 7.1 Preencher `docs/dev/ui-guidelines.md` com os tokens, grid de formulário, `DetailField`, tabela compartilhada, hierarquia de botão — com snippet de código curto por convenção
    - _Requirements: 6.1, 6.2_

- [ ] 8. Verificação final
  - [ ] 8.1 Screenshot real (Playwright, script efêmero) de 1 listagem, 1 cadastro e 1 detalhe migrados, comparando com os protótipos aprovados; rodar `tsc`/`eslint`/`vitest` completos
    - _Requirements: infra_
