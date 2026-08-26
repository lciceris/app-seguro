# Requirements — drawer-layout-refinements

## Introdução

Depois de `drawer-contrast` (overlay, vão do topo, corpo branco, sombra nos cards), o usuário usou o resultado ao vivo e pediu 4 ajustes finos de layout, mais uma decisão de opinião:

1. O corpo branco ficou "muito branco" — quer um cinza claro de volta, mas não o `--muted` (#F8FAFC) que causou o problema original (quase idêntico ao branco).
2. O scroll do corpo hoje nasce dentro do container de 720px/1000px (a barra de rolagem fica na borda do conteúdo, não na borda da tela) — quer o scroll ocupando 100% da largura do drawer.
3. Os botões do rodapé hoje ficam ancorados no canto direito da folha inteira (`w-screen` via o truque de "furar" o container centralizado) — quer eles alinhados com a mesma coluna do corpo, pra ficar fisicamente mais perto dos campos/cards que acabaram de ser preenchidos.
4. O título do header ("Nova corretora" etc.) está com padding fixo (`p-4`), não alinhado à coluna do corpo — quer alinhado.
5. Opinião sobre o X: manter no canto absoluto ou alinhar à coluna também. **Decisão**: manter no canto absoluto — é uma convenção universal (botão de fechar sempre no canto da superfície) e alinhá-lo à coluna faria ele mudar de posição entre um drawer de 720px e um de 1000px, quebrando a previsibilidade. Não há mudança de código pra este item.

Causa raiz comum aos itens 2-4: o `SheetContent` aplica a largura máxima (720px/1000px) num wrapper que envolve header, corpo e rodapé juntos; hoje o header/rodapé "furam" esse wrapper pra ocupar a tela toda via `w-screen` (truque documentado em `sheet.tsx`), mas o **conteúdo** deles (título, botões) fica solto nessa largura total em vez de se realinhar à coluna. E o corpo, que não fura, herda o max-width do wrapper — por isso o scroll nasce ali, não na borda real da tela.

### Escopo

**Dentro:**
- `src/shared/components/ui/sheet.tsx`: `SheetContent` perde o `max-w` do wrapper centralizado (vira largura total); `SheetHeader` e `SheetFooter` ganham um wrapper interno centralizado (mesma largura md/1000px conforme o `size` do `SheetContent`, via contexto) por dentro do "furo" já existente — título e botões passam a se alinhar à coluna, mas a barra em si (fundo, borda) continua ocupando a tela toda.
- Os 25 arquivos de drawer da spec `drawer-contrast`: o elemento de corpo (`<form>`/`<div>` com `overflow-y-auto`) perde o `max-w` implícito (herdado do wrapper) e ganha `bg-background` (cinza claro já existente, não o `--muted`); os campos/cards internos são envolvidos por um novo wrapper interno `mx-auto max-w-[720px ou 1000px] p-5` (o padding sai do elemento de scroll e vai pro wrapper interno).

**Fora:**
- O X do header (decisão: manter como está).
- Qualquer mudança de campo, validação, dado ou comportamento.
- Overlay, vão do topo, cor/sombra dos cards (já fechados em `drawer-contrast`) — só a estrutura de largura/alinhamento muda aqui.

## Requirements

### Requirement 1: Corpo do drawer com cinza claro (`--background`, não `--muted`)

**User Story:** Como usuário, quero que o corpo do drawer tenha um cinza sutil (não branco puro, não o cinza quase invisível de antes), para os cards de seção se destacarem melhor com a sombra.

#### Acceptance Criteria

1. O elemento de corpo (scroll) dos 25 drawers SHALL usar `bg-background` (`#F1F5F9`, o mesmo tom já usado como fundo geral do app) em vez de ficar sem cor de fundo.
2. NÃO SHALL reintroduzir `bg-muted` (`#F8FAFC`) — é o tom que originou a reclamação de "tudo branco/cinza-quase-branco" antes da spec `drawer-contrast`.

### Requirement 2: Scroll do corpo em 100% da largura do drawer

**User Story:** Como usuário, quero que a barra de rolagem do corpo do drawer fique na borda real da tela, para o scroll parecer parte da folha inteira, não de uma caixa de conteúdo estreita.

#### Acceptance Criteria

1. O `SheetContent` (`side="bottom"`) SHALL remover o `max-w`/`mx-auto` do wrapper que hoje envolve header + corpo + rodapé — esse wrapper vira largura total.
2. Em cada um dos 25 drawers, o elemento com `overflow-y-auto` (hoje também com `p-5` e os campos direto dentro) SHALL passar a ser só `flex-1 min-h-0 overflow-y-auto bg-background`, e os campos/cards internos SHALL ser envolvidos por um novo `<div>` com `mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5` (`max-w-[1000px]` nos drawers de detalhe, que usam `size="lg"`) — o padding e o `gap-4` saem do elemento que rola e vão pra esse wrapper interno.
3. Nenhuma mudança de `id`/`onSubmit` dos `<form>` — o elemento continua sendo `<form>` onde já era, só a classe e o filho direto mudam.

### Requirement 3: Rodapé alinhado à coluna do corpo

**User Story:** Como usuário, quero que os botões de ação (Cancelar/Criar, Cancelar/Salvar, Fechar) fiquem alinhados com a mesma coluna dos campos que acabei de preencher, para não precisar mover o mouse até o canto da tela pra confirmar.

#### Acceptance Criteria

1. `SheetFooter` SHALL manter a barra full-bleed (`border-t border-border bg-card` ocupando a tela toda) mas o conteúdo (botões) SHALL ficar dentro de um wrapper interno `mx-auto w-full max-w-[md/lg]`, alinhado à mesma coluna do corpo.
2. `border-t border-border bg-card` SHALL passar a ser aplicado pelo próprio `SheetFooter` (não mais repetido via `className` em cada um dos 25 arquivos) — remove a duplicação já que é sempre o mesmo valor nos 25 usos.
3. O alinhamento interno de cada rodapé (`justify-end` na maioria, `items-center justify-between` num caso) SHALL continuar configurável via `className`, agora aplicado ao wrapper interno em vez da barra inteira.

### Requirement 4: Título do header alinhado à coluna do corpo

**User Story:** Como usuário, quero que o título do drawer comece na mesma posição horizontal dos campos abaixo, para o conjunto parecer uma coluna única, não um título solto por cima de uma coluna.

#### Acceptance Criteria

1. `SheetHeader` SHALL manter a barra full-bleed mas o conteúdo (título + qualquer descrição) SHALL ficar dentro do mesmo wrapper interno centralizado (`mx-auto w-full max-w-[md/lg]`) usado no Requirement 3.
2. Nenhum dos 25 arquivos usa `className` customizado em `SheetHeader` hoje — nenhuma mudança de call-site é necessária além do que o componente já faz internamente.

### Requirement 5: Verificação

1. `tsc`/`eslint`/`vitest` completos SHALL passar sem novos erros.
2. Screenshot real (Playwright efêmero) de 1 cadastro (md, 720px) e 1 detalhe (lg, 1000px) SHALL confirmar: corpo cinza claro, scroll na borda real, título e botões alinhados com a coluna dos cards.
