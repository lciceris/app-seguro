# Design — client-detail-hub

## Bug real encontrado e corrigido (pré-requisito)

`src/shared/components/ui/tabs.tsx` e `separator.tsx` usavam variantes Tailwind
`data-horizontal:`/`data-vertical:`/`group-data-horizontal/tabs:`/`group-data-vertical/tabs:`
que **nunca foram registradas** via `@custom-variant` (só existe `@custom-variant dark`
em `globals.css`). Essas classes eram silenciosamente ignoradas — o `Tabs` sempre
renderizava em `flex` (row) nunca em `flex-col`, jogando o `TabsList` numa coluna
estreita ao lado do conteúdo em vez de ficar horizontal acima dele. Corrigido pra
sintaxe de atributo arbitrário do Tailwind: `data-[orientation=horizontal]:`,
`group-data-[orientation=horizontal]/tabs:`, etc. Afeta todo componente que usa
`Tabs`/`Separator` no projeto (ex.: `quotation-detail-screen`, que tinha o mesmo
bug e provavelmente nunca foi verificado visualmente).

## Dados por cliente — novos hooks (evitando import circular)

`vehicles` e `quotations` já importam `@/features/clients` (Select de cliente nos
formulários de criação). Importar esses features de volta em `clients` criaria um
ciclo. Resolvido colocando os novos hooks **dentro de cada feature dona do dado**
(mesmo padrão já usado por `use-policies-by-client`, que já vive em `policies`),
e importando só o hook (não o componente) de volta em `clients` — import circular
de hooks/funções é seguro em ESM quando nada é avaliado no escopo do módulo,
verificado rodando `tsc`/dev server sem erro.

- `vehicles`: `list-vehicles-by-client` + `use-vehicles-by-client` (novo)
- `quotations`: `list-quotations-by-client` + `use-quotations-by-client` (novo)
- `policies`: `list-policies-by-client-detailed` + `use-policies-by-client-detailed`
  (novo — o `use-policies-by-client` existente só traz `id, policy_number` pro
  seletor de "apólice anterior" do QAR; não pode ganhar embeds sem prejudicar
  aquele uso, por isso um hook novo em vez de estender o existente)

## Header

Dentro do `SheetHeader` do `client-detail-drawer.tsx`: avatar (círculo com a
inicial do `legal_name`, mesmo padrão de `brokerage-detail-drawer`), nome +
badge "PJ"/"PF" (`client_type === "company" ? "PJ" : "PF"`), CNPJ/CPF mascarado,
e — se houver `client_sellers` com `is_primary: true` — uma tag com `Star` +
nome do vendedor. Botões à direita: "Vendedores" (troca a aba ativa via estado
controlado, não abre Dialog) e "Editar" (Link condicionado a `role !== "viewer"`).

> Interpretação: o print do sistema antigo mostra "⭐ vendedor" como texto solto,
> sem nome — não dava pra saber se era o nome de um vendedor de teste chamado
> literalmente "Vendedor" ou um rótulo genérico. Optei por mostrar o **nome do
> vendedor principal vinculado** (dado real que já existe em `client_sellers`),
> que é a leitura mais útil — a confirmar com o usuário se não for isso.

## Abas

`Tabs` controlado (`useState` no componente pai, pra permitir o botão "Vendedores"
do header trocar de aba): **Dados** (default, conteúdo que já existia),
**Veículos**, **Histórico** (Cotações + Apólices, duas tabelas), **Documentos**
(placeholder), **Vendedores** (`ClientSellersSection` que já existia, só mudou
de lugar). Tabelas seguem exatamente o padrão visual/de formatação de
`vehicles-list-screen`/`quotations-list-screen`/`policies-list-screen` (mesmas
labels, mesmas classes de badge, mesmo `formatCurrency`/`formatDate` locais),
sem a coluna "Cliente" (redundante — já estamos dentro do cliente).

## Pré-seleção de cliente

`create-vehicle-drawer.tsx` e `create-quotation-drawer.tsx` passam a ler
`useSearchParams().get("client_id")` como `defaultValues.client_id`. Os links
"Adicionar veículo"/"Nova cotação" do hub apontam pra
`/vehicles/add?client_id=X` / `/quotations/add?client_id=X`.

## Testes

`client-detail-drawer.test.tsx`: a seção de vendedores agora só monta quando a
aba "Vendedores" está ativa (Radix `TabsContent` desmonta abas inativas) — todo
teste que interage com ela precisa clicar a aba primeiro. Descoberto que
`fireEvent.click` no `TabsTrigger` não é suficiente pra ativar a aba no Radix
(precisa da sequência de eventos de ponteiro completa) — trocado por
`userEvent.click`. Como o header também mostra o nome do vendedor principal
(mesmo texto "Vendedor Um" que aparece dentro da aba), os testes escopam as
buscas a `within(screen.getByRole("tabpanel"))` pra evitar match duplicado.
