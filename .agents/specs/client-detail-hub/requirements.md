# Requirements — client-detail-hub

## Contexto

O usuário mostrou 3 prints do sistema antigo (fleet-auth-gate): a tela de "ver cliente" lá tem um header estilo perfil (avatar, nome, CNPJ/CPF + badge PJ/PF, tag do vendedor, botões "Vendedores"/"Editar") e abas Veículos/Histórico/Documentos, consolidando tudo do cliente num só lugar — bem diferente do drawer atual (pilha de cards). Pedido: analisar e sugerir opções baseado nisso.

Após levantar o que já existe no banco (`vehicles.client_id`, `quotations.client_id`, hook `use-policies-by-client` já existente), 3 opções foram apresentadas ao usuário (header só; header + reorganização sem dado novo; header + abas completas). **Escolhida: header + abas completas.**

## Requirement 1: Header estilo perfil

1. WHEN o drawer de detalhe do cliente é aberto THEN o sistema SHALL exibir avatar (inicial do nome), nome, documento mascarado (CNPJ/CPF conforme tipo), badge PJ/PF, e — quando houver vendedor principal vinculado — uma tag com ícone de estrela e o nome do vendedor.
2. WHEN o usuário clica em "Vendedores" no header THEN o sistema SHALL abrir a aba Vendedores (sem Dialog sobre o drawer, seguindo a regra do projeto de nunca abrir modal dentro de drawer).
3. WHEN o perfil do usuário permite editar (`role !== 'viewer'`) THEN o sistema SHALL exibir um botão "Editar" no header que navega para `/clients/:id/edit`.

## Requirement 2: Abas

1. WHEN o drawer é aberto THEN o sistema SHALL organizar o conteúdo em abas: **Dados** (Identificação/Endereço/Contatos/Observações — conteúdo que já existia, default), **Veículos**, **Histórico**, **Documentos**, **Vendedores** (seção que já existia, movida da pilha pra sua própria aba).

   > Nota: o usuário pediu literalmente "Veículos/Histórico/Documentos" (as 3 abas visíveis nos prints do sistema antigo). As abas **Dados** e **Vendedores** são acréscimo necessário — sem elas o conteúdo que já existia (identificação, endereço, contatos, vendedores vinculados) não teria mais lugar no drawer.

2. WHEN a aba Veículos é aberta THEN o sistema SHALL listar os veículos do cliente (placa, classificação, marca/modelo, ano, uso, valor declarado, ações Ver/Editar) com um botão "Adicionar veículo".
3. WHEN a aba Histórico é aberta THEN o sistema SHALL listar as cotações do cliente (número, vendedor, status, prazo, ação Ver) com botão "Nova cotação", e as apólices do cliente (número, seguradora, prêmio, status derivado, vigência, ação Ver).
4. WHEN a aba Documentos é aberta THEN o sistema SHALL exibir um placeholder "Em breve" (upload de documentos não existe ainda).

## Requirement 3: Criação com cliente pré-selecionado

1. WHEN o usuário clica em "Adicionar veículo" ou "Nova cotação" dentro do hub do cliente THEN o sistema SHALL navegar pro formulário de criação com o campo Cliente já pré-selecionado (via query param `client_id`).
