# Tasks — header-profile-redesign

- [x] 1. `app-header.tsx`
  - [x] 1.1 Remove qualquer título; adiciona ícones de tema (lua) e notificações (sino), decorativos
    - _Requirements: 1.1, 2.1, 2.2, 2.3_

- [x] 2. `user-menu.tsx`
  - [x] 2.1 Gatilho com nome + cargo empilhados + chevron
    - _Requirements: 3.1_
  - [x] 2.2 Dropdown com cartão de perfil (avatar maior, nome, e-mail, cargo em badge) e ícones nos itens
    - _Requirements: 3.2, 3.3, 3.4_

- [x] 3. Verificação
  - [x] 3.1 `tsc --noEmit`, `eslint`, `vitest run` completos — 1 teste existente (`user-menu.test.tsx`) quebrou porque "Supervisor" passou a aparecer 2x (gatilho + dropdown); corrigido escopando a asserção com `within(screen.getByRole("menu"))` em vez de `screen.getByText` global. 134/134 passando depois.
    - _Requirements: —_
  - [x] 3.2 Verificação visual via Playwright — dropdown aberto de verdade (avatar maior, badge de cargo, ícones nos itens), ícones de tema/notificação clicados sem crash (confirma ausência de handler)
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3_
