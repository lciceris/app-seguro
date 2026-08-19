# Implementation Plan

- [x] 1. Schema e RLS base
  - [x] 1.1 Migration: enums `quotation_status`, `quotation_type`, `insurer_response_status`, `quotation_event_type`, `coverage_type`, `franchise_type`, `glass_coverage_level`
    - _Requirements: infra_
  - [x] 1.2 Migration: `quotation_number_counters` + trigger `generate_quotation_number` (numeração sequencial atômica por corretora/ano)
    - _Requirements: 1.1_
  - [x] 1.3 Migration: tabela `quotations` (`brokerage_id`, `client_id`, `seller_id`, `analyst_id`, `number`, `status` default `waiting`, `quotation_type`, datas/coberturas/prazo, `seller_notes`, `lost_reason`; trigger `set_updated_at`)
    - _Requirements: 1.1_
  - [x] 1.4 Migration: tabela `quotation_vehicles` (PK composta `vehicle_id`/`quotation_id`, ~19 campos de cobertura por veículo)
    - _Requirements: 3.1_
  - [x] 1.5 Migration: tabela `quotation_insurers` (`is_winner` em vez de `winning_insurer_id`; `installments_count` novo; `UNIQUE(quotation_id, insurer_id)`; `CHECK (NOT is_winner OR response_status = 'accepted')`)
    - _Requirements: 5.1, 5.2, 7.2_
  - [x] 1.6 Migration: tabela `quotation_qar` (1:1 com `quotations`, sem `renewed_policy_id` ainda — ver design.md)
    - _Requirements: 4.1_
  - [x] 1.7 Migration: tabela `quotation_qar_attachments`
    - _Requirements: 4.3_
  - [x] 1.8 Migration: tabela `quotation_insurer_events` (`event_type` como enum)
    - _Requirements: 8.1, 8.2_
  - [x] 1.9 Migration: funções `SECURITY DEFINER` — `get_quotation_brokerage_id(uuid)`, `is_my_quotation(uuid)`, `is_my_quotation_insurer(uuid)`
    - _Requirements: infra_
  - [x] 1.10 Migration: RLS de `quotations` (select/insert/update, sem delete)
    - _Requirements: 1.3, 2.1, 2.2_
  - [x] 1.11 Migration: RLS de `quotation_vehicles`, `quotation_qar`, `quotation_qar_attachments` (mesma condição de visibilidade da cotação pai)
    - _Requirements: 3.1, 4.1, 4.3_
  - [x] 1.12 Migration: RLS de `quotation_insurers` (insert/update só `analyst`/`supervisor`/`brokerage_admin`/`platform_admin`) e `quotation_insurer_events` (idem pro insert)
    - _Requirements: 5.4, 8.1_
  - [x] 1.13 Migration: trigger `enforce_single_quotation_winner` em `quotation_insurers` (mesmo padrão de `enforce_single_primary_seller`)
    - _Requirements: 7.1_
  - [x] 1.14 Migration: trigger `enforce_quotation_status_transition` em `quotations` (valida toda a máquina de estados do Requirement 6 — sequência, role por transição, `analyst_id` automático, exigência de vencedora antes de `presented`, exigência de `lost_reason` antes de `not_closed`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11_
  - [x] 1.15 Migration: trigger de validação em `quotation_vehicles` — veículo precisa ser do mesmo `client_id` da cotação; bloqueia INSERT/DELETE fora de `waiting`/`in_progress` (UPDATE de cobertura continua livre)
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 1.16 Migration: bucket `qar-attachments` (privado) + policies de `storage.objects` (path `{brokerage_id}/{quotation_id}/{filename}`, mesma regra de visibilidade da cotação)
    - _Requirements: 4.3_

  16 migrations aplicadas no projeto hospedado (`supabase db push --linked`) e tipos TypeScript regenerados. Verificado com usuários/corretoras de teste reais (script efêmero, limpo depois, 24 checks): numeração sequencial no formato `QT-2026-NNNN` e sem colisão em inserções concorrentes (`Promise.all`); `seller` B não enxerga cotação de `seller` A; adicionar veículo do cliente certo funciona, de cliente errado é rejeitado pelo trigger; lista de veículos trava a partir de `in_negotiation` (confirmado tentando inserir depois da transição); `analyst` convida seguradora e assume `analyst_id` automaticamente ao iniciar (`waiting → in_progress`); `seller` bloqueado (RLS silenciosa, 0 linhas, valor intacto no banco — confirmado via segunda leitura) ao tentar editar retorno de seguradora; marcar vencedora com `response_status = 'pending'` é rejeitado pelo `CHECK`; avançar pra `presented` sem vencedora marcada é bloqueado pelo trigger; `seller` avança `presented → waiting_effect → client_accepted`; `seller` e `analyst` são bloqueados na transição final `client_accepted → effected`; `supervisor` efetiva com sucesso; status terminal não aceita mais mudança; upload/leitura de anexo do QAR (bucket `qar-attachments`) respeita a mesma visibilidade da cotação — `seller` de outra cotação não consegue baixar.

- [x] 2. Camada de dados do frontend
  - [x] 2.1 Criar `features/quotations/types/` + `constants/query-keys.ts` + `constants/labels.ts` (status, tipo, resposta de seguradora, tipo de cobertura/franquia/vidros)
    - _Requirements: infra_
  - [x] 2.2 Criar `features/quotations/api/` pra `quotations` — list, get, create, update (campos gerais), advance-status
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 6.1_
  - [x] 2.3 Criar `features/quotations/api/` pra `quotation_vehicles` — list, add, update, remove
    - _Requirements: 3.1_
  - [x] 2.4 Criar `features/quotations/api/` pra `quotation_qar` (get/upsert) e `quotation_qar_attachments` (list/upload/delete/url assinada)
    - _Requirements: 4.1, 4.3_
  - [x] 2.5 Criar `features/quotations/api/` pra `quotation_insurers` (list/invite/update/set-winner) e `quotation_insurer_events` (list/comment)
    - _Requirements: 5.1, 5.3, 7.1, 8.1_
  - [x] 2.6 Criar `features/quotations/hooks/` correspondentes — cada mutation invalida a query certa
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.3, 5.1, 5.3, 6.1, 7.1, 8.1_

  20 módulos de `api/` + 21 hooks. Pontos de atenção resolvidos: `list-quotations`/`get-quotation` usam embed explícito com o nome da FK (`seller:users!quotations_seller_id_fkey(...)`) porque `quotations` tem duas colunas apontando pra `users` (`seller_id`/`analyst_id`) — embed genérico seria ambíguo. `create-quotation` passa `number: ""` no payload (sobrescrito pelo trigger `generate_quotation_number`, mas a coluna não tem `DEFAULT`, só trigger, então o tipo gerado exige o campo). `upload-qar-attachment` é a primeira função do projeto usando `supabase.storage` (upload + insert da linha, path com UUID pra evitar colisão de nome de arquivo); anexo privado usa URL assinada de 60s pra download (`get-qar-attachment-url`). `npx tsc --noEmit`, `npx eslint` e a suíte de testes inteira (37 arquivos/77 testes) sem erros — nada quebrou nas specs anteriores.

- [x] 3. Listagem de cotações
  - [x] 3.1 Criar `features/quotations/screens/quotations-list-screen/` — número, cliente, vendedor, status (badge), prazo; busca por número/cliente; filtro por status
    - _Requirements: 2.1, 2.2_
  - [x] 3.2 Criar `pages/quotations/quotations-page.tsx` e registrar a rota `/quotations` (restrita a `platform_admin`, `brokerage_admin`, `supervisor`, `analyst`, `seller`, `viewer`)
    - _Requirements: 2.1, 2.2_

  Efeito colateral bom: `/quotations` já era a rota inicial de `brokerage_admin`/`supervisor` desde a spec `auth`, mas nunca tinha sido implementada — login desses perfis caía numa rota sem match. A partir de agora cai na tela de verdade.

  Verificado com 5 usuários de teste reais pelo navegador (script efêmero, limpo depois): `brokerage_admin` loga e cai direto em `/quotations`, vendo as 2 cotações da corretora; `seller` A vê só a própria cotação (RLS) e o botão "Nova cotação"; busca por número e filtro por status funcionam; `viewer` não vê "Nova cotação" nem o ícone Editar. Nenhum erro de console.

- [x] 4. Criar cotação
  - [x] 4.1 Criar `features/quotations/validations/create-quotation-schema.ts`
    - _Requirements: 1.1_
  - [x] 4.2 Criar `features/quotations/components/create-quotation-drawer/` — seletor de cliente escopado por role (mesmo padrão de `vehicles`); seletor de vendedor responsável condicional (só perfis de gestão — `seller` fica implícito)
    - _Requirements: 1.1, 1.2_
  - [x] 4.3 Criar `pages/quotations/add/add-quotation-page.tsx` como rota filha `/quotations/add`
    - _Requirements: 1.1_

  Verificado com `seller` e `supervisor` reais pelo navegador (script efêmero, limpo depois): `seller` não vê o seletor de vendedor responsável e a cotação criada já sai com `seller_id` do próprio; `supervisor` vê o seletor e escolhe outro vendedor manualmente; número sequencial gerado corretamente (`QT-2026-0001`); status inicial `waiting`. Nenhum erro de console.

- [x] 5. Página de detalhe da cotação (estrutura de abas + Visão geral)
  - [x] 5.1 Criar `features/quotations/screens/quotation-detail-screen/` — página cheia (não drawer) com abas: Visão geral, Veículos, QAR, Seguradoras
    - _Requirements: 2.3_
  - [x] 5.2 Criar `pages/quotations/[quotationId]/quotation-detail-page.tsx` e registrar a rota `/quotations/:quotationId` (rota irmã de `/quotations`, fora do `<Outlet/>` da listagem — é página cheia, não drawer)
    - _Requirements: 2.3_
  - [x] 5.3 Conteúdo da aba Visão geral — dados gerais da cotação, número, vendedor, calculista, prazo
    - _Requirements: 2.3_
  - [x] 5.4 (infra) shadcn `tabs` — não existia ainda

  Verificado com `supervisor`, `viewer` e `seller` reais pelo navegador (script efêmero, limpo depois): todos os campos da aba Visão geral aparecem corretamente (número, cliente, status, tipo, franquia, observações); trocar de aba (Veículos/Seguradoras) funciona; `supervisor` vê botão Editar, `viewer` não vê; botão voltar navega pra listagem; `seller` sem vínculo com o cliente é bloqueado pela RLS ao abrir a página. Nenhum erro de console.

- [x] 6. Editar cotação
  - [x] 6.1 Criar `features/quotations/validations/edit-quotation-schema.ts`
    - _Requirements: infra_
  - [x] 6.2 Criar `features/quotations/components/edit-quotation-drawer/` — campos gerais (vendedor responsável condicional por role, tipo, datas, coberturas desejadas, franquia preferida, prazo, observações). `client_id` fica de fora de propósito — trocar o cliente de uma cotação com veículos já vinculados quebraria a checagem de integridade do trigger `validate_quotation_vehicle`.
    - _Requirements: infra_
  - [x] 6.3 Criar `pages/quotations/[quotationId]/edit/edit-quotation-page.tsx` como rota filha `/quotations/:quotationId/edit` — drawer sobre a página de detalhe (`quotation-detail-screen` ganhou `<Outlet/>`), mesmo padrão de sobreposição já usado nas specs anteriores
    - _Requirements: infra_

  Nota de processo: o comando `npx shadcn add tabs` (Task 5) foi originalmente executado sem querer no diretório `fleet-auth-gate` por causa do reset de cwd do Bash — criou um `src/components/ui/tabs.tsx` órfão lá, identificado e removido antes de qualquer commit (nada vazou pro repo errado). Refeito corretamente em `app-seguro` logo em seguida.

  Verificado com `supervisor` e `seller` reais pelo navegador (script efêmero, limpo depois): valores atuais vêm pré-preenchidos corretamente desde o primeiro render, incluindo o Select de vendedor (mesmo padrão de `defaultValues`-no-`useForm` + gate em ambas as queries assíncronas já estabelecido); salvar atualiza o banco e volta pro detalhe; `seller` não vê o campo "Vendedor responsável" (só perfis de gestão reatribuem). Nenhum erro de console.

- [x] 7. Aba Veículos
  - [x] 7.1 Seletor de veículos do cliente da cotação (reaproveita `useVehicles()` filtrado pelo `client_id`) + formulário de cobertura por veículo
    - _Requirements: 3.1_
  - [x] 7.2 UI reflete o travamento de adicionar/remover a partir de `in_negotiation` (Requirement 3.3) — campos de cobertura continuam editáveis
    - _Requirements: 3.2, 3.3_

  Achado real durante a verificação (não era só bug de teste): a RLS de `vehicles` (spec `vehicles`, migration `20260814120003`) nunca deu nenhum acesso — nem leitura — pra `analyst`/`viewer`, decisão que fazia sentido antes de `quotations` existir. Com a aba Veículos fazendo embed de `vehicles(plate, brand, model)`, o `analyst` (justamente quem trabalha nessa aba como calculista) via a linha da cobertura mas com tudo "—" porque o embed voltava `null` pra ele. Corrigido com a migration `20260819100017_extend_vehicles_select_to_analyst_viewer.sql`, estendendo o `vehicles_select` (só select, nunca insert/update) pra incluir `analyst` e `viewer`, na mesma linha da leitura ampla que `viewer` já tinha em `clients`.

  Drawer de cobertura (`quotation-vehicle-coverage-drawer.tsx`) reaproveita o Sheet local-`useState` mesmo estando dentro de uma página cheia (não uma outra Sheet já aberta) — não viola a regra "nunca modal dentro de drawer" do CLAUDE.md porque o container aqui é uma página, não um drawer.

  Verificado com `seller` e `analyst` reais pelo navegador via Playwright (script efêmero em `e2e/`, rodado e apagado depois, sem virar teste permanente — isso fica pra Task 12): `seller` com cotação em `waiting` adiciona veículo do cliente certo, edita cobertura (valor de casco refletido na tabela), remove e re-adiciona; `analyst` avança a cotação até `in_negotiation` (chamada direta via sessão do navegador, já que a UI de transição de status é só a Task 10) e confirma que o seletor "Adicionar veículo" e o botão "Remover" somem, mas "Editar cobertura" continua funcionando e persiste o novo valor — inclusive enxergando a placa do veículo graças ao fix de RLS acima. Nenhum erro de console. `npx tsc --noEmit` e `npx eslint` limpos.

- [x] 8. Aba QAR
  - [x] 8.1 Formulário do QAR (upsert 1:1) — tipo, dados de renovação (texto livre por enquanto), sinistralidade, prêmios, flags de risco, transporte de carga, regiões de circulação
    - _Requirements: 4.1_
  - [x] 8.2 Upload e listagem de anexos (bucket `qar-attachments`)
    - _Requirements: 4.3_

  Formulário inteiro dentro de um `<fieldset disabled={!canManage}>` em vez de espalhar `disabled`/gate em cada campo individualmente — mais simples e cobre os `<select>`/`<button>` nativos automaticamente por cascata do HTML; só o `DatePicker` (que não expõe prop `disabled`) fica visualmente clicável pro `viewer`, mas sem efeito real porque o próprio submit e o RLS de `quotation_qar` (update/insert só fora de `viewer`) bloqueiam a gravação de qualquer forma. `renewal_insurer_id` (Select do catálogo) e `renewal_insurer_name` (texto livre) coexistem como campos independentes — Requirement 4.2 (vincular `renewed_policy_id` quando a apólice anterior foi emitida na própria plataforma) fica pra spec `policies`, como já registrado no design.md.

  Verificado com `seller` e `viewer` reais pelo navegador via Playwright (script efêmero em `e2e/`, rodado e apagado depois): `seller` preenche o QAR inteiro (texto, número, switches, regiões separadas por vírgula), salva, dá reload na página e os valores voltam pré-preenchidos exatamente como salvos; anexa um arquivo real, baixa (URL assinada abre numa aba nova apontando pro bucket `qar-attachments`) e remove com sucesso; `viewer` abre a mesma cotação, vê o anexo e os valores do QAR mas os campos aparecem desabilitados e os botões "Salvar QAR"/"Anexar arquivo" nem aparecem. Nenhum erro de console. `npx tsc --noEmit` e `npx eslint` limpos.

- [x] 9. Aba Seguradoras
  - [x] 9.1 Convidar seguradora — seletor a partir do catálogo habilitado pra corretora (exclui as desabilitadas via `brokerage_disabled_insurers`)
    - _Requirements: 5.1, 5.2_
  - [x] 9.2 Editar retorno de uma seguradora (status, prêmio, franquia, comissão, parcelas, número da proposta, coberturas aprovadas, notas) — `seller` só visualiza
    - _Requirements: 5.3, 5.4_
  - [x] 9.3 Marcar seguradora vencedora — só entre as `accepted`; desmarca a anterior automaticamente
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 9.4 Comentários e linha do tempo de eventos por seguradora — `seller`/`viewer` em modo leitura
    - _Requirements: 8.1, 8.2, 8.3_

  Requirement 8.2 (evento `system` automático quando um campo relevante do retorno muda) não tinha nenhum trigger de banco prevendo isso — implementado no frontend, em `update-quotation-insurer.ts`: a função lê a linha atual antes do update, faz o update, e insere um evento `system` por campo que mudou (`response_status`, `premium_amount`, `deductible_amount`, `commission_rate`, `installments_count`, `insurer_quotation_number`, `approved_coverages`, `analyst_notes`), com `field_changed`/`old_value`/`new_value`. Não é atômico (duas idas ao banco), mas segue o mesmo padrão sequencial já usado no resto do projeto (sem RPC/transação). `responded_at` passou a ser calculado automaticamente (não é mais campo do formulário) — só atualiza quando `response_status` muda de fato.

  Dois problemas reais achados na verificação (não bugs de teste):
  1. **RLS de `insurers`** (spec `insurers`, migration `20260811133002`) restringia leitura a `platform_admin`/`brokerage_admin` — fazia sentido antes de existir a aba Seguradoras da cotação, mas agora qualquer perfil com acesso à cotação (`seller`, `analyst`, `supervisor`, `viewer`) precisa ler o nome da seguradora no embed de `quotation_insurers`, e quem convida precisa do catálogo inteiro. Corrigido com a migration `20260819100018_extend_insurers_select_to_all_authenticated.sql`, abrindo o SELECT pra qualquer usuário autenticado (`insurers` não tem `brokerage_id` — catálogo global sem dado sensível de outra corretora; só a escrita continua exclusiva de `platform_admin`). Mesma categoria do gap de RLS de `vehicles` achado na Task 7.
  2. **Estado obsoleto no drawer**: `QuotationInsurersTab` guardava o objeto `QuotationInsurerWithInsurer` inteiro num `useState` no momento do clique na linha. Depois de salvar um retorno que muda `response_status` pra `accepted`, o botão "Marcar como vencedora" não aparecia porque o drawer continuava lendo o snapshot antigo (`pending`) em vez do dado já atualizado pela invalidação da query. Corrigido guardando só o `id` selecionado e derivando o objeto atual via `.find()` na lista já reativa (`quotationInsurers`), então qualquer refetch reflete no drawer aberto sem precisar fechar/reabrir.

  Verificado com `seller`, `analyst` e `viewer` reais pelo navegador via Playwright (script efêmero em `e2e/`, rodado e apagado depois): `seller` não vê o seletor de convidar nem o botão "Salvar retorno"/caixa de comentário; `analyst` convida uma seguradora, edita o retorno (status → `Aceita`, prêmio), salva e vê os dois eventos `system` gerados automaticamente na linha do tempo sem reabrir o drawer; comenta e vê o comentário atribuído ao próprio nome; marca como vencedora sem precisar fechar/reabrir o drawer (fix do bug acima) e o badge "Vencedora" aparece tanto no cabeçalho do drawer quanto na linha da tabela; `viewer` abre a mesma cotação, vê a seguradora, o retorno e a linha do tempo completa (incluindo os eventos `system` e o comentário), mas com os campos desabilitados e sem nenhum botão de escrita. Nenhum erro de console. `npx tsc --noEmit`, `npx eslint` e a suíte de testes inteira (37 arquivos/77 testes) sem erros — nada quebrou nas specs anteriores.

- [x] 10. Fluxo de status da cotação
  - [x] 10.1 Componente de ações de transição — mostra só os botões válidos pro status atual e pro role do usuário logado (espelha o trigger `enforce_quotation_status_transition`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  - [x] 10.2 Diálogo de "Não fechada" exigindo `lost_reason` antes de confirmar
    - _Requirements: 6.8, 6.9_

  `get-available-status-actions.ts` espelha em TypeScript puro (sem acesso a banco) exatamente o `CASE OLD.status WHEN ...` do trigger — só decide quais botões mostrar; quem garante de verdade continua sendo o trigger (se o frontend e o trigger algum dia divergirem, o banco rejeita e o erro aparece via toast, como no caso de "apresentar sem vencedora" abaixo). Os botões ficam no cabeçalho da tela de detalhe, ao lado do "Editar", visíveis em todas as abas.

  Dois problemas reais achados na verificação (não bugs de teste):
  1. **Toaster sobrepondo os botões de ação**: o `<Toaster position="top-right">` (global, `app-providers.tsx`) ocupa exatamente o mesmo canto onde ficam os botões de transição de status — depois de um toast de sucesso, o toast seguinte ficava por cima do próximo botão que o usuário precisava clicar (confirmado tentando clicar duas vezes em sequência: o clique caía no toast, não no botão, e nada acontecia). Corrigido trocando a posição global do Toaster pra `bottom-right` — resolve o problema pra qualquer tela com botões no canto superior direito, não só essa.
  2. **Erro de validação do diálogo "Não fechada" invisível**: `NotClosedDialog` validava `lost_reason` com zod (`min(1)`) mas nunca exibia `formState.errors.lost_reason` na tela — clicar em "Confirmar" com o campo vazio simplesmente não fazia nada visível, sem nenhum feedback pro usuário. Corrigido adicionando a mensagem de erro abaixo do campo.

  Verificado com `seller`, `analyst` e `supervisor` reais pelo navegador via Playwright (script efêmero em `e2e/`, rodado e apagado depois): fluxo completo `waiting → in_progress → in_negotiation` (analyst); tentativa de `in_negotiation → presented` sem vencedora marcada rejeitada pelo trigger com a mensagem exata exibida em toast; convida seguradora, marca retorno aceito e vencedora, aí sim `presented` funciona; `analyst` perde a ação em `presented` (só `seller` dono ou gestão); `seller` avança `presented → waiting_effect → client_accepted`; `seller` perde a ação em `client_accepted` (só `supervisor`/`brokerage_admin`/`platform_admin`); `supervisor` vê "Efetivar" e "Não fechada"; tenta confirmar "Não fechada" sem motivo (erro de validação aparece, confirmado o fix acima), preenche o motivo, confirma — cotação vai pra `not_closed` com `lost_reason` salvo; nenhum botão de ação aparece mais pra ninguém (estado terminal). Nenhum erro de console. `npx tsc --noEmit`, `npx eslint` e a suíte de testes inteira (37 arquivos/77 testes) sem erros.

- [ ] 11. PDF de proposta
  - [ ] 11.1 Instalar `@react-pdf/renderer`; criar o template do documento (dados do cliente, veículos com cobertura resumida, proposta vencedora)
    - _Requirements: 9.1_
  - [ ] 11.2 Botão "Baixar PDF" (sempre disponível com vencedora marcada) e "Compartilhar" condicional a `navigator.canShare({ files })`
    - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Testes
  - [ ] 12.1 Testes de componente: `create-quotation-drawer`, `edit-quotation-drawer`, componente de ações de transição de status, aba Seguradoras (convidar, retorno, marcar vencedora)
    - _Requirements: 1.1, 5.1, 5.3, 6.1, 7.1_
  - [ ] 12.2 Testes de hook: `useCreateQuotation`, `useAdvanceQuotationStatus`, `useSetWinningInsurer`
    - _Requirements: 1.1, 6.1, 7.1_
  - [ ] 12.3 Teste E2E: fluxo completo — `seller` cria → `analyst` assume, convida seguradora, registra retorno `accepted`, marca vencedora, apresenta → `seller` avança `waiting_effect` → `client_accepted` → `supervisor` efetiva (`effected`); confirma que `seller`/`analyst` são bloqueados na transição final
    - _Requirements: 6.1-6.11, 7.1-7.3_
  - [ ] 12.4 Teste E2E: isolamento — `seller` sem vínculo com o cliente não vê a cotação; `seller` não convida seguradora nem edita retorno
    - _Requirements: 2.2, 5.4_
