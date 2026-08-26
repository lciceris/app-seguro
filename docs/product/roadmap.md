# Roadmap

> Próximas evoluções planejadas para o produto.

## Uso do plano no detalhe da corretora

O drawer de detalhe de corretora (platform_admin) hoje mostra só a contagem de usuários ativos (`count_active_users()`, ver `.agents/specs/brokerage-users-count/`). Falta comparar isso com o limite do plano contratado (`plans.max_users`, já existe na tabela) e mostrar como um KPI completo — "3 de 10 usuários ativos" com barra de progresso, igual ao protótipo aprovado (opção 4 do artifact "Detalhe Corretora", 2026-08-26).

Escopo quando essa feature de planos for atacada de verdade:
- Embed de `max_users` junto de `brokerage.plans` (hoje só traz `name`).
- Card com número + "de N do plano X" + barra de progresso.
- Decidir o que mostrar quando a corretora não tem plano vinculado (hoje: `max_users` é `null` nesse caso, `can_add_user()` já trata isso como "sem limite").
- Possível gancho pra fluxo de upgrade de plano, se/quando essa feature existir.

*Documentação em construção — próximas entradas conforme surgirem.*
