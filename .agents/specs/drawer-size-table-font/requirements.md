# Requirements — drawer-size-table-font

## Introdução

Dois ajustes decididos em conversa com o usuário, depois do redesenho do `brokerage-detail-drawer`:

1. **Tamanho do drawer por densidade de conteúdo, não por ser form/view**: o critério antigo ("cadastro/edição = 720px, visualização = 1000px") não reflete mais a realidade depois que `brokerage-detail-drawer` ficou enxuto. Levantamento real de conteúdo (cards, campos, listas embutidas) dos 25 drawers do sistema mostrou que só 4 têm densidade que justifica 1000px — os outros 21, incluindo 4 telas de detalhe que hoje são `lg`, cabem bem em 720px.
2. **Fonte da tabela pequena demais**: corpo da tabela das 7 listagens em `text-[12.5px]` — usuário apontou que é pequeno demais pra leitura confortável, quer mínimo 14px. Escopo combinado: só o corpo da tabela por agora (não uma auditoria geral de todo texto pequeno do sistema).

### Escopo

**Dentro:**
- `size="lg"` mantido em: `client-detail-drawer.tsx` (lista de vendedores vinculados, editável), `policy-detail-drawer.tsx` (3 listas embutidas: veículos, endossos, anexos).
- `size="lg"` novo em: `quotation-insurer-drawer.tsx` (form de negociação + timeline de eventos com comentário), `quotation-vehicle-coverage-drawer.tsx` (19 campos técnicos em coluna única, sem grid de 2 colunas — decisão explícita do usuário: **não** aplicar o grid agora, só ajustar o tamanho).
- `size="lg"` removido (volta a `md`, o padrão) em: `brokerage-detail-drawer.tsx`, `user-detail-drawer.tsx`, `insurer-detail-drawer.tsx`, `vehicle-detail-drawer.tsx` — todos enxutos (grids de 2 colunas ou poucos campos, sem lista/timeline embutida).
- `table.tsx`: `TableCell`/corpo da tabela de `text-[12.5px]` pra `text-sm` (14px).

**Fora:**
- Aplicar grid de 2 colunas em `quotation-vehicle-coverage-drawer.tsx` — usuário decidiu deixar como está por ora.
- Auditoria de outros textos pequenos do sistema (labels, DetailField, badges) — só a tabela por agora.
- Qualquer outro drawer além dos 6 listados no Requirement 1 — os outros 19 já eram `md` e continuam.

## Requirements

### Requirement 1: Tamanho do drawer por densidade de conteúdo

**User Story:** Como usuário, quero que o drawer seja mais largo só quando o conteúdo realmente precisar (listas embutidas, forms muito longos), para não ter espaço vazio em telas simples nem conteúdo espremido em telas densas.

#### Acceptance Criteria

1. `quotation-insurer-drawer.tsx` e `quotation-vehicle-coverage-drawer.tsx` SHALL ganhar `size="lg"`.
2. `brokerage-detail-drawer.tsx`, `user-detail-drawer.tsx`, `insurer-detail-drawer.tsx`, `vehicle-detail-drawer.tsx` SHALL perder `size="lg"` (voltam ao padrão `md`).
3. `client-detail-drawer.tsx` e `policy-detail-drawer.tsx` SHALL manter `size="lg"` — sem mudança nesses dois.
4. Nenhum outro drawer do sistema SHALL ser alterado.

### Requirement 2: Fonte mínima de 14px no corpo da tabela

**User Story:** Como usuário, quero ler os dados da tabela sem esforço, para não ter que apertar os olhos numa listagem densa.

#### Acceptance Criteria

1. O corpo da tabela (`Table`, elemento `<table>`) SHALL usar `text-sm` (14px) em vez de `text-[12.5px]`.
2. O header da tabela (`TableHead`, hoje `text-[10.5px]`, uppercase) NÃO SHALL mudar — é uma categoria visual diferente (rótulo pequeno em caixa alta), não o dado em si.
