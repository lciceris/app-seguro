# Tasks — drawer-layout-refinements

- [x] 1. `sheet.tsx` — contexto de `size`, wrapper central sem `max-w`, header/footer com coluna interna
  - [x] 1.1 `SheetCenteredBodyContext` passa a carregar `size` (não mais booleano); `SheetContent` remove `mx-auto`/`max-w` do wrapper central
    - _Requirements: 2.1_
  - [x] 1.2 `SheetHeader`: wrapper interno `mx-auto max-w-[size]` + `border-b border-border bg-card` na barra full-bleed
    - _Requirements: 4.1_
  - [x] 1.3 `SheetFooter`: wrapper interno `mx-auto max-w-[size]` (recebe o `className` de alinhamento por call-site) + `border-t border-border bg-card` embutido na barra full-bleed (não mais repetido por arquivo)
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 2. Corpo dos 25 drawers — `bg-background`, sem `max-w` implícito, wrapper interno na largura certa
  - [ ] 2.1 `clients`, `vehicles`, `quotations`, `insurers` (create/edit, 720px): `create-client-drawer.tsx`, `edit-client-drawer.tsx`, `create-vehicle-drawer.tsx`, `edit-vehicle-drawer.tsx`, `create-quotation-drawer.tsx`, `edit-quotation-drawer.tsx`, `create-insurer-drawer.tsx`, `edit-insurer-drawer.tsx`
    - _Requirements: 1.1, 1.2, 2.2, 2.3_
  - [ ] 2.2 `policies`, `brokerages`, `users` (create/edit, 720px): `edit-policy-drawer.tsx`, `create-brokerage-drawer.tsx`, `edit-brokerage-drawer.tsx`, `invite-user-drawer.tsx`, `edit-user-drawer.tsx`
    - _Requirements: 1.1, 1.2, 2.2, 2.3_
  - [ ] 2.3 `policy-endorsements` + drawers aninhados de `quotations` (720px): `create-policy-endorsement-drawer.tsx`, `policy-endorsement-detail-drawer.tsx`, `insurer-response-form.tsx`, `not-closed-reason-form.tsx`, `quotation-insurer-drawer.tsx`, `quotation-vehicle-coverage-drawer.tsx`
    - _Requirements: 1.1, 1.2, 2.2, 2.3_
  - [ ] 2.4 Drawers de detalhe (1000px): `client-detail-drawer.tsx`, `brokerage-detail-drawer.tsx`, `policy-detail-drawer.tsx`, `user-detail-drawer.tsx`, `insurer-detail-drawer.tsx`, `vehicle-detail-drawer.tsx`
    - _Requirements: 1.1, 1.2, 2.2, 2.3_

- [x] 3. Remover `border-t border-border bg-card` duplicado do `className` de `SheetFooter` nos 25 call-sites (agora embutido no componente)
  - _Requirements: 3.2_

- [ ] 4. Verificação final
  - [ ] 4.1 Rodar `tsc`/`eslint`/`vitest` completos
    - _Requirements: 5.1_
  - [ ] 4.2 Screenshot real (Playwright efêmero) de 1 cadastro (md) e 1 detalhe (lg) confirmando corpo cinza, scroll na borda, título e botões alinhados à coluna
    - _Requirements: 5.2_
