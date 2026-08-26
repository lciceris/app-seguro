# Tasks — remove-double-padding

- [x] 1. Remover `<div className="p-6">` redundante nas 10 telas
  - [x] 1.1 `clients-list-screen.tsx`, `brokerages-list-screen.tsx`, `own-brokerage-screen.tsx`, `policies-list-screen.tsx`, `users-list-screen.tsx`
    - _Requirements: 1.1, 1.2_
  - [x] 1.2 `insurers-list-screen.tsx`, `insurer-catalog-screen.tsx`, `vehicles-list-screen.tsx`, `quotation-detail-screen.tsx`, `quotations-list-screen.tsx`
    - _Requirements: 1.1, 1.2_

- [x] 2. Verificação final
  - [x] 2.1 Rodar `tsc`/`eslint`/`vitest` completos; medir via Playwright o offset real do painel em relação ao `<main>` interno
    - _Requirements: 1.3_ — confirmado: offset esquerdo de 24px (só o `p-6` do main, sem duplicação); offset superior de 80px = 56px do `AppHeader` (`h-14`) + 24px do padding, batendo com a conta esperada (se houvesse duplicação seria 104px). Descoberto no processo: `SidebarInset` do shadcn também renderiza como `<main>`, gerando dois `<main>` aninhados no DOM — pré-existente, fora de escopo.
