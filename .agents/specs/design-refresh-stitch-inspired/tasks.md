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
