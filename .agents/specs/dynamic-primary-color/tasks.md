# Tasks — dynamic-primary-color

- [x] 1. `app-shell.tsx` aplica `--primary` a partir de `usuario.primary_color`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. `use-update-own-brokerage.ts` sincroniza o auth store após salvar
    - _Requirements: 2.1_

- [x] 3. Verificação
  - [x] 3.1 `tsc --noEmit`, `eslint`, `vitest run` completos — todos limpos
    - _Requirements: —_
  - [x] 3.2 Verificação visual via Playwright ponta a ponta — salvar cor nova em "Dados da corretora" e confirmar, sem reload, que sidebar/header refletem via computed style e `getPropertyValue("--primary")`
    - _Requirements: 1.1, 2.1_
