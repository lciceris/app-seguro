-- Corretora especial da plataforma (id fixo, conhecido) — só usuários platform_admin
-- pertencem a ela. Nunca aparece na listagem de gestão de corretoras-cliente (filtro
-- feito no frontend/api, não em RLS — ver .agents/specs/brokerages/design.md).

insert into brokerages (id, name, status)
values ('00000000-0000-0000-0000-000000000001', 'Plataforma', 'active')
on conflict (id) do nothing;
