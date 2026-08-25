# Tasks — list-screens-density

- [x] 1. Contador de itens no cabeçalho (sweep mecânico, sem mudança de dado)
  - [x] 1.1 `clients-list-screen.tsx` (usa `filteredClients` já existente)
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.2 `vehicles-list-screen.tsx` (usa lista filtrada já existente)
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.3 `quotations-list-screen.tsx` (usa lista filtrada já existente)
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.4 `insurers-list-screen.tsx` (sem filtro ainda nesta task — total bruto; ganha filtro na Task 2)
    - _Requirements: 1.1, 1.3_
  - [x] 1.5 `policies-list-screen.tsx` (usa `filteredPolicies` já existente, considera busca + filtro de status)
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 1.6 `users-list-screen.tsx` (sem filtro ainda nesta task — total bruto; ganha filtro na Task 2)
    - _Requirements: 1.1, 1.3_
  - [x] 1.7 `brokerages-list-screen.tsx` (sem filtro ainda nesta task — total bruto; ganha filtro na Task 2)
    - _Requirements: 1.1, 1.3_

- [ ] 2. Busca nas telas que não têm hoje
  - [ ] 2.1 `insurers-list-screen.tsx`: `Input` + `useMemo` filtrando por nome/CNPJ; `TableEmptyState` ganha mensagem de busca vazia; contador da Task 1.4 passa a considerar a lista filtrada
    - _Requirements: 2.1, 2.2, 2.3, 1.2_
  - [ ] 2.2 `users-list-screen.tsx`: idem, filtrando por nome/e-mail; contador da Task 1.6 passa a considerar a lista filtrada
    - _Requirements: 2.1, 2.2, 2.3, 1.2_
  - [ ] 2.3 `brokerages-list-screen.tsx`: idem, filtrando por nome/CNPJ; contador da Task 1.7 passa a considerar a lista filtrada
    - _Requirements: 2.1, 2.2, 2.3, 1.2_

- [ ] 3. Colunas novas com dado já buscado
  - [ ] 3.1 `brokerages-list-screen.tsx`: colunas CNPJ (`font-mono-data`, `formatCnpj`) e "Criada em" (`font-mono-data`); ajustar `cells`/`colSpan` de 4 pra 6
    - _Requirements: 3.1, 3.4, 3.5_
  - [ ] 3.2 `insurers-list-screen.tsx`: coluna "Contato" (`contact_name ?? phone ?? email ?? "—"`); ajustar `cells`/`colSpan` de 3 pra 4
    - _Requirements: 3.2, 3.4_
  - [ ] 3.3 `policies-list-screen.tsx`: sub-linha com número da cotação de origem (`policy.quotations?.number`) na coluna "Número", sem coluna nova
    - _Requirements: 3.3, 3.4_

- [ ] 4. Documentação viva
  - [ ] 4.1 Adicionar seção "Listagens — contador e busca" em `docs/dev/ui-guidelines.md` com o padrão e snippet
    - _Requirements: 4.1_

- [ ] 5. Verificação final
  - [ ] 5.1 Conferir/ajustar testes de componente existentes das 7 telas que dependem de `colSpan`/contagem de células (Tasks 3.1-3.2 mudam `colSpan`); rodar `tsc`/`eslint`/`vitest` completos
    - _Requirements: infra_
  - [ ] 5.2 Screenshot real (Playwright, script efêmero) de Corretoras (listagem) comparando com o protótipo `app-seguro Denso` aprovado — confere contador, busca e as 2 colunas novas
    - _Requirements: infra_
