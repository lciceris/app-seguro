# Tasks — client-detail-hub

- [x] 1. Corrige bug real no primitivo `Tabs`/`Separator` (variantes `data-horizontal`/`data-vertical` nunca registradas)
  - _Requirements: —_

- [x] 2. Novos hooks "por cliente" (evitando import circular)
  - [x] 2.1 `vehicles`: `list-vehicles-by-client` + `use-vehicles-by-client`
    - _Requirements: 2.2_
  - [x] 2.2 `quotations`: `list-quotations-by-client` + `use-quotations-by-client`
    - _Requirements: 2.3_
  - [x] 2.3 `policies`: `list-policies-by-client-detailed` + `use-policies-by-client-detailed`
    - _Requirements: 2.3_

- [x] 3. Header estilo perfil no `client-detail-drawer.tsx`
  - [x] 3.1 Avatar + nome + badge PJ/PF + documento mascarado + tag do vendedor principal
    - _Requirements: 1.1_
  - [x] 3.2 Botões "Vendedores" (troca aba) e "Editar" (Link, gated por role)
    - _Requirements: 1.2, 1.3_

- [x] 4. Abas
  - [x] 4.1 Dados (conteúdo existente movido pra dentro da aba)
    - _Requirements: 2.1_
  - [x] 4.2 Veículos (tabela + "Adicionar veículo")
    - _Requirements: 2.2_
  - [x] 4.3 Histórico (Cotações + Apólices)
    - _Requirements: 2.3_
  - [x] 4.4 Documentos (placeholder "Em breve")
    - _Requirements: 2.4_
  - [x] 4.5 Vendedores (`ClientSellersSection` movida da pilha pra aba própria)
    - _Requirements: 2.1_

- [x] 5. Pré-seleção de cliente em criar veículo/cotação
  - [x] 5.1 `create-vehicle-drawer.tsx`/`create-quotation-drawer.tsx` leem `client_id` da query string
    - _Requirements: 3.1_

- [x] 6. Testes e verificação
  - [x] 6.1 `client-detail-drawer.test.tsx` ajustado pra Tabs (userEvent + escopo por tabpanel) — 6/6
    - _Requirements: —_
  - [x] 6.2 `tsc`/`eslint`/`vitest run` completos (137/137)
    - _Requirements: —_
  - [x] 6.3 Verificação visual via Playwright com cliente/veículo/cotação/apólice reais: header, todas as 5 abas, botão Vendedores do header, pré-seleção de cliente ao abrir "Adicionar veículo"
    - _Requirements: —_

## Addendum — ajustes de feedback

- [x] 7. Tabelas embutidas (Veículos/Cotações/Apólices) alinhadas ao padrão de lista (`rounded-2xl`, `p-5`/`mb-4`, sem padding duplicado)
  - _Requirements: —_
- [x] 8. "Editar" (cliente) e os fluxos abertos a partir do hub ("Adicionar veículo"/"Nova cotação") retornam pro hub do cliente ao fechar/salvar, via `return_to` na query string
  - _Requirements: —_
- [x] 9. `TabsList` trocado pra `variant="line"` (sublinhado, sem fundo preenchido)
  - _Requirements: —_
- [x] 10. Verificação visual via Playwright: novo estilo de tabs, grid das tabelas, e navegação de volta ao hub confirmada por URL após editar/salvar e após cancelar "Adicionar veículo"
  - _Requirements: —_

## Addendum 2 — grid em 2 colunas + escolha final do estilo de tabs

- [x] 11. Aba Dados: cards de Identificacao/Endereco/Contatos em grid de 2 colunas (igual brokerage-detail-drawer)
  - _Requirements: --_
- [x] 12. Apresentadas 6 opcoes de estilo de tabs via artifact interativo; usuario escolheu "sublinhado com base cheia" (opcao 5)
  - _Requirements: --_
- [x] 13. variant="line" do Tabs compartilhado reescrito pra essa opcao: TabsList ganha border-b full-width, TabsTrigger vira flex-none (nao estica mais igual), indicador da aba ativa passa de bg-foreground/bottom[-5px] pra bg-primary/bottom[-1px] + font-semibold. Unico consumidor de variant="line" e client-detail-drawer -- quotation-detail-screen continua na variante default (pill), nao afetado.
  - _Requirements: --_
- [x] 14. tsc/eslint/vitest run (137/137) + verificacao visual via Playwright (Dados e Historico ativos)
  - _Requirements: --_
