# Tasks — list-page-panel

- [x] 1. `table.tsx` — header mais escuro, hover mais suave
  - [x] 1.1 `TableHeader`: `bg-muted` → `bg-[#E9EDF2]`; `TableRow`: `hover:bg-muted/50` → `hover:bg-background/30`
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Painel branco nas 7 telas de listagem (sweep mecânico)
  - [x] 2.1 `clients-list-screen.tsx`, `vehicles-list-screen.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 `quotations-list-screen.tsx`, `policies-list-screen.tsx` (têm filtro `Select` além da busca)
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.3 `insurers-list-screen.tsx`, `users-list-screen.tsx`, `brokerages-list-screen.tsx` (tela de validação)
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Documentação e verificação final
  - [x] 3.1 Atualizar seção de listagem em `docs/dev/ui-guidelines.md` com o painel branco + tabela em container interno
    - _Requirements: 3.1_
  - [x] 3.2 Rodar `tsc`/`eslint`/`vitest` completos; screenshot real (Playwright efêmero) de Corretoras + 1-2 outras listagens
    - _Requirements: infra_

- [x] 4. Ajustes finos pedidos após o uso ao vivo
  - [x] 4.1 `TableHead`: altura fixa (`h-10`) em vez de padding — o texto sozinho (`leading` implícito) nunca bateria a altura real da linha do corpo, que é ditada pelos botões de ação (`icon-sm`, 28px + padding = 40px), não pelo texto. Confirmado via medição real (Playwright, `getBoundingClientRect`): header e linha em 40px, diferença de 0.5px por borda/subpixel.
    - _Requirements: —_
  - [x] 4.2 Altura de todos os inputs `h-8` → `h-9`: `Input` (componente compartilhado, usado em toda busca/formulário), `Select` (`data-[size=default]`, fica lado a lado com `Input` nos filtros de Cotações/Apólices) e `ColorPicker` (swatch de cor, fica lado a lado com `Input` de hex). Escopo deliberadamente restrito a controles de formulário — não inclui `Button` nem `Skeleton` de loading, que são preocupações diferentes.
    - _Requirements: —_
