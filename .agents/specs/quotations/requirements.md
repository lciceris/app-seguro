# Requirements Document

## Introduction

Cotações de seguro de frota — entidade central da plataforma, agregando cliente, veículos, seguradoras e o ciclo de negociação. Reconstrói o que existia no fleet-auth-gate, mas repontuado: mesmo fluxo de status de negócio (o vendedor cria, o calculista assume e negocia, o vendedor apresenta ao cliente e efetiva), porém com correções estruturais reais encontradas na spec antiga (ver "Mudanças em relação ao modelo antigo" abaixo).

Essa spec cobre a cotação do início até a efetivação (`effected`) ou não-fechamento (`not_closed`). **Não cobre** a emissão da apólice em si nem endossos — isso é responsabilidade da spec `policies` (a seguir), que vai adicionar um trigger em `quotations` reagindo à transição pra `effected`. Aqui, "efetivar" só confirma a seguradora vencedora e move o status; a criação da apólice é tratada como responsabilidade de fora dessa spec, propositalmente, pra manter a dependência numa via só (`policies` depende de `quotations`, nunca o contrário). Note que a efetivação em si passa por um passo intermediário (`client_accepted`, ver Requirement 6) antes de chegar em `effected` — o trigger de criação da apólice reage só ao `effected` final, não ao aceite do cliente.

### Mudanças em relação ao modelo antigo

1. **Sem FK circular.** O modelo antigo tinha `quotations.winning_insurer_id → quotation_insurers.id` e `quotation_insurers.quotation_id → quotations.id` — um ciclo que impedia embed automático via PostgREST (documentado como regra permanente: "nunca fazer join automático entre `quotations` e `quotation_insurers`"). Aqui a seguradora vencedora é marcada com `quotation_insurers.is_winner = true` (só uma por cotação, via trigger — mesmo padrão de `client_sellers.is_primary`), sem nenhuma FK de volta em `quotations`. A regra de "nunca fazer join automático" deixa de ser necessária.
2. **Isolamento do `seller` de verdade na RLS.** No modelo antigo, o filtro "`seller` só vê as próprias cotações" era aplicado só no frontend — a policy de SELECT liberava qualquer cotação da corretora pra qualquer perfil. Aqui `seller_id` participa da RLS de verdade (Requirement 2).
3. **Numeração sequencial real.** `quotations.number` nunca teve geração real implementada. Aqui é gerado por função `SECURITY DEFINER` no INSERT, sequencial por corretora, sem race condition.
4. **Renovação linkável a uma apólice real.** Quando a cotação é renovação de uma apólice emitida pela própria plataforma, `quotation_qar.renewed_policy_id` (nullable, spec `policies`) referencia a apólice original. Quando é renovação de algo externo (cliente vindo de outra corretora), continuam os campos livres já existentes (`renewal_insurer_name`, `previous_premium` etc.).
5. **Parcelamento.** Adiciona `installments_count` em `quotation_insurers` — cada seguradora pode propor uma forma de pagamento diferente. Não existia no modelo antigo.
6. **Efetivação em duas etapas.** No modelo antigo, o próprio vendedor fazia `waiting_effect → effected` diretamente. Na prática, quem confirma que o cliente aceitou não é sempre quem efetiva comercialmente (financeiro/gestão confirma pagamento e formaliza). Aqui existe um status novo, `client_accepted`, entre os dois (Requirement 6).
7. **PDF de proposta.** Novidade — não existia no modelo antigo. Gerado no navegador assim que a seguradora vencedora é selecionada (Requirement 9).

### Fora de escopo desta spec (mapeado, não implementado agora)

- **Notificações de atualização da cotação** (mudança de status, novo retorno de seguradora etc.) — importante pro produto, mas fica pra uma spec futura de notificações (mesmo padrão do `docs/product/roadmap.md` do fleet-auth-gate, que já tratava isso como backlog via Resend). Quando essa spec existir, os pontos de gatilho já estão claros: toda transição de status (Requirement 6) e todo evento `system` (Requirement 8.2).
- **Geração de documento oficial da apólice** — fica pra spec `policies`.

## Requirements

### Requirement 1: Criar cotação

**User Story:** Como `seller`, `supervisor`, `brokerage_admin` ou `platform_admin`, quero criar uma nova cotação pra um cliente, para iniciar o processo de contratação ou renovação de seguro da frota dele.

#### Acceptance Criteria

1. WHEN um desses perfis submete os dados de uma nova cotação (cliente obrigatório; tipo `new` ou `renewal`; início/fim de cobertura pretendida, coberturas desejadas, preferência de franquia, prazo, observações do vendedor — todos opcionais) THEN o sistema SHALL criar a linha em `quotations` com `status = 'waiting'`, `brokerage_id` do próprio usuário, número sequencial gerado automaticamente, e `seller_id` do próprio usuário quando quem cria é `seller` (perfis de gestão podem escolher o vendedor responsável).
2. WHEN `seller` cria uma cotação THEN o sistema SHALL permitir escolher só entre os próprios clientes (mesma regra já usada em `vehicles`); perfis de gestão podem escolher qualquer cliente da corretora.
3. WHEN um perfil diferente de `seller`, `supervisor`, `brokerage_admin` ou `platform_admin` tenta criar uma cotação THEN o sistema SHALL negar a ação.

### Requirement 2: Listar e ver detalhe de cotações

**User Story:** Como usuário com acesso a cotações, quero ver a lista e o detalhe de cada uma, para acompanhar o andamento da carteira.

#### Acceptance Criteria

1. WHEN `platform_admin`, `brokerage_admin`, `supervisor`, `analyst` ou `viewer` acessa a listagem THEN o sistema SHALL exibir todas as cotações da própria corretora (número, cliente, vendedor, status, prazo), com busca por número ou nome do cliente e filtro por status.
2. WHEN `seller` acessa a listagem THEN o sistema SHALL exibir só as próprias cotações (`seller_id` igual ao próprio usuário), reforçado por RLS — não só no frontend.
3. WHEN qualquer um desses perfis abre o detalhe de uma cotação que pode ver na listagem THEN o sistema SHALL exibir todos os dados da cotação, seus veículos, o QAR e as seguradoras convidadas com seus retornos.

### Requirement 3: Gerenciar veículos da cotação

**User Story:** Como `seller`, `supervisor`, `brokerage_admin`, `platform_admin` ou `analyst` (da própria cotação), quero incluir os veículos da frota do cliente que serão cotados e detalhar a cobertura pretendida por veículo, para que a seguradora tenha os dados completos pra orçar.

#### Acceptance Criteria

1. WHEN um desses perfis adiciona um veículo (do cliente da cotação) à cotação THEN o sistema SHALL criar a linha em `quotation_vehicles` com os campos de cobertura por veículo (tipo de cobertura, percentual/valor de casco, franquia, bônus, sinistros, RCF danos materiais/corporais/morais, APP morte/invalidez, assistência 24h, cobertura de vidros, carro reserva, blindagem, equipamentos) — todos opcionais exceto o vínculo com o veículo.
2. WHEN a cotação está em `waiting` ou `in_progress` THEN o sistema SHALL permitir adicionar ou remover veículos da cotação livremente.
3. WHEN a cotação atinge `in_negotiation` ou um status posterior THEN o sistema SHALL bloquear adicionar/remover veículos — a lista fica travada porque as seguradoras já estão orçando em cima dela; os campos de cobertura de cada veículo continuam editáveis (ver Requirement 6.5).
4. WHEN um veículo é removido do cliente (Requirement de `vehicles`) mas segue vinculado a uma cotação existente THEN a linha em `quotation_vehicles` SHALL ser preservada (a exclusão de veículo é bloqueada pela FK — só inativação — então isso não chega a ocorrer na prática, mas o vínculo nunca é removido silenciosamente).

### Requirement 4: Questionário de Análise de Risco (QAR)

**User Story:** Como `seller`, `supervisor`, `brokerage_admin`, `platform_admin` ou `analyst`, quero preencher o questionário de análise de risco da cotação, para que as seguradoras tenham o contexto de risco da frota ao orçar.

#### Acceptance Criteria

1. WHEN um desses perfis preenche o QAR de uma cotação (um registro por cotação — tipo, vencimento da apólice atual e seguradora atual quando renovação, sinistralidade, prêmio anterior/desejado, gestão de risco, manutenção preventiva, direção defensiva, rastreador, transporte de carga e categoria, regiões de circulação) THEN o sistema SHALL criar ou atualizar a linha em `quotation_qar`.
2. WHEN a cotação é do tipo `renewal` E a apólice anterior foi emitida pela própria plataforma THEN o sistema SHALL permitir vincular `renewed_policy_id` a essa apólice (spec `policies`) em vez de preencher os campos livres de seguradora/prêmio anterior.
3. WHEN um desses perfis anexa um arquivo ao QAR THEN o sistema SHALL fazer upload pro bucket `qar-attachments` e criar a linha em `quotation_qar_attachments`; a listagem de anexos é visível a todos que veem a cotação (Requirement 2.3).

### Requirement 5: Convidar seguradoras e registrar retornos

**User Story:** Como `analyst`, `supervisor`, `brokerage_admin` ou `platform_admin`, quero convidar seguradoras pra cotação e registrar o retorno de cada uma, para negociar a melhor proposta pro cliente.

#### Acceptance Criteria

1. WHEN um desses perfis convida uma seguradora pra cotação THEN o sistema SHALL criar a linha em `quotation_insurers` com `response_status = 'pending'` — só seguradoras habilitadas pra própria corretora (não desabilitadas via `brokerage_disabled_insurers`) aparecem como opção.
2. Uma seguradora SHALL aparecer no máximo uma vez por cotação.
3. WHEN um desses perfis atualiza o retorno de uma seguradora (status de resposta, prêmio proposto, franquia, taxa de comissão, número de parcelas, número da proposta na seguradora, coberturas aprovadas, notas do calculista) THEN o sistema SHALL atualizar a linha correspondente, sem restrição de transição entre os `response_status` (`pending`, `accepted`, `declined`, `waiting_info`) — o calculista pode corrigir livremente.
4. WHEN `seller` tenta convidar seguradora ou editar um retorno THEN o sistema SHALL negar a ação — só visualiza (Requirement 2.3).

### Requirement 6: Fluxo de status da cotação

**User Story:** Como participante do fluxo de negociação, quero avançar a cotação pelos status corretos, para refletir o andamento real da negociação — incluindo a diferença entre "o cliente aceitou" (comercial) e "foi efetivada" (financeiro/gestão confirmou e formalizou).

#### Acceptance Criteria

1. WHEN `analyst`, `supervisor`, `brokerage_admin` ou `platform_admin` avança uma cotação de `waiting` para `in_progress` THEN o sistema SHALL definir `analyst_id` como o próprio usuário quando quem avança é `analyst`, mantendo o valor já definido quando é um perfil de gestão reatribuindo.
2. WHEN esse mesmo grupo avança de `in_progress` para `in_negotiation` THEN o sistema SHALL permitir a transição livremente — é aqui que as seguradoras começam a ser convidadas (Requirement 5).
3. WHEN esse mesmo grupo avança de `in_negotiation` para `presented` THEN o sistema SHALL exigir que exatamente uma seguradora da cotação esteja marcada como vencedora (`is_winner = true`, Requirement 7) antes de permitir a transição.
4. WHEN a cotação está em `presented` THEN o sistema SHALL considerar as ações do `analyst` encerradas — só `seller` (o vendedor da cotação), `supervisor`, `brokerage_admin` ou `platform_admin` avançam a partir daqui.
5. WHEN `seller` (da própria cotação), `supervisor`, `brokerage_admin` ou `platform_admin` avança de `presented` para `waiting_effect` THEN o sistema SHALL permitir a transição — representa o envio da proposta ao cliente.
6. WHEN `seller` (da própria cotação), `supervisor`, `brokerage_admin` ou `platform_admin` avança de `waiting_effect` para `client_accepted` THEN o sistema SHALL registrar que o cliente sinalizou aceite — esse passo **não** efetiva nem gera apólice, só formaliza que a resposta comercial foi positiva.
7. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` avança de `client_accepted` para `effected` THEN o sistema SHALL confirmar a seguradora já marcada como vencedora e travar a cotação pra edição adicional (estado terminal) — esse é o passo que, na spec `policies`, dispara a criação da apólice. `seller` e `analyst` não podem fazer essa transição.
8. WHEN `seller` (da própria cotação), `supervisor`, `brokerage_admin` ou `platform_admin` avança de `waiting_effect` para `not_closed` THEN o sistema SHALL exigir o preenchimento de `lost_reason` e travar a cotação (estado terminal).
9. WHEN `supervisor`, `brokerage_admin` ou `platform_admin` avança de `client_accepted` para `not_closed` THEN o sistema SHALL permitir (válvula de segurança — o negócio pode cair depois do aceite verbal, antes da efetivação financeira), exigindo `lost_reason`.
10. WHEN qualquer transição fora da sequência definida (`waiting → in_progress → in_negotiation → presented → waiting_effect → {client_accepted|not_closed}`, `client_accepted → {effected|not_closed}`) é tentada THEN o sistema SHALL negar.
11. `effected` e `not_closed` são estados terminais — não há caminho de volta. Uma nova tentativa comercial com o mesmo cliente (ex: cliente recusou mas quer reabrir depois) SHALL ser uma cotação nova, nunca a reabertura de uma `not_closed`.

### Requirement 7: Selecionar seguradora vencedora

**User Story:** Como `analyst`, `supervisor`, `brokerage_admin` ou `platform_admin`, quero marcar qual seguradora venceu a negociação, para que essa seja a proposta apresentada ao cliente e, se aceita, a base da apólice.

#### Acceptance Criteria

1. WHEN um desses perfis marca uma seguradora da cotação como vencedora THEN o sistema SHALL desmarcar automaticamente qualquer outra marcada anteriormente (só uma por cotação, via trigger — mesmo padrão de `client_sellers.is_primary`).
2. Só seguradoras com `response_status = 'accepted'` SHALL poder ser marcadas como vencedoras.
3. A seguradora vencedora pode ser trocada livremente enquanto a cotação estiver em `in_negotiation`; a partir de `presented` (Requirement 6.4), a marcação fica implícita à cotação já apresentada — trocar de vencedora nesse ponto exigiria voltar o status, o que não é permitido (Requirement 6.10), então a escolha é definitiva ao apresentar.

### Requirement 8: Comentários e eventos por seguradora

**User Story:** Como participante da negociação, quero registrar comentários e ver o histórico de mudanças por seguradora, para acompanhar como a negociação evoluiu com cada uma.

#### Acceptance Criteria

1. WHEN `analyst`, `supervisor`, `brokerage_admin` ou `platform_admin` adiciona um comentário a uma seguradora da cotação THEN o sistema SHALL criar um evento em `quotation_insurer_events` com `event_type = 'comment'`, autoria e conteúdo.
2. WHEN um campo relevante do retorno de uma seguradora é alterado (Requirement 5.3) THEN o sistema SHALL registrar automaticamente um evento `event_type = 'system'` com o campo alterado, valor anterior e novo valor.
3. WHEN qualquer perfil com acesso à cotação (Requirement 2) visualiza uma seguradora THEN o sistema SHALL exibir a linha do tempo de eventos, em modo leitura pra `seller` e `viewer`.

### Requirement 9: Gerar PDF de proposta

**User Story:** Como `seller`, quero baixar (ou compartilhar) um PDF de apresentação da cotação assim que a seguradora vencedora for escolhida, para apresentar a proposta ao cliente de forma profissional, por e-mail ou WhatsApp.

#### Acceptance Criteria

1. WHEN a cotação tem uma seguradora marcada como vencedora (Requirement 7) THEN o sistema SHALL disponibilizar a geração de um PDF de proposta contendo dados do cliente, os veículos incluídos na cotação com o resumo de cobertura de cada um, e os dados da proposta vencedora (seguradora, prêmio, franquia, parcelamento, vigência pretendida).
2. O PDF SHALL ser gerado inteiramente no navegador (biblioteca client-side), sem nenhuma chamada a backend ou Edge Function — mantém a spec simples e sem infraestrutura de geração de documento no servidor (essa complexidade fica pra spec `policy-endorsements`, que precisa de verdade dela).
3. WHEN o usuário clica em "Baixar PDF" THEN o sistema SHALL gerar o arquivo e iniciar o download diretamente.
4. WHEN o navegador do usuário suporta a Web Share API com arquivos THEN o sistema SHALL também oferecer um botão "Compartilhar" que abre o seletor nativo do sistema operacional (que inclui WhatsApp, e-mail etc. quando disponíveis); WHEN não suporta THEN o sistema SHALL mostrar só a opção de baixar — não existe integração direta com WhatsApp (não é uma API que a plataforma controla), então o compartilhamento depende do que o navegador/SO do usuário oferece.
5. Qualquer perfil com acesso à cotação (Requirement 2) SHALL poder gerar o PDF — normalmente o vendedor, mas perfis de gestão também podem gerar pra conferência.
