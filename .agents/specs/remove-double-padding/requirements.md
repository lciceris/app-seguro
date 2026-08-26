# Requirements — remove-double-padding

## Introdução

`app-shell.tsx` já aplica `p-6` no `<main>` que envolve toda tela renderizada via `<Outlet />`. O usuário notou que 10 telas de topo de rota ainda embrulhavam o próprio conteúdo de novo num `<div className="p-6">` — padding duplicado, sem nenhuma outra classe nesse wrapper (confirmado via grep: as 10 ocorrências são exatamente `<div className="p-6">`, nada mais).

## Escopo

**Dentro:** remover o `<div className="p-6">` redundante nas 10 telas afetadas, substituindo por `<>...</>` (Fragment) já que cada uma retorna múltiplos elementos irmãos (o conteúdo da página + `<Outlet />`/diálogos).

**Fora:** qualquer outra mudança de layout. Não mexe no fato de `SidebarInset` (shadcn) também renderizar como `<main>` (gera dois elementos `<main>` aninhados no DOM) — isso é estrutural do primitivo shadcn, pré-existente, e não foi o que o usuário reportou.

## Requirements

### Requirement 1: Um só padding de página

**User Story:** Como usuário, quero que o espaçamento entre o conteúdo e a borda da tela seja consistente e não duplicado.

#### Acceptance Criteria

1. As 10 telas (`clients-list-screen`, `brokerages-list-screen`, `own-brokerage-screen`, `policies-list-screen`, `users-list-screen`, `insurers-list-screen`, `insurer-catalog-screen`, `vehicles-list-screen`, `quotation-detail-screen`, `quotations-list-screen`) SHALL remover o wrapper `<div className="p-6">` e usar Fragment (`<>`) no lugar.
2. Nenhuma mudança de conteúdo, comportamento ou classe além da remoção do wrapper.
3. O padding entre o painel/conteúdo e a borda da tela SHALL vir só de `<main>` (`app-shell.tsx`), confirmado via medição real (offset do primeiro elemento filho vs. a borda do `<main>` mais interno).
