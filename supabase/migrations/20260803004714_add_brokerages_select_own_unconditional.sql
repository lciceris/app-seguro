-- brokerages_select_own_unconditional: lê a própria corretora via o brokerage_id
-- salvo em `users`, sem depender de get_my_brokerage_id() — que passou a exigir
-- brokerages.status = 'active' (ver 004713). Sem essa policy, a leitura de
-- `brokerages` falharia igualmente tanto se o USUÁRIO quanto se a CORRETORA
-- estivessem inativos, tornando as duas causas indistinguíveis no frontend.
-- RLS é aditiva (OR entre policies) — soma-se a brokerages_select_own sem substituí-la.

create policy brokerages_select_own_unconditional
  on brokerages
  for select
  to authenticated
  using (
    id = (select brokerage_id from public.users where id = auth.uid())
  );
