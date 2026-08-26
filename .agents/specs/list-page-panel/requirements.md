# Requirements — list-page-panel

## Introdução

Sequência de exploração visual com o usuário (artifact `Listagem Corretoras`, 2 rodadas: 3 opções iniciais → 10 opções → mix aprovado) pra definir o padrão de listagem de todo o sistema, com Corretoras como tela de validação. Direção final aprovada: **"Mix 1+4"** — a página inteira (título, contador, botão de criar, busca) entra num cartão branco único; a tabela ganha seu próprio container por dentro (borda + header destacado), em vez de ficar solta direto no branco do cartão maior. Duas rodadas de ajuste fino: header do container interno escurecido (`#F8FAFC` → `#E9EDF2`) e hover da linha suavizado (`bg-muted/50` → um tom mais leve baseado em `--background`).

O primitivo `Table` (`src/shared/components/ui/table.tsx`) já envolve a própria tabela num container com borda (`rounded-xl border border-border bg-card`) — isso já é o "container interno" da tabela; não precisa de novo componente. O que falta é só: (1) escurecer o header da tabela e suavizar o hover (2 classes no primitivo, afeta as 7 listagens de uma vez), (2) envolver o conteúdo de cada tela (título+contador+busca+tabela) num cartão branco externo — isso sim é por tela, já que cada uma monta seu próprio JSX de cabeçalho/busca.

### Escopo

**Dentro:**
- `src/shared/components/ui/table.tsx`: `TableHeader` com fundo mais escuro; `TableRow` com hover mais suave.
- As 7 telas de listagem (`clients`, `vehicles`, `quotations`, `insurers`, `policies`, `users`, `brokerages`): envolver título/contador/botão + busca (+ filtro, onde existir) + `Table` num cartão branco externo (`rounded-2xl border border-border bg-card shadow-sm p-5`).
- `docs/dev/ui-guidelines.md`: documentar o padrão definitivo de listagem.

**Fora:**
- Qualquer mudança de coluna, dado, comportamento de busca/filtro ou contador — já fechados em `list-screens-density`.
- `Outlet` (drawers de rota aninhada) e diálogos de confirmação continuam fora do cartão — são overlays, não fazem parte do conteúdo de página.

## Requirements

### Requirement 1: Header e hover da tabela

**User Story:** Como usuário, quero que o cabeçalho da tabela se destaque mais dentro do painel branco, e que o hover da linha seja sutil, para a hierarquia visual ficar clara sem ficar pesada.

#### Acceptance Criteria

1. `TableHeader` SHALL usar fundo `#E9EDF2` (mais escuro que o `bg-muted` atual, `#F8FAFC`) em vez de `bg-muted`.
2. `TableRow` SHALL usar hover `bg-background/30` (mais suave que o `bg-muted/50` atual) em vez de `bg-muted/50`.
3. Como `TableHeader`/`TableRow` são o primitivo compartilhado, a mudança SHALL refletir nas 7 listagens automaticamente, sem edição por tela.

### Requirement 2: Painel branco envolvendo a página

**User Story:** Como usuário, quero que cada listagem pareça um painel único e coeso (título, busca e tabela juntos), em vez de elementos soltos direto no fundo cinza da página.

#### Acceptance Criteria

1. Cada uma das 7 telas de listagem SHALL envolver o bloco de título+contador+botão, o bloco de busca/filtro e o `Table` num único `<div className="rounded-2xl border border-border bg-card shadow-sm p-5">`.
2. `Outlet` (rota aninhada de drawer) e diálogos de confirmação de desativação SHALL permanecer fora desse painel, como hoje — são overlays.
3. Nenhuma mudança de espaçamento interno (`mb-4` entre título e busca, entre busca e tabela) além do necessário pra caber dentro do novo padding do painel.

### Requirement 3: Documentação

1. `docs/dev/ui-guidelines.md` SHALL ganhar/atualizar a seção de listagem com o padrão do painel branco + tabela em container interno, com snippet de código.
