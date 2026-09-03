# Tasks — design-refresh-stitch-inspired

- [x] 1. Sidebar: ícones maiores, mais espaçamento, indicador ativo
  - _Requirements: 1.1, 1.2_
- [x] 2. Tabela compartilhada: cabeçalho e célula com mais respiro
  - _Requirements: 2.1_
- [x] 3. Badge compartilhado: maior e mais forte
  - _Requirements: 3.1_
- [x] 4. Ícone "+" nos botões de criar das 6 listagens
  - _Requirements: 4.1_
- [x] 5. Comparativo de seguradoras em colunas na cotação
  - _Requirements: 5.1, 5.2_
- [x] 6. Hub do cliente vira página cheia (rota + componente)
  - _Requirements: 7.1, 7.2_
- [x] 7. Hub do cliente: coluna lateral (vendedor principal + apólice vigente)
  - _Requirements: 6.1_
- [x] 8. Testes e verificação visual
  - _Requirements: —_

## Addendum 3 -- "Ver" sempre pagina, "Criar/Editar" sempre drawer (regra unica)

Usuario sentiu que misturar pagina e drawer pra "Ver" dependendo da riqueza
da entidade (heuristica anterior) era inconsistente na pratica, mesmo sendo
architecturally justificavel -- o eixo certo e o tipo de acao (ver vs
criar/editar), nao a riqueza do conteudo.

- [x] 9. Veiculo: virou pagina (vehicle-detail-screen), rota /vehicles/:id
  saiu de dentro do Outlet de /vehicles
  - _Requirements: --_
- [x] 10. Apolice: virou pagina (policy-detail-screen), preservando as rotas
  aninhadas de endossos (/policies/:id/endorsements/...)
  - _Requirements: --_
- [x] 11. Seguradora: virou pagina (insurer-detail-screen)
  - _Requirements: --_
- [x] 12. Corretora: virou pagina (brokerage-detail-screen)
  - _Requirements: --_
- [x] 13. Usuario: virou pagina (user-detail-screen)
  - _Requirements: --_
- [x] 14. edit-*-drawer de cada entidade: handleClose incondicional pra
  /entidade/:id (a pagina de detalhe, sempre presente por tras agora)
  - _Requirements: --_
- [x] 15. tsc/eslint/vitest (138/138) + verificacao visual via Playwright em
  todas as 5 paginas + cenario de editar direto da listagem mostrando a
  pagina de detalhe atras (nao mais a lista)
  - _Requirements: --_

## Addendum 4 -- "Resumo em destaque" (opcao C) nas 6 paginas Ver

Usuario reportou que a pagina Ver tinha secoes empilhadas sem cartao
consistente (fundo cinza aparecendo entre uma secao e outra). Avaliamos 5
opcoes de layout num artifact (Claude Artifacts) usando Veiculo como
exemplo, o usuario gostou de duas ("Resumo + abas" e "Folha unica"), pedimos
3 mesclas das duas, e o usuario escolheu a opcao C ("Resumo em destaque" --
folha unica + faixa de resumo com fundo levemente colorido + abas).

Decisao de escopo (via pergunta ao usuario): aplicar nas 6 entidades ja
convertidas pra pagina nesta sessao (Cliente, Veiculo, Apolice, Seguradora,
Corretora, Usuario) -- NAO em Cotacao (pagina mais complexa, com regras de
negocio proprias, fora do escopo). Decisao de interacao: secoes que hoje sao
so cartoes empilhados (Veiculo, Seguradora, Corretora) viram abas de verdade
(uma visivel por vez), nao ficam todas na tela ao mesmo tempo.

- [x] 16. Componente compartilhado `DetailSummaryBand`
  (src/shared/components/ui/detail-summary-band.tsx) -- faixa com
  bg-muted mostrando N campos-chave lado a lado, usado por todas as 6 telas
  - _Requirements: --_
- [x] 17. Veiculo: 4 secoes (Identificacao/Valores/Circulacao/Observacoes)
  viram abas dentro de uma folha unica, com DetailSummaryBand
  (Placa/Marca-Modelo/Valor declarado/Tipo) acima
  - _Requirements: --_
- [x] 18. Seguradora: 4 secoes viram abas (Identificacao/Contato
  comercial/Configuracoes/Observacoes), resumo com CNPJ/E-mail/Telefone/
  Prazo de resposta
  - _Requirements: --_
- [x] 19. Corretora: 4 secoes viram abas (Empresa/Endereco/Representante/
  Plano); "Usuarios ativos" (que era cartao proprio) migrou pro resumo
  junto com CNPJ/Cidade-UF/Plano
  - _Requirements: --_
- [x] 20. Usuario: sem abas (so tinha 1 secao) -- so ganhou
  DetailSummaryBand (E-mail/Telefone/Perfil) acima do card unico existente
  - _Requirements: --_
- [x] 21. Cliente: NAO ganhou abas novas (ja tinha Dados/Veiculos/Historico/
  Documentos/Vendedores) -- as 5 sub-secoes da aba "Dados" (Identificacao/
  Endereco/Contato comercial/Contato financeiro/Observacoes) foram
  mescladas numa folha unica com divisorias internas (border-t) em vez de
  5 cartoes soltos; DetailSummaryBand (Cidade-UF/Contato comercial/E-mail/
  Telefone) adicionado acima das abas de nivel superior, visivel em todas
  elas. Coluna lateral (Vendedor principal/Apolice vigente) mantida como
  cartoes proprios ao lado -- sao widgets legitimos, nao bug de cartao
  faltando.
  - _Requirements: --_
- [x] 22. Apolice: 5 secoes viram abas (Dados gerais/Origem/Veiculos/
  Endossos/Documentos) numa folha unica, com DetailSummaryBand (Cliente/
  Seguradora/Premio/Vigencia) acima. Os 3 componentes de secao com tabela
  propria (PolicyVehiclesSection/PolicyEndorsementsSection/
  PolicyAttachmentsSection) perderam o cartao/borda proprios (agora vivem
  dentro da aba da folha unica), mantendo botoes de acao (Abrir endosso,
  Anexar arquivo) e logica de negocio intactos.
  - _Requirements: --_
- [x] 23. Teste de Apolice atualizado: asserts que dependiam de "Origem"
  estar sempre visivel passaram a clicar na aba antes (userEvent); asserts
  de campos duplicados entre resumo e aba viraram getAllByText
  - _Requirements: --_
- [x] 24. tsc/eslint/vitest (139/139) + verificacao visual via Playwright
  com dados reais nas 6 paginas (Veiculo, Cliente, Apolice, Usuario,
  Seguradora, Corretora)
  - _Requirements: --_
