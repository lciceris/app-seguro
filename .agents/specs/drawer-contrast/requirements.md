# Requirements — drawer-contrast

## Introdução

Depois de fechar `list-screens-density`, o usuário apontou que o conteúdo *dentro* dos drawers (cadastro, edição, visualização) está "estranho" — cores de fundo e disposição dos elementos. Comparado a um print do sistema antigo (`fleet-auth-gate`), o problema é concreto: hoje o drawer empilha três superfícies quase idênticas (`--popover` branco do drawer, `--muted` `#F8FAFC` do corpo, `--card` branco de cada seção) com um overlay muito sutil (`bg-black/10`) e um vão grande até o topo da tela (`top-28`, 112px) — o conjunto não lê como uma folha que tomou conta da tela, lê como uma caixa flutuando sobre um fundo cinza sem hierarquia.

A direção foi validada com o usuário via 2 rodadas de protótipo interativo (artifact `Drawer — Contraste`):
- **Overlay/vão** (rodada 1): escureceu o overlay (`black/10` → `black/35`) e reduziu bastante o vão do topo (`top-28` → ~36px), deixando o drawer ocupar quase a tela inteira — opção **B**, aprovada.
- **Corpo** (rodada 2, a partir da B): testou um "cartão único com título+régua" (D, inspirado no print do sistema antigo) contra "manter os cards de hoje, só tirar o fundo cinza" (E) — **E foi a escolhida**: mantém a estrutura de cards por seção já estabelecida (menos risco, sem mexer em 148 ocorrências de markup), só remove o `bg-muted` do corpo e reforça a definição visual de cada card com uma sombra sutil (já que a diferença de cor entre corpo e card deixa de existir).

Levantamento real do código (não suposição):
- **25 arquivos** têm o wrapper de corpo com o padrão exato `overflow-y-auto bg-muted` (a linha que abre cada drawer/detail: `className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5"`).
- Todos os 25 já contêm pelo menos um card de seção próprio (`rounded-xl border border-border bg-card p-5`) — nenhum delega 100% pra sub-componentes.
- **3 arquivos adicionais** são sub-componentes renderizados dentro de um drawer já listado (`policy-detail-drawer.tsx`) mas sem ter o wrapper na própria linha: `policy-attachments-section.tsx`, `policy-endorsements-section.tsx`, `policy-vehicles-section.tsx` — também precisam do ajuste de sombra no card, já que aparecem dentro do mesmo corpo branco.
- **Fora do escopo** (mesmo usando o padrão de card, não é conteúdo de drawer — já eram exceções conhecidas de specs anteriores): `own-brokerage-screen.tsx` (tela embutida, não drawer), `quotation-detail-screen.tsx` e suas abas (`quotation-insurers-tab`, `quotation-qar-tab`, `quotation-vehicles-tab` e sub-componentes — página cheia com abas, decisão da spec `quotations`), telas de auth (`login-screen`, `set-password-screen`, `account-deactivated-screen`), `insurer-catalog-screen.tsx`.
- **2 drawers aninhados** abertos de dentro da tela de cotação (não um drawer de cadastro/edição/detalhe principal, mas mesma primitiva `Sheet`) também têm o wrapper e entram no escopo: `quotation-vehicle-coverage-drawer.tsx`, `quotation-insurer-drawer.tsx`.

### Escopo

**Dentro:**
- `src/shared/components/ui/sheet.tsx`: overlay mais escuro e vão do topo menor (valores da opção B aprovada).
- Remover `bg-muted` do wrapper de corpo nos 25 arquivos identificados.
- Adicionar sombra sutil (`shadow-sm`) aos cards de seção dentro desses 25 arquivos + os 3 sub-componentes de `policy-detail-drawer`.

**Fora:**
- Qualquer mudança de campo, validação, dado ou comportamento — é só ajuste visual de fundo/sombra/overlay.
- As 15 telas identificadas como página (não drawer) listadas acima — mantêm o padrão atual do card, sem sombra nova, pra não misturar com uma decisão de página que não foi pedida.
- Mudar o padrão de "cards por seção" para "cartão único com título+régua" (opção D) — explicitamente rejeitada pelo usuário nesta rodada.

## Requirements

### Requirement 1: Overlay e vão do topo do drawer

**User Story:** Como usuário, quero que o drawer pareça uma folha que realmente tomou conta da tela (não uma caixa flutuando), para ter clareza de que estou num modo de edição/cadastro separado da listagem.

#### Acceptance Criteria

1. O overlay do `Sheet` (`SheetOverlay`) SHALL escurecer de `bg-black/10` para `bg-black/35`.
2. O vão entre o topo da tela e o início do drawer (`data-[side=bottom]:top-*`) SHALL reduzir de `top-16`/`sm:top-28` (64px/112px) para um valor único de `top-9` (36px), removendo a distinção mobile/desktop (não há necessidade identificada de diferenciar).
3. Nenhuma mudança na animação de entrada/saída (`slide-in-from-bottom-full`), largura centralizada (720px/1000px) ou nos demais `side` (`top`/`left`/`right`) do componente — só o `side="bottom"`, que é o único usado pelos drawers do sistema.

### Requirement 2: Corpo do drawer sem fundo cinza

**User Story:** Como usuário, quero que o corpo do drawer seja branco (como o restante da folha), para não ter uma faixa cinza que não corresponde a nada na hierarquia visual — só os cards de seção devem se destacar, via borda e sombra, não via cor de fundo diferente.

#### Acceptance Criteria

1. Os 25 arquivos com o wrapper `overflow-y-auto bg-muted` SHALL remover a classe `bg-muted`, deixando o corpo herdar o branco do `SheetContent` (`bg-popover`).
2. Nenhuma outra classe do wrapper (`flex flex-1 flex-col gap-4 overflow-y-auto p-5`) SHALL mudar.
3. Usos de `bg-muted` que não são o wrapper de corpo (ex: área de upload de logo, preview de arquivo) SHALL permanecer intactos — não fazem parte deste ajuste.

### Requirement 3: Cards de seção com sombra sutil

**User Story:** Como usuário, quero que cada seção do formulário/detalhe continue visualmente distinta mesmo com o corpo branco, para não perder a separação entre "Empresa", "Endereço" etc.

#### Acceptance Criteria

1. Todo card de seção (`rounded-xl border border-border bg-card p-5`) dentro dos 25 arquivos do Requirement 2, mais os 3 sub-componentes de `policy-detail-drawer` (`policy-attachments-section.tsx`, `policy-endorsements-section.tsx`, `policy-vehicles-section.tsx`), SHALL ganhar `shadow-sm`.
2. Cards de seção fora do escopo de drawer (páginas: `own-brokerage-screen`, `quotation-detail-screen` e abas, telas de auth, `insurer-catalog-screen`) NÃO SHALL mudar.
3. `docs/dev/ui-guidelines.md` SHALL refletir o novo padrão de card (`shadow-sm` adicionado) e a remoção do fundo cinza do corpo do drawer.
