# Implementation Plan

- [x] 1. Primitivo `SheetContent`
  - [x] 1.1 Implementar em `src/shared/components/ui/sheet.tsx`: default de `side` pra `"bottom"`, prop `size` (`md`/`lg`), container centralizado + botão de fechar só quando `side === "bottom"`, `top-4`/`sm:top-10` + `rounded-t-2xl` + `slide-in/out-from-bottom-full`
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2_
  - [x] 1.2 Verificar visualmente em navegador real com um drawer qualquer (antes de migrar os outros 22) — abre de baixo, largura cheia, container centralizado, fechar funciona (overlay/Escape/X)
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2_

- [x] 2. Migração dos 23 drawers existentes
  - [x] 2.1 Migrar os 17 drawers de `size="md"` (720px, sem `className`): `clients/create-client-drawer`, `clients/edit-client-drawer`, `brokerages/edit-brokerage-drawer`, `brokerages/create-brokerage-drawer`, `policy-endorsements/create-policy-endorsement-drawer`, `policy-endorsements/policy-endorsement-detail-drawer`, `policies/edit-policy-drawer`, `users/edit-user-drawer`, `users/invite-user-drawer`, `insurers/create-insurer-drawer`, `insurers/edit-insurer-drawer`, `vehicles/create-vehicle-drawer`, `vehicles/edit-vehicle-drawer`, `quotations/create-quotation-drawer`, `quotations/edit-quotation-drawer`, `quotations/quotation-vehicles-tab/quotation-vehicle-coverage-drawer`, `quotations/quotation-insurers-tab/quotation-insurer-drawer`
    - _Requirements: 4.1, 4.2_
  - [x] 2.2 Migrar os 6 drawers de `size="lg"` (1000px): `clients/client-detail-drawer`, `brokerages/brokerage-detail-drawer`, `policies/policy-detail-drawer`, `users/user-detail-drawer`, `insurers/insurer-detail-drawer`, `vehicles/vehicle-detail-drawer`
    - _Requirements: 4.1, 4.2_

- [x] 3. Verificação final
  - [x] 3.1 Rodar `tsc --noEmit` + `eslint` + `vitest run` + suíte E2E completa — confirmar zero regressão (nenhum teste depende de largura/lado da folha)
    - _Requirements: 4.1, 4.2_
  - [x] 3.2 Verificação visual em navegador real de uma amostra (um `create`, um `edit`, um `detail`) confirmando o padrão novo consistente entre eles
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 4.3_
