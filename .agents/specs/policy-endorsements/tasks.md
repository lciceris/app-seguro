# Implementation Plan

- [x] 1. Schema e RLS base
  - [x] 1.1 Migration: enums `policy_endorsement_type`, `policy_endorsement_status`
    - _Requirements: infra_
  - [x] 1.2 Migration: `ALTER TYPE policy_status ADD VALUE 'superseded'`
    - _Requirements: infra_
  - [x] 1.3 Migration: `ALTER TABLE policies` — `previous_version_id`, `root_policy_id`
    - _Requirements: 4.2_
  - [x] 1.4 Migration: tabela `policy_vehicles` (mesmos ~19 campos de `quotation_vehicles`, `on delete restrict` em `vehicle_id`)
    - _Requirements: 12.1_
  - [x] 1.5 Migration: `CREATE OR REPLACE` em `create_policy_from_effected_quotation` (spec `policies`) — copia `quotation_vehicles` → `policy_vehicles` na primeira versão
    - _Requirements: 12.1_
  - [x] 1.6 Migration: tabela `policy_endorsements` (tipo, status, campos por tipo, negociação, resposta do cliente, efetivação)
    - _Requirements: 1.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_
  - [x] 1.7 Migration: trigger `validate_policy_endorsement_fields` (`BEFORE INSERT`) — campos obrigatórios por tipo, veículo do cliente certo, veículo já coberto, apólice-alvo vigente
    - _Requirements: 1.2, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_
  - [x] 1.8 Migration: trigger `enforce_policy_endorsement_status_transition` (`BEFORE UPDATE OF status`) — máquina de estados completa por role
    - _Requirements: 1.1, 2.1, 2.2, 3.1, 3.2, 4.1, 4.4, 4.5_
  - [x] 1.9 Migration: trigger `apply_policy_endorsement_effect` (`AFTER UPDATE OF status`) — nova versão + `policy_vehicles` + `superseded`, ou `cancelled` direto
    - _Requirements: 4.2, 4.3, 5.2, 6.2, 7.2, 8.2, 9.2, 10.2, 10.3_
  - [x] 1.10 Migration: RLS de `policy_vehicles` (select amplo via `is_my_policy_client`, sem insert/update/delete pra usuário)
    - _Requirements: 12.1_
  - [x] 1.11 Migration: RLS de `policy_endorsements` (select amplo; insert por `seller` dono ou gestão; update por `analyst`/gestão/`seller` dono — o trigger valida qual transição cada um pode fazer; sem delete)
    - _Requirements: 1.3, 2.1, 3.1, 4.4_

- [x] 2. Camada de dados do frontend
  - [x] 2.1 Criar `features/policy-endorsements/types/` + `constants/query-keys.ts` + `constants/labels.ts` (tipo e status do endosso, em português)
    - _Requirements: infra_
  - [x] 2.2 Criar `features/policy-endorsements/api/` — `list-policy-vehicles` (veículos de uma versão)
    - _Requirements: 12.1_
  - [x] 2.3 Criar `features/policy-endorsements/api/` — `list-policy-endorsements-by-chain` (toda a cadeia via `root_policy_id`), `get-policy-endorsement`, `create-policy-endorsement`, `advance-policy-endorsement-status`
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 12.2, 12.5_
  - [x] 2.4 Criar `features/policy-endorsements/hooks/` correspondentes
    - _Requirements: 1.1, 12.1, 12.2_

- [x] 3. Aba Veículos no detalhe da apólice
  - [x] 3.1 Adicionar seção/aba "Veículos" no `policy-detail-drawer` (spec `policies`) — lista `policy_vehicles` da versão sendo vista, view-only, resumo de cobertura por veículo
    - _Requirements: 12.1_

- [x] 4. Seção de endossos no detalhe da apólice
  - [x] 4.1 Adicionar seção "Endossos" no `policy-detail-drawer` — lista os da cadeia inteira (`root_policy_id`), badge de status, link pro detalhe de cada um
    - _Requirements: 12.2, 12.5_
  - [x] 4.2 Indicação "essa não é a versão mais recente" + link pra versão atual, quando aplicável
    - _Requirements: 12.3_
  - [x] 4.3 Botão "Abrir endosso" na seção — visível só quando a versão vista é `active` e o usuário tem permissão
    - _Requirements: 1.2, 1.3_

- [x] 5. Criar endosso
  - [x] 5.1 Criar `features/policy-endorsements/validations/create-policy-endorsement-schema.ts` — schema condicional por tipo (zod discriminated union ou validação manual por tipo selecionado)
    - _Requirements: 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_
  - [x] 5.2 Criar `features/policy-endorsements/components/create-policy-endorsement-drawer/` — Select de tipo + campos condicionais (veículo do cliente pra inclusão, veículo já coberto pra exclusão/cobertura, data pra prorrogação, campos genéricos pra correção, motivo pra correção/cancelamento)
    - _Requirements: 1.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_
  - [x] 5.3 Criar `pages/policies/[policyId]/endorsements/add/` como rota filha `/policies/:policyId/endorsements/add`
    - _Requirements: 1.1_

- [x] 6. Detalhe e ações de status do endosso
  - [x] 6.1 Criar `features/policy-endorsements/components/policy-endorsement-detail-drawer/` — dados preenchidos, ações de transição visíveis conforme status atual e role (registrar retorno da seguradora, registrar resposta do cliente, efetivar, não fechado com motivo)
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.4, 4.5_
  - [x] 6.2 Criar `pages/policies/[policyId]/endorsements/[endorsementId]/` como rota filha `/policies/:policyId/endorsements/:endorsementId`
    - _Requirements: 2.1, 3.1, 4.1_

- [ ] 7. PDF do endosso
  - [ ] 7.1 Criar `PolicyEndorsementDocument` (`@react-pdf/renderer`) — número da apólice, tipo, data de efetivação, motivo, ajuste de prêmio, resumo antes/depois
    - _Requirements: 11.1_
  - [ ] 7.2 Botão "Baixar PDF" no detalhe do endosso, visível só quando `status = 'effected'`
    - _Requirements: 11.2, 11.3_

- [ ] 8. Testes
  - [ ] 8.1 Testes de componente: `create-policy-endorsement-drawer`, `policy-endorsement-detail-drawer`
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  - [ ] 8.2 Testes de hook: `useCreatePolicyEndorsement`, `useAdvancePolicyEndorsementStatus`
    - _Requirements: 1.1, 4.1_
  - [ ] 8.3 Teste E2E: fluxo completo de inclusão de veículo — `seller` abre → `analyst` registra retorno da seguradora → `seller` registra aceite do cliente → `supervisor` efetiva → nova versão criada com o veículo incluído, `policy_number` inalterado, versão anterior `superseded`
    - _Requirements: 1.1–1.2, 2.1, 3.1, 4.1–4.2, 5.1–5.2_
  - [ ] 8.4 Teste E2E: cancelamento — fluxo completo até `effected`, versão vigente vira `cancelled` sem nova linha, nenhum novo endosso pode ser aberto nela
    - _Requirements: 10.1–10.3_
  - [ ] 8.5 Teste E2E: isolamento e permissões — `seller` sem vínculo não vê o endosso; `analyst` não abre endosso nem efetiva; `seller` não efetiva
    - _Requirements: 1.3, 4.4_
