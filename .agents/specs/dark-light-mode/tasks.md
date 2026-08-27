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

- [ ] 4. Cor hardcoded que quebraria no escuro
  - [ ] 4.1 Novo token `--table-header` (`table.tsx` para de usar `bg-[#E9EDF2]`)
    - _Requirements: 4.1_
  - [ ] 4.2 5 pontos com `amber-*` cru (estrela de vendedor principal ×2, banner de endosso pendente, badge de status de seguradora ×2) migram pro token `--warning`/`--warning-bg`/`--warning-text`
    - _Requirements: 4.1_

- [ ] 5. Verificação
  - [ ] 5.1 `tsc --noEmit`, `eslint`, `vitest run` completos
    - _Requirements: —_
  - [ ] 5.2 Verificação visual via Playwright — alternar tema em listagem (badges), drawer, sidebar+header e formulário; confirmar persistência entre reloads e ausência de flash com tema escuro salvo
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 3.1, 4.1_
