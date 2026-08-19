# Implementation Plan

- [ ] 1. Schema e RLS base
  - [ ] 1.1 Migration: enum `policy_status` (`active`, `cancelled`, `renewed`)
    - _Requirements: infra_
  - [ ] 1.2 Migration: tabela `policies` (`brokerage_id`, `client_id`, `insurer_id`, `quotation_id` not null unique, `renewed_from_policy_id`, `policy_number`, `premium_amount`, `total_fleet_value`, `coverage_start/end`, `status` default `active`; trigger `set_updated_at`)
    - _Requirements: 1.1_
  - [ ] 1.3 Migration: tabela `policy_attachments`
    - _Requirements: 3.1_
  - [ ] 1.4 Migration: `ALTER TABLE quotation_qar ADD COLUMN renewed_policy_id` (fk `policies(id)` on delete set null)
    - _Requirements: 4.1_
  - [ ] 1.5 Migration: trigger `create_policy_from_effected_quotation` (`AFTER UPDATE OF status ON quotations`) — cria a apólice herdando dados da cotação/seguradora vencedora/soma de veículos, e marca a apólice anterior como `renewed` quando há vínculo no QAR
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.2, 4.3_
  - [ ] 1.6 Migration: RLS de `policies` (select por perfil/`is_my_client`; update só `supervisor`/`brokerage_admin`/`platform_admin`; sem insert nem delete)
    - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3_
  - [ ] 1.7 Migration: funções `get_policy_brokerage_id`/`is_my_policy_client` + RLS de `policy_attachments` (select amplo, insert/delete restrito)
    - _Requirements: 3.1, 3.2_
  - [ ] 1.8 Migration: bucket `policy-documents` (privado) + policies de `storage.objects`
    - _Requirements: 3.1_

- [ ] 2. Camada de dados do frontend
  - [ ] 2.1 Criar `features/policies/types/` + `constants/query-keys.ts` + `constants/labels.ts` (status persistido e status derivado) + `lib/get-derived-policy-status.ts`
    - _Requirements: infra, 5.4_
  - [ ] 2.2 Criar `features/policies/api/` — list, get, update (`policy_number`, `coverage_start/end`, `premium_amount`, `total_fleet_value`)
    - _Requirements: 2.1, 5.1, 5.2, 5.3_
  - [ ] 2.3 Criar `features/policies/api/` para `policy_attachments` — list/upload/delete/url assinada (reaproveita o padrão de `qar-attachments`)
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ] 2.4 Criar `features/policies/hooks/` correspondentes
    - _Requirements: 2.1, 3.1, 5.1_

- [ ] 3. Listagem de apólices
  - [ ] 3.1 Criar `features/policies/screens/policies-list-screen/` — número, cliente, seguradora, prêmio, status derivado (badge), vigência; busca por número/cliente; filtro por status derivado
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 3.2 Criar `pages/policies/policies-page.tsx` e registrar a rota `/policies` (sem botão "Nova apólice")
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4. Detalhe da apólice
  - [ ] 4.1 Criar `features/policies/components/policy-detail-drawer/` — dados da apólice, link para a cotação de origem, vínculo de renovação (pra qual renova / se já foi renovada), lista de anexos com upload/remoção inline
    - _Requirements: 3.2, 3.3, 4.2, 5.6_
  - [ ] 4.2 Criar `pages/policies/[policyId]/` e registrar a rota `/policies/:policyId`
    - _Requirements: 5.6_

- [ ] 5. Editar apólice
  - [ ] 5.1 Criar `features/policies/validations/edit-policy-schema.ts`
    - _Requirements: 2.1_
  - [ ] 5.2 Criar `features/policies/components/edit-policy-drawer/` — `policy_number`, `coverage_start/end`, `premium_amount`, `total_fleet_value`; só visível pra `supervisor`/`brokerage_admin`/`platform_admin`
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ] 5.3 Criar `pages/policies/[policyId]/edit/` como rota filha `/policies/:policyId/edit`
    - _Requirements: 2.1, 2.2_

- [ ] 6. Vínculo de renovação no QAR (volta na spec `quotations`)
  - [ ] 6.1 Adicionar campo "Apólice anterior" (Select) no formulário do QAR (`quotation-qar-form`, spec `quotations`) — lista apólices do `client_id` da cotação, visível sempre (não só quando `quotation_type = renewal`, pra não travar quem esqueceu de marcar o tipo)
    - _Requirements: 4.1_
  - [ ] 6.2 `upsert-quotation-qar` (spec `quotations`) passa a aceitar `renewed_policy_id`
    - _Requirements: 4.1_

- [ ] 7. Testes
  - [ ] 7.1 Testes de componente: `policy-detail-drawer`, `edit-policy-drawer`
    - _Requirements: 2.1, 3.1, 5.6_
  - [ ] 7.2 Testes de hook: `useUpdatePolicy`
    - _Requirements: 2.1_
  - [ ] 7.3 Teste E2E: fluxo completo — cotação efetivada gera apólice automaticamente com os dados certos (seguradora vencedora, prêmio, soma de valores de veículo, vigência herdada); `supervisor` completa `policy_number` e anexa o documento
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 3.1_
  - [ ] 7.4 Teste E2E: renovação — QAR vinculado a uma apólice existente; ao efetivar a nova cotação, a apólice antiga vira `renewed` e a nova aponta `renewed_from_policy_id` pra ela
    - _Requirements: 4.1, 4.2, 4.3_
  - [ ] 7.5 Teste E2E: isolamento — `seller` sem vínculo com o cliente não vê a apólice; `seller` não edita nem anexa documento
    - _Requirements: 2.2, 5.2_
