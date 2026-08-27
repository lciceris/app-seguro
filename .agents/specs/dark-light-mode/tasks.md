# Tasks — dark-light-mode

- [x] 1. Mecanismo e persistência
  - [x] 1.1 Script inline em `index.html` (anti-flash) + `src/shared/store/theme-store.ts` (zustand, mesmo padrão de `auth-store.ts`)
    - _Requirements: 1.3, 1.4, 1.5_
  - [x] 1.2 `app-header.tsx`: liga `onClick` no botão de tema já existente, troca ícone `Moon`/`Sun` conforme o estado
    - _Requirements: 1.1, 1.2_

- [x] 2. Tokens escuros de superfície em `globals.css`
  - [x] 2.1 Bloco `.dark { ... }` com os pares de `--background`/`--card`/`--popover`/`--secondary`/`--muted`/`--accent`/`--destructive`/`--border`/`--input`; `--primary`/`--ring` inalterados
    - _Requirements: 2.1, 2.3_
  - [x] 2.2 Pares escuros de `--sidebar-*` (reaproveitando `#FFFFFF ↔ #020617` já desenhado)
    - _Requirements: 2.2_

- [x] 3. Badges e status no escuro
  - [x] 3.1 Pares escuros de `--success-bg`/`-text`, `--neutral-bg`/`-text`, `--warning-bg`/`-text` e todos os `--status-*` (fundo saturado escuro / texto pastel claro)
    - _Requirements: 3.1_
    - _Nota: tasks 2 e 3 viraram um commit só — é o mesmo bloco `.dark { ... }` contíguo em `globals.css`, sem benefício real em separar por hunk._

- [x] 4. Cor hardcoded que quebraria no escuro
  - [x] 4.1 Novo token `--table-header` (`table.tsx` para de usar `bg-[#E9EDF2]`)
    - _Requirements: 4.1_
  - [x] 4.2 5 pontos com `amber-*` cru (estrela de vendedor principal ×2, banner de endosso pendente, badge de status de seguradora ×2) migram pro token `--warning`/`--warning-bg`/`--warning-text`
    - _Requirements: 4.1_

- [x] 5. Verificação
  - [x] 5.1 `tsc --noEmit`, `eslint`, `vitest run` completos a cada task — todos limpos (134/134 testes)
    - _Requirements: —_
  - [x] 5.2 Verificação visual via Playwright — confirmado: botão alterna `dark` no `<html>` e grava/lê `localStorage`; reload com tema escuro salvo já nasce com a classe (sem flash); sidebar/header/tabela com o par branco↔slate-950; badge "Ativo" com fundo verde escuro/texto verde claro (par `success-bg`/`success-text`); drawer com overlay escurecendo corretamente o fundo já escuro, cards com hierarquia visual mantida
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 4.1_
