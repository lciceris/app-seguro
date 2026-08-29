# Tasks — user-forms-layout-and-status-badge

- [x] 1. Layout e asteriscos
  - [x] 1.1 `invite-user-drawer.tsx`: remove `col-span-2` do Perfil; labels `Nome *`/`E-mail *`/`Perfil *`
    - _Requirements: 1.1, 2.1_
  - [x] 1.2 `edit-user-drawer.tsx`: Nome em `col-span-2`, Telefone/Perfil dividem a linha seguinte; labels `Nome *`/`Perfil *`
    - _Requirements: 1.2, 2.2_

- [x] 2. Status como badge
  - [x] 2.1 `user-detail-drawer.tsx`: troca o `<span>` colorido por `Badge` (`w-fit`, já que o pai é `flex-col` e esticaria o badge sem isso), mesma classe de `users-list-screen.tsx`
    - _Requirements: 3.1_

- [x] 3. Verificação
  - [x] 3.1 Ajustado `getByLabelText`/`getByRole("combobox", { name: ... })` em `edit-user-drawer.test.tsx`/`invite-user-drawer.test.tsx`; `tsc`/`eslint`/`vitest run` completos (137/137)
    - _Requirements: —_
  - [x] 3.2 Verificação visual via Playwright — Perfil ao lado de Telefone nos dois formulários, asteriscos nos labels certos, badge "Inativo" no detalhe idêntico ao da listagem
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1_
