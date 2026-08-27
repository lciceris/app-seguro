# Tasks — own-brokerage-hero

- [x] 1. `own-brokerage-screen.tsx`
  - [x] 1.1 Remove o card "Identidade visual"; adiciona `watch` ao `useForm`
    - _Requirements: 3.1_
  - [x] 1.2 Novo card-hero no topo: avatar clicável (upload/remover reaproveitados), nome/CNPJ ao vivo, `ColorPicker` reposicionado
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2_

- [x] 2. Verificação
  - [x] 2.1 `tsc --noEmit`, `eslint`, `vitest run` completos — 1 warning (não erro) do React Compiler sobre `watch()` não poder ser memoizado, mesmo padrão já aceito em `create-policy-endorsement-drawer.tsx`
    - _Requirements: —_
  - [x] 2.2 Verificação visual via Playwright — confirmado: card "Identidade visual" não existe mais; avatar mostra inicial sem logo; nome/CNPJ atualizam ao vivo (`Corretora Verify Hero` → `Horizonte Corretora de Seguros Ltda.` / CNPJ formatado) enquanto digita no card Empresa; upload mostra preview + botão de remover sobreposto; salvar com CNPJ/e-mail/cor nova funciona (toast de sucesso)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2_
