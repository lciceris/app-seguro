# Implementation Plan

- [ ] 1. Schema e RLS base
  - [ ] 1.1 Migration: enums `quotation_status`, `quotation_type`, `insurer_response_status`, `quotation_event_type`, `coverage_type`, `franchise_type`, `glass_coverage_level`
    - _Requirements: infra_
  - [ ] 1.2 Migration: `quotation_number_counters` + trigger `generate_quotation_number` (numeração sequencial atômica por corretora/ano)
    - _Requirements: 1.1_
  - [ ] 1.3 Migration: tabela `quotations` (`brokerage_id`, `client_id`, `seller_id`, `analyst_id`, `number`, `status` default `waiting`, `quotation_type`, datas/coberturas/prazo, `seller_notes`, `lost_reason`; trigger `set_updated_at`)
    - _Requirements: 1.1_
  - [ ] 1.4 Migration: tabela `quotation_vehicles` (PK composta `vehicle_id`/`quotation_id`, ~19 campos de cobertura por veículo)
    - _Requirements: 3.1_
  - [ ] 1.5 Migration: tabela `quotation_insurers` (`is_winner` em vez de `winning_insurer_id`; `installments_count` novo; `UNIQUE(quotation_id, insurer_id)`; `CHECK (NOT is_winner OR response_status = 'accepted')`)
    - _Requirements: 5.1, 5.2, 7.2_
  - [ ] 1.6 Migration: tabela `quotation_qar` (1:1 com `quotations`, sem `renewed_policy_id` ainda — ver design.md)
    - _Requirements: 4.1_
  - [ ] 1.7 Migration: tabela `quotation_qar_attachments`
    - _Requirements: 4.3_
  - [ ] 1.8 Migration: tabela `quotation_insurer_events` (`event_type` como enum)
    - _Requirements: 8.1, 8.2_
  - [ ] 1.9 Migration: funções `SECURITY DEFINER` — `get_quotation_brokerage_id(uuid)`, `is_my_quotation(uuid)`, `is_my_quotation_insurer(uuid)`
    - _Requirements: infra_
  - [ ] 1.10 Migration: RLS de `quotations` (select/insert/update, sem delete)
    - _Requirements: 1.3, 2.1, 2.2_
  - [ ] 1.11 Migration: RLS de `quotation_vehicles`, `quotation_qar`, `quotation_qar_attachments` (mesma condição de visibilidade da cotação pai)
    - _Requirements: 3.1, 4.1, 4.3_
  - [ ] 1.12 Migration: RLS de `quotation_insurers` (insert/update só `analyst`/`supervisor`/`brokerage_admin`/`platform_admin`) e `quotation_insurer_events` (idem pro insert)
    - _Requirements: 5.4, 8.1_
  - [ ] 1.13 Migration: trigger `enforce_single_quotation_winner` em `quotation_insurers` (mesmo padrão de `enforce_single_primary_seller`)
    - _Requirements: 7.1_
  - [ ] 1.14 Migration: trigger `enforce_quotation_status_transition` em `quotations` (valida toda a máquina de estados do Requirement 6 — sequência, role por transição, `analyst_id` automático, exigência de vencedora antes de `presented`, exigência de `lost_reason` antes de `not_closed`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11_
  - [ ] 1.15 Migration: trigger de validação em `quotation_vehicles` — veículo precisa ser do mesmo `client_id` da cotação; bloqueia INSERT/DELETE fora de `waiting`/`in_progress` (UPDATE de cobertura continua livre)
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ] 1.16 Migration: bucket `qar-attachments` (privado) + policies de `storage.objects` (path `{brokerage_id}/{quotation_id}/{filename}`, mesma regra de visibilidade da cotação)
    - _Requirements: 4.3_

  Verificar com usuários/corretoras de teste reais (script efêmero, limpo depois): numeração sequencial sem colisão em inserções concorrentes; `seller` só enxerga as próprias cotações; toda a máquina de transições (cada perfil só avança o que pode, na ordem certa); vencedora exige `response_status = 'accepted'` e só uma por cotação; veículo de cliente errado é rejeitado; lista de veículos trava a partir de `in_negotiation`; upload/leitura de anexo do QAR respeita a mesma visibilidade da cotação.

- [ ] 2. Camada de dados do frontend
  - [ ] 2.1 Criar `features/quotations/types/` + `constants/query-keys.ts` + `constants/labels.ts` (status, tipo, resposta de seguradora, tipo de cobertura/franquia/vidros)
    - _Requirements: infra_
  - [ ] 2.2 Criar `features/quotations/api/` pra `quotations` — list, get, create, update (campos gerais), advance-status
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 6.1_
  - [ ] 2.3 Criar `features/quotations/api/` pra `quotation_vehicles` — list, add, update, remove
    - _Requirements: 3.1_
  - [ ] 2.4 Criar `features/quotations/api/` pra `quotation_qar` (get/upsert) e `quotation_qar_attachments` (list/upload/delete)
    - _Requirements: 4.1, 4.3_
  - [ ] 2.5 Criar `features/quotations/api/` pra `quotation_insurers` (list/invite/update/set-winner) e `quotation_insurer_events` (list/comment)
    - _Requirements: 5.1, 5.3, 7.1, 8.1_
  - [ ] 2.6 Criar `features/quotations/hooks/` correspondentes — cada mutation invalida a query certa
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.3, 5.1, 5.3, 6.1, 7.1, 8.1_

- [ ] 3. Listagem de cotações
  - [ ] 3.1 Criar `features/quotations/screens/quotations-list-screen/` — número, cliente, vendedor, status (badge), prazo; busca por número/cliente; filtro por status
    - _Requirements: 2.1, 2.2_
  - [ ] 3.2 Criar `pages/quotations/quotations-page.tsx` e registrar a rota `/quotations` (restrita a `platform_admin`, `brokerage_admin`, `supervisor`, `analyst`, `seller`, `viewer`)
    - _Requirements: 2.1, 2.2_

- [ ] 4. Criar cotação
  - [ ] 4.1 Criar `features/quotations/validations/create-quotation-schema.ts`
    - _Requirements: 1.1_
  - [ ] 4.2 Criar `features/quotations/components/create-quotation-drawer/` — seletor de cliente escopado por role (mesmo padrão de `vehicles`)
    - _Requirements: 1.1, 1.2_
  - [ ] 4.3 Criar `pages/quotations/add/add-quotation-page.tsx` como rota filha `/quotations/add`
    - _Requirements: 1.1_

- [ ] 5. Página de detalhe da cotação (estrutura de abas + Visão geral)
  - [ ] 5.1 Criar `features/quotations/screens/quotation-detail-screen/` — página cheia (não drawer) com abas: Visão geral, Veículos, QAR, Seguradoras
    - _Requirements: 2.3_
  - [ ] 5.2 Criar `pages/quotations/[quotationId]/quotation-detail-page.tsx` e registrar a rota `/quotations/:quotationId`
    - _Requirements: 2.3_
  - [ ] 5.3 Conteúdo da aba Visão geral — dados gerais da cotação, número, vendedor, calculista, prazo
    - _Requirements: 2.3_

- [ ] 6. Editar cotação
  - [ ] 6.1 Criar `features/quotations/validations/edit-quotation-schema.ts`
    - _Requirements: infra_
  - [ ] 6.2 Criar `features/quotations/components/edit-quotation-drawer/` — campos gerais (datas, coberturas desejadas, franquia preferida, prazo, observações)
    - _Requirements: infra_
  - [ ] 6.3 Criar `pages/quotations/[quotationId]/edit/edit-quotation-page.tsx` como rota filha `/quotations/:quotationId/edit`
    - _Requirements: infra_

- [ ] 7. Aba Veículos
  - [ ] 7.1 Seletor de veículos do cliente da cotação (reaproveita `useVehicles()` filtrado pelo `client_id`) + formulário de cobertura por veículo
    - _Requirements: 3.1_
  - [ ] 7.2 UI reflete o travamento de adicionar/remover a partir de `in_negotiation` (Requirement 3.3) — campos de cobertura continuam editáveis
    - _Requirements: 3.2, 3.3_

- [ ] 8. Aba QAR
  - [ ] 8.1 Formulário do QAR (upsert 1:1) — tipo, dados de renovação (texto livre por enquanto), sinistralidade, prêmios, flags de risco, transporte de carga, regiões de circulação
    - _Requirements: 4.1_
  - [ ] 8.2 Upload e listagem de anexos (bucket `qar-attachments`)
    - _Requirements: 4.3_

- [ ] 9. Aba Seguradoras
  - [ ] 9.1 Convidar seguradora — seletor a partir do catálogo habilitado pra corretora (exclui as desabilitadas via `brokerage_disabled_insurers`)
    - _Requirements: 5.1, 5.2_
  - [ ] 9.2 Editar retorno de uma seguradora (status, prêmio, franquia, comissão, parcelas, número da proposta, coberturas aprovadas, notas) — `seller` só visualiza
    - _Requirements: 5.3, 5.4_
  - [ ] 9.3 Marcar seguradora vencedora — só entre as `accepted`; desmarca a anterior automaticamente
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ] 9.4 Comentários e linha do tempo de eventos por seguradora — `seller`/`viewer` em modo leitura
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10. Fluxo de status da cotação
  - [ ] 10.1 Componente de ações de transição — mostra só os botões válidos pro status atual e pro role do usuário logado (espelha o trigger `enforce_quotation_status_transition`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  - [ ] 10.2 Diálogo de "Não fechada" exigindo `lost_reason` antes de confirmar
    - _Requirements: 6.8, 6.9_

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
