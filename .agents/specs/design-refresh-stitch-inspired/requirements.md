# Requirements — design-refresh-stitch-inspired

## Contexto

O usuário gerou mockups no Google Stitch a partir de um prompt descrevendo o
app. Boa parte saiu fora do padrão real (dados inventados, IA fora do lugar),
mas alguns pontos visuais foram aprovados pra trazer de volta pro código de
verdade, mais 2 sugestões da IA (comparativo de seguradoras em colunas,
layout 2 colunas no hub do cliente) e a decisão de virar o hub do cliente de
drawer pra página cheia — mesma exceção já usada em `quotation-detail-screen`
(ver `.agents/specs/quotations/design.md`, "Divergência de padrão").

## Requirement 1: Sidebar mais espaçada

1. WHEN a sidebar é renderizada THEN os ícones SHALL ser maiores (20px em vez de 16px) e o espaçamento entre itens SHALL aumentar.
2. WHEN um item está ativo THEN SHALL exibir uma barra vertical de 3px na cor primária na borda esquerda do item, além do fundo já existente.

## Requirement 2: Tabelas com mais respiro

1. WHEN uma tabela usa os componentes compartilhados (`TableHead`/`TableCell`) THEN a fonte do cabeçalho SHALL aumentar (de 10.5px pra ~11.5px) e o padding vertical da célula SHALL aumentar (de 6px pra ~10px), mantendo a tabela ainda densa (não virar uma lista espaçosa).

## Requirement 3: Badges mais destacados

1. WHEN um `Badge` é renderizado THEN SHALL ter altura e padding maiores que hoje, com peso de fonte mais forte, mantendo as mesmas cores semânticas já usadas.

## Requirement 4: Botões primários de criação com ícone

1. WHEN uma listagem tem um botão principal de criar registro (Nova corretora, Novo cliente, Nova seguradora, Nova cotação, Convidar usuário, Novo veículo) THEN o botão SHALL exibir um ícone de "+" antes do texto.

## Requirement 5: Comparativo de seguradoras em colunas

1. WHEN a aba Seguradoras de uma cotação é exibida THEN o comparativo SHALL mostrar cada seguradora convidada como uma coluna (não uma linha), com os critérios (status, prêmio, decisão de vencedora) como linhas — mais fácil de comparar lado a lado.
2. Comportamento de clique/edição por seguradora (abrir o drawer de detalhe) SHALL continuar existindo, só a disposição visual muda.

## Requirement 6: Hub do cliente em 2 colunas

1. WHEN o hub do cliente é exibido THEN SHALL ter uma coluna lateral fixa (visível em qualquer aba) com cards de "Vendedor principal" e "Apólice vigente" (quando existir uma apólice com status derivado diferente de cancelada/substituída, priorizando a mais recente), complementando o conteúdo principal das abas.

## Requirement 7: Hub do cliente vira página cheia

1. WHEN o usuário abre o detalhe de um cliente THEN o sistema SHALL navegar pra uma página cheia (não mais um drawer/Sheet), com um botão "← Voltar" pra listagem, seguindo exatamente o mesmo padrão de rota já usado por `quotation-detail-screen` (rota `/clients/:clientId` como página, com `/clients/:clientId/edit` aninhada nela — não mais aninhada em `/clients`).
2. WHEN o formulário de editar cliente é fechado ou salvo com sucesso THEN SHALL sempre voltar pra `/clients/:clientId` (a página do hub, que passa a estar sempre por trás, inclusive quando a edição é aberta direto da listagem) — simplificando a lógica de `return_to` que existia antes só pra contornar a estrutura de rota antiga.
