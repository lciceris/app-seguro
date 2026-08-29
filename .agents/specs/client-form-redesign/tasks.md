# Tasks — client-form-redesign

- [x] 1. Máscara de CPF
  - [x] 1.1 `formatCpf` em `src/shared/lib/masks.ts`
    - _Requirements: 3.2_

- [x] 2. Status de cliente (migration + backfill)
  - [x] 2.1 Migration `client_status` enum + coluna `status` + backfill a partir de `segment`
    - _Requirements: 6.1_
  - [x] 2.2 `deactivate-client.ts`/`reactivate-client.ts` passam a usar `status`
    - _Requirements: 6.2, 6.3_
  - [x] 2.3 `supabase gen types typescript --linked`
    - _Requirements: —_

- [x] 3. Toggle PF/PJ + reordenação + busca CNPJ/CEP + máscaras (create-client-drawer)
  - [x] 3.1 Toggle de dois botões substitui o Select de `client_type`
    - _Requirements: 1.1, 1.2_
  - [x] 3.2 CPF/CNPJ primeiro campo, com máscara dinâmica e botão Buscar (PJ)
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_
  - [x] 3.3 Botão Buscar CEP + máscara no `zip_code`
    - _Requirements: 4.1, 4.2_
  - [x] 3.4 Asteriscos nos labels obrigatórios
    - _Requirements: 5.1_
  - [x] 3.5 Remove seção Configurações (segmento/origem do lead) do formulário e do schema
    - _Requirements: 6.5_

- [x] 4. Mesmo tratamento em edit-client-drawer
  - [x] 4.1 Espelha 3.1–3.5 no formulário de edição
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2, 5.1, 6.5_

- [x] 5. Detalhe e listagem
  - [x] 5.1 `constants/labels.ts`: remove SEGMENT_*, adiciona STATUS_LABELS/STATUS_BADGE_CLASSES
    - _Requirements: 6.4, 6.5_
  - [x] 5.2 `client-detail-drawer.tsx`: remove card Configurações
    - _Requirements: 6.5_
  - [x] 5.3 `clients-list-screen.tsx`: coluna Status (Badge) + toggle usa `status`
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 6. Limpeza final no banco
  - [x] 6.1 Migration drop `segment`/`lead_source`/`client_segment` (só depois do código não referenciar mais)
    - _Requirements: 6.5_
  - [x] 6.2 `supabase gen types typescript --linked` final
    - _Requirements: —_

- [x] 7. Testes e verificação
  - [x] 7.1 Atualiza mocks em `use-create-client.test.tsx`, `use-update-client.test.tsx`, `edit-client-drawer.test.tsx`, `client-detail-drawer.test.tsx`, e labels em `create-client-drawer.test.tsx`
    - _Requirements: —_
  - [x] 7.2 `tsc` / `eslint` / `vitest run` — 137/137 testes passando, 0 erros
    - _Requirements: —_
  - [x] 7.3 Verificação visual via Playwright: toggle PF/PJ troca campos corretamente (confirmado via `data-variant`, não só screenshot — a 1ª captura pegou a transição CSS a meio caminho, falso alarme investigado à parte), busca CNPJ real (BrasilAPI) preencheu razão social/nome fantasia/CNAE/endereço, busca CEP real (ViaCEP) preencheu logradouro/bairro, máscaras de CPF/CNPJ/CEP corretas, asteriscos nos labels obrigatórios, listagem mostra coluna Status com badge "Ativo" após criar cliente
    - _Requirements: —_
