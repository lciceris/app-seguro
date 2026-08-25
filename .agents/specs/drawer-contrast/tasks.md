# Tasks — drawer-contrast

- [x] 1. `sheet.tsx` — overlay mais escuro e vão do topo menor
  - [x] 1.1 `bg-black/10` → `bg-black/35` no `SheetOverlay`; `top-16`/`sm:top-28` → `top-9` único no `SheetContent`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Corpo do drawer sem `bg-muted` (25 arquivos, sweep mecânico)
  - [x] 2.1 `clients`: `create-client-drawer.tsx`, `edit-client-drawer.tsx`, `client-detail-drawer.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 `vehicles`: `create-vehicle-drawer.tsx`, `edit-vehicle-drawer.tsx`, `vehicle-detail-drawer.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.3 `quotations`: `create-quotation-drawer.tsx`, `edit-quotation-drawer.tsx`, `quotation-vehicle-coverage-drawer.tsx`, `quotation-insurer-drawer.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.4 `insurers`: `create-insurer-drawer.tsx`, `edit-insurer-drawer.tsx`, `insurer-detail-drawer.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.5 `policies`: `edit-policy-drawer.tsx`, `policy-detail-drawer.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.6 `policy-endorsements`: `create-policy-endorsement-drawer.tsx`, `policy-endorsement-detail-drawer.tsx`, `insurer-response-form.tsx`, `not-closed-reason-form.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.7 `users`: `invite-user-drawer.tsx`, `edit-user-drawer.tsx`, `user-detail-drawer.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.8 `brokerages`: `create-brokerage-drawer.tsx`, `edit-brokerage-drawer.tsx`, `brokerage-detail-drawer.tsx`
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Cards de seção com `shadow-sm` (28 arquivos = os 25 acima + 3 sub-componentes)
  - [x] 3.1 Adicionar `shadow-sm` em todo card de seção dos 25 arquivos da Task 2
    - _Requirements: 3.1_
  - [x] 3.2 Adicionar `shadow-sm` nos 3 sub-componentes de `policy-detail-drawer`: `policy-attachments-section.tsx`, `policy-endorsements-section.tsx`, `policy-vehicles-section.tsx`
    - _Requirements: 3.1_
  - [x] 3.3 Confirmar via grep que os 15 arquivos fora de escopo (páginas, não drawer) não foram tocados
    - _Requirements: 3.2_

- [ ] 4. Documentação e verificação final
  - [ ] 4.1 Atualizar `docs/dev/ui-guidelines.md` (card de seção com `shadow-sm`, corpo do drawer sem fundo cinza)
    - _Requirements: 3.3_
  - [ ] 4.2 Rodar `tsc`/`eslint`/`vitest` completos; screenshot real (Playwright efêmero) de 1 cadastro, 1 edição, 1 detalhe confirmando overlay, vão, corpo branco e sombra dos cards
    - _Requirements: infra_
