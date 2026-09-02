# Design — design-refresh-stitch-inspired

## Sidebar (Requirement 1)

`app-sidebar.tsx`: ícones dos itens de menu passam de `size-4` (16px) pra
`size-5` (20px); `SidebarMenu` gap de `gap-1.5` pra `gap-2`; item individual
ganha um pouco mais de padding vertical.

`sidebar.tsx` (primitivo, `SidebarMenuButton`): adiciona indicador lateral —
`data-[active=true]:before:absolute data-[active=true]:before:inset-y-1
data-[active=true]:before:left-0 data-[active=true]:before:w-[3px]
data-[active=true]:before:rounded-full data-[active=true]:before:bg-primary`
(pseudo-elemento `::before`, precisa de `relative` no botão — já tem).

## Tabelas (Requirement 2)

`table.tsx`: `TableHead` de `h-10 ... text-[10.5px]` pra `h-11 ...
text-[11.5px]`; `TableCell` de `px-3 py-1.5` pra `px-3 py-2.5`.

## Badges (Requirement 3)

`badge.tsx`: `badgeVariants` base de `h-5 ... px-2 py-0.5 text-xs font-medium`
pra `h-6 ... px-2.5 py-1 text-xs font-semibold`.

## Botões com ícone (Requirement 4)

Import `Plus` de `lucide-react` nos 6 list-screens (brokerages, clients,
insurers, quotations, users, vehicles) — `<Plus className="h-4 w-4" />`
antes do texto do botão de criar.

## Comparativo de seguradoras em colunas (Requirement 5)

`quotation-insurers-tab.tsx`: troca a tabela HTML de linhas por seguradora
pra uma tabela transposta — primeira coluna fixa com os rótulos dos
critérios (Status, Prêmio, Decisão), uma coluna por seguradora convidada
(cabeçalho com nome + badge "Vencedora" quando `is_winner`). Container com
`overflow-x-auto` pra rolar horizontalmente quando tiver muitas seguradoras.
Clicar em qualquer célula de uma coluna abre o mesmo `QuotationInsurerDrawer`
de hoje (mesmo estado `selectedQuotationInsurerId`). O formulário de convidar
seguradora (Select + botão) continua igual, só a tabela muda.

## Hub do cliente — 2 colunas (Requirement 6)

Novo componente `ClientSidebarCards` dentro de `client-detail-screen.tsx`:
- Card "Vendedor principal": usa o `primarySeller` já derivado de
  `useClientSellers`; botão "Ver todos" troca a aba ativa pra `sellers`.
- Card "Apólice vigente": usa `usePoliciesByClientDetailed(clientId)`,
  filtra por `getDerivedPolicyStatus !== "cancelled" && !== "superseded"`,
  pega a de `coverage_end` mais distante (ainda vigente ou vencendo), mostra
  número, seguradora, vigência e um link "Ver detalhes" pra
  `/policies/:id`. Sem apólice qualificada, mostra estado vazio simples.

Layout: `grid grid-cols-[1fr_320px] gap-4` — tabs+conteúdo à esquerda, os
dois cards empilhados à direita, visível em qualquer aba (fora do `<Tabs>`).

## Hub do cliente vira página (Requirement 7)

Mesma estrutura de `quotation-detail-screen.tsx`/rota de `/quotations`:

- Novo `src/features/clients/screens/client-detail-screen/client-detail-screen.tsx`
  com o conteúdo de `client-detail-drawer.tsx` sem `Sheet`/`SheetContent`/
  `SheetHeader`/`SheetFooter` — header vira uma `<div className="mb-4 flex
  items-center justify-between">` com `Link` de voltar (`ArrowLeft` pra
  `/clients`) no lugar do X do Sheet, mais o `<Outlet />` no final pra
  renderizar `/clients/:clientId/edit` por cima.
- `client-detail-drawer.tsx` é removido; `ClientDetailPage` passa a
  renderizar `ClientDetailScreen`.
- `app-router.tsx`: `<Route path=":clientId" .../>` sai de dentro de
  `/clients` e vira rota irmã `<Route path="/clients/:clientId"
  element={<ClientDetailPage />}>`, com `<Route path="edit"
  element={<EditClientPage />} />` aninhada nela (mesmas roles de hoje).
  Comentário igual ao de quotations documentando a divergência de padrão.
- `edit-client-drawer.tsx`: `handleClose` volta a ser incondicional
  (`navigate(\`/clients/${clientId}\`)`), removendo o `return_to`/
  `useSearchParams` — com a nova estrutura de rota, `/clients/:id` está
  sempre por trás do `/clients/:id/edit`, igual cotações.
- Testes: `client-detail-drawer.test.tsx` vira `client-detail-screen.test.tsx`,
  trocando `renderWithProviders` pra rota `/clients/:clientId` sem `Sheet`
  (sem precisar simular abrir/fechar).
