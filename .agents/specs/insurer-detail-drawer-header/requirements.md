# Requirements — insurer-detail-drawer-header

## Introdução

`insurer-detail-drawer.tsx` mostrava o logo solto dentro do card "Identificação" (`size-16`, sem contexto). `brokerage-detail-drawer.tsx` já resolveu isso de outro jeito: avatar pequeno (40px, borda arredondada) direto no `SheetHeader`, ao lado do título — usuário pediu pra seguir o mesmo padrão.

## Escopo

**Dentro:**
- Logo/inicial da seguradora migra pro `SheetHeader`, mesmo tamanho/formato de `brokerage-detail-drawer` (avatar circular 40px, borda de 3px).
- Fallback de inicial quando não há logo (igual brokerages: primeira letra do nome, num círculo neutro).
- Cards de dados (`Identificação`, `Contato comercial`, `Configurações`, `Observações`) passam a usar grid de 2 colunas (`grid-cols-2 gap-x-6 gap-y-4`), igual `brokerage-detail-drawer`, em vez de empilhados.

**Fora:**
- Badge de status no header (brokerages tem Ativo/Inativo; seguradoras não têm esse conceito global — só habilitação por corretora, que não faz sentido aqui).
- Cor dinâmica na borda do avatar (brokerages usa `primary_color` da própria corretora; seguradoras não têm cor própria) — usa `border-primary` (token do tema) no lugar.

## Requirements

### Requirement 1: Header com avatar, igual `brokerage-detail-drawer`

**User Story:** Como platform_admin, quero ver o logo da seguradora junto do título ao abrir o detalhe, do mesmo jeito que já vejo em corretoras.

#### Acceptance Criteria

1. O `SheetHeader` SHALL exibir um avatar circular de 40px (logo ou inicial do nome) com borda de 3px, ao lado do título.
2. O card "Identificação" NÃO SHALL mais exibir o logo solto no corpo (só no header).

### Requirement 2: Campos em grid de 2 colunas

**User Story:** Como platform_admin, quero que o detalhe da seguradora use o espaço da mesma forma que o de corretora.

#### Acceptance Criteria

1. Todos os cards de campo (`Identificação`, `Contato comercial`, `Configurações`, `Observações`) SHALL organizar os `DetailField` num grid de 2 colunas, com campos de texto mais longo (ex.: Website, Observações) ocupando as 2 colunas.
