# Design — policy-endorsements

## Overview

- **Backend**: 2 tabelas novas (`policy_endorsements`, `policy_vehicles`), 2 enums novos (`policy_endorsement_type`, `policy_endorsement_status`), 1 valor novo no enum existente `policy_status` (`superseded`), 2 colunas novas em `policies` (`previous_version_id`, `root_policy_id`), e uma `ALTER TABLE` no trigger já existente `create_policy_from_effected_quotation` (spec `policies`) pra também popular `policy_vehicles` na primeira versão.
- **Máquina de estados**: `policy_endorsements` tem seu próprio trigger de transição de status (`enforce_policy_endorsement_status_transition`), no mesmo padrão de `enforce_quotation_status_transition` — mas com 5 estados em vez de 8, porque não há "convidar seguradoras" (é sempre a seguradora que já tem a apólice).
- **Efetivação**: reaproveita exatamente o padrão já usado entre `quotations` → `policies` — um `UPDATE` simples de status (`client_accepted → effected`), validado por um trigger `BEFORE UPDATE OF status`, e a aplicação de verdade (nova versão de `policies`, cópia de `policy_vehicles`, etc.) acontece num trigger `AFTER UPDATE OF status` separado (`apply_policy_endorsement_effect`). Nada de RPC chamada explicitamente pelo frontend — o mesmo UPDATE que o usuário já faz pra "Efetivar" dispara tudo.
- **UI**: os endossos vivem dentro do drawer de detalhe da apólice (`policy-detail-drawer`, já existente) como uma seção nova, mais dois drawers próprios (criar endosso, detalhe/ações do endosso) — sem rota de listagem própria.

## Data Models

### Enums novos

```sql
create type policy_endorsement_type as enum (
  'vehicle_inclusion', 'vehicle_exclusion', 'coverage_change',
  'extension', 'administrative_correction', 'cancellation'
);

create type policy_endorsement_status as enum (
  'waiting', 'presented', 'client_accepted', 'effected', 'not_closed'
);
```

### `ALTER TYPE policy_status ADD VALUE 'superseded'`

Precisa rodar fora de bloco de transação com outras alterações (restrição do Postgres pra `ALTER TYPE ... ADD VALUE`) — migration própria, só isso.

### `ALTER TABLE policies`

```sql
alter table policies
  add column previous_version_id uuid references policies (id) on delete set null,
  add column root_policy_id uuid references policies (id) on delete set null;
```

`root_policy_id` fica `null` na primeira versão de cada apólice (criada pela spec `policies`) — toda consulta que precisa "achar a raiz da cadeia" usa `coalesce(root_policy_id, id)`. Preenchido de verdade só a partir da segunda versão em diante (`coalesce(anterior.root_policy_id, anterior.id)`).

`previous_version_id` é conceito **diferente** de `renewed_from_policy_id` (já existente): renovação é nova vigência/nova cotação; endosso é mesma vigência, ajuste de conteúdo dentro do mesmo contrato.

### `policy_vehicles`

Mesma estrutura de `quotation_vehicles` (~19 campos de cobertura), trocando `quotation_id` por `policy_id`:

```sql
create table policy_vehicles (
  policy_id uuid not null references policies (id) on delete cascade,
  vehicle_id uuid not null references vehicles (id) on delete restrict,
  coverage_type coverage_type,
  casco_percentage numeric,
  casco_value numeric,
  franchise_type franchise_type,
  bonus numeric,
  claims_count integer,
  rcf_dm numeric,
  rcf_dc numeric,
  rcf_dmo numeric,
  app_death numeric,
  app_disability numeric,
  assistance text,
  glass_coverage glass_coverage_level,
  reserve_car text,
  bodywork_value numeric,
  bodywork_type text,
  equipment_value numeric,
  equipment_type text,
  armoring_value numeric,
  primary key (policy_id, vehicle_id)
);

create index policy_vehicles_policy_id_idx on policy_vehicles (policy_id);
```

`on delete restrict` em `vehicle_id` (diferente de `quotation_vehicles`, que usa `cascade`) — um veículo referenciado por uma versão histórica de apólice não deve poder ser removido silenciosamente; o projeto nem tem `DELETE` de veículo hoje (só inativação), então na prática isso nunca dispara, mas é a garantia certa.

Sem policy de `insert`/`update`/`delete` pra usuário comum — toda escrita em `policy_vehicles` acontece via trigger (`SECURITY DEFINER`), nunca diretamente pelo frontend.

### `create_policy_from_effected_quotation` — alteração na spec `policies` já fechada

`CREATE OR REPLACE FUNCTION`, mesma assinatura, adicionando ao final (depois do `INSERT INTO policies`, usando `RETURNING id INTO v_new_policy_id` que já existia e tinha sido descartado — volta a ser usado):

```sql
insert into public.policy_vehicles (
  policy_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
  bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
  glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
  armoring_value
)
select
  v_new_policy_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
  bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
  glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
  armoring_value
from public.quotation_vehicles
where quotation_id = new.id;
```

### `policy_endorsements`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `brokerage_id` | uuid, not null, fk `brokerages(id)` on delete cascade | |
| `policy_id` | uuid, not null, fk `policies(id)` on delete restrict | a versão vigente na qual o endosso foi aberto — nunca muda depois |
| `endorsement_type` | `policy_endorsement_type`, not null | |
| `status` | `policy_endorsement_status`, not null, default `'waiting'` | |
| `seller_id` | uuid, fk `users(id)` on delete set null | quem abriu |
| `description` | text | motivo/descrição — obrigatório pra `administrative_correction`/`cancellation`, opcional nos demais |
| `vehicle_id` | uuid, fk `vehicles(id)` on delete restrict | pra `vehicle_inclusion`/`vehicle_exclusion`/`coverage_change` |
| 19 campos de cobertura | mesmos de `policy_vehicles` | pra `vehicle_inclusion`/`coverage_change` |
| `new_policy_number` | text | pra `administrative_correction` |
| `new_premium_amount` | numeric | pra `administrative_correction` |
| `new_total_fleet_value` | numeric | pra `administrative_correction` |
| `new_coverage_start` | date | pra `administrative_correction` |
| `new_coverage_end` | date | pra `extension` e `administrative_correction` (mesmo campo — semântica idêntica: nova data de fim de vigência) |
| `premium_adjustment` | numeric | ajuste de prêmio negociado com a seguradora (pode ser negativo) |
| `insurer_response_notes` | text | |
| `responded_at` / `responded_by` | timestamptz / uuid fk `users(id)` on delete set null | preenchidos na transição `waiting → presented` |
| `client_response_notes` | text | |
| `client_responded_at` / `client_responded_by` | timestamptz / uuid fk `users(id)` on delete set null | preenchidos na transição `presented → client_accepted`/`not_closed` |
| `not_closed_reason` | text | obrigatório quando `status` vira `not_closed` |
| `new_policy_id` | uuid, fk `policies(id)` on delete set null | a versão criada na efetivação — `null` pra `cancellation` ou enquanto não efetivado |
| `effected_at` / `effected_by` | timestamptz / uuid fk `users(id)` on delete set null | |
| `created_at` / `updated_at` | timestamptz | trigger `set_updated_at` |

Índices em `brokerage_id`, `policy_id`.

### Trigger de validação de campos obrigatórios por tipo (`BEFORE INSERT`)

```sql
create or replace function validate_policy_endorsement_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.endorsement_type in ('vehicle_inclusion', 'vehicle_exclusion', 'coverage_change')
     and new.vehicle_id is null then
    raise exception 'Selecione o veículo.';
  end if;

  if new.endorsement_type = 'extension' and new.new_coverage_end is null then
    raise exception 'Informe a nova data de fim de vigência.';
  end if;

  if new.endorsement_type in ('administrative_correction', 'cancellation')
     and (new.description is null or btrim(new.description) = '') then
    raise exception 'Informe o motivo.';
  end if;

  if new.endorsement_type = 'vehicle_inclusion'
     and not exists (
       select 1 from public.vehicles v join public.policies p on p.client_id = v.client_id
       where v.id = new.vehicle_id and p.id = new.policy_id
     ) then
    raise exception 'O veículo precisa ser do mesmo cliente da apólice.';
  end if;

  if new.endorsement_type in ('vehicle_exclusion', 'coverage_change')
     and not exists (
       select 1 from public.policy_vehicles where policy_id = new.policy_id and vehicle_id = new.vehicle_id
     ) then
    raise exception 'Veículo não está coberto pela versão vigente da apólice.';
  end if;

  if not exists (select 1 from public.policies where id = new.policy_id and status = 'active') then
    raise exception 'Só é possível abrir endosso na versão vigente da apólice.';
  end if;

  return new;
end;
$$;

create trigger trg_validate_policy_endorsement_fields
  before insert on policy_endorsements
  for each row
  execute function validate_policy_endorsement_fields();
```

### Trigger de transição de status (`BEFORE UPDATE OF status`)

Mesmo padrão de `enforce_quotation_status_transition`, mais enxuto (sem "exigir vencedora" — aqui não existe conceito de vencedora):

```sql
create or replace function enforce_policy_endorsement_status_transition()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_role public.user_role;
begin
  if new.status = old.status then return new; end if;
  v_role := public.get_my_role();

  case old.status
    when 'waiting' then
      if new.status = 'presented' then
        if v_role not in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin') then
          raise exception 'Transição de status inválida.';
        end if;
        new.responded_at := now();
        new.responded_by := auth.uid();
      elsif new.status = 'not_closed' then
        if v_role not in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin') then
          raise exception 'Transição de status inválida.';
        end if;
        if new.not_closed_reason is null then
          raise exception 'Informe o motivo de não fechamento.';
        end if;
      else
        raise exception 'Transição de status inválida.';
      end if;

    when 'presented' then
      if v_role = 'seller' then
        if not public.is_my_policy_client(new.policy_id) then
          raise exception 'Só o vendedor responsável pode avançar esse endosso.';
        end if;
      elsif v_role not in ('supervisor', 'brokerage_admin', 'platform_admin') then
        raise exception 'Transição de status inválida.';
      end if;
      if new.status = 'client_accepted' then
        new.client_responded_at := now();
        new.client_responded_by := auth.uid();
      elsif new.status = 'not_closed' then
        if new.not_closed_reason is null then
          raise exception 'Informe o motivo de não fechamento.';
        end if;
      else
        raise exception 'Transição de status inválida.';
      end if;

    when 'client_accepted' then
      if v_role not in ('supervisor', 'brokerage_admin', 'platform_admin') then
        raise exception 'Transição de status inválida.';
      end if;
      if new.status = 'not_closed' and new.not_closed_reason is null then
        raise exception 'Informe o motivo de não fechamento.';
      elsif new.status not in ('effected', 'not_closed') then
        raise exception 'Transição de status inválida.';
      end if;

    else
      raise exception 'Endosso em status terminal não pode mudar de status.';
  end case;

  return new;
end;
$$;

create trigger trg_enforce_policy_endorsement_status_transition
  before update of status on policy_endorsements
  for each row
  execute function enforce_policy_endorsement_status_transition();
```

### Trigger de aplicação do efeito (`AFTER UPDATE OF status`)

```sql
create or replace function apply_policy_endorsement_effect()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_current record;
  v_new_id uuid;
begin
  if new.status <> 'effected' or old.status = 'effected' then
    return new;
  end if;

  select * into v_current from public.policies where id = new.policy_id;

  if new.endorsement_type = 'cancellation' then
    update public.policies set status = 'cancelled' where id = v_current.id;
    update public.policy_endorsements
      set effected_at = now(), effected_by = auth.uid()
      where id = new.id;
    return new;
  end if;

  insert into public.policies (
    brokerage_id, client_id, insurer_id, quotation_id, renewed_from_policy_id,
    previous_version_id, root_policy_id,
    policy_number, premium_amount, total_fleet_value, coverage_start, coverage_end, status
  ) values (
    v_current.brokerage_id, v_current.client_id, v_current.insurer_id,
    v_current.quotation_id, v_current.renewed_from_policy_id,
    v_current.id, coalesce(v_current.root_policy_id, v_current.id),
    coalesce(new.new_policy_number, v_current.policy_number),
    coalesce(new.new_premium_amount, v_current.premium_amount),
    v_current.total_fleet_value, -- recalculado abaixo quando o tipo mexe em veículo
    coalesce(new.new_coverage_start, v_current.coverage_start),
    coalesce(new.new_coverage_end, v_current.coverage_end),
    'active'
  )
  returning id into v_new_id;

  insert into public.policy_vehicles (
    policy_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
    bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
    glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
    armoring_value
  )
  select v_new_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
    bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
    glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
    armoring_value
  from public.policy_vehicles
  where policy_id = v_current.id
    and (new.endorsement_type <> 'vehicle_exclusion' or vehicle_id <> new.vehicle_id);

  if new.endorsement_type = 'vehicle_inclusion' then
    insert into public.policy_vehicles (
      policy_id, vehicle_id, coverage_type, casco_percentage, casco_value, franchise_type,
      bonus, claims_count, rcf_dm, rcf_dc, rcf_dmo, app_death, app_disability, assistance,
      glass_coverage, reserve_car, bodywork_value, bodywork_type, equipment_value, equipment_type,
      armoring_value
    ) values (
      v_new_id, new.vehicle_id, new.coverage_type, new.casco_percentage, new.casco_value,
      new.franchise_type, new.bonus, new.claims_count, new.rcf_dm, new.rcf_dc, new.rcf_dmo,
      new.app_death, new.app_disability, new.assistance, new.glass_coverage, new.reserve_car,
      new.bodywork_value, new.bodywork_type, new.equipment_value, new.equipment_type, new.armoring_value
    );
  elsif new.endorsement_type = 'coverage_change' then
    update public.policy_vehicles set
      coverage_type = new.coverage_type, casco_percentage = new.casco_percentage,
      casco_value = new.casco_value, franchise_type = new.franchise_type, bonus = new.bonus,
      claims_count = new.claims_count, rcf_dm = new.rcf_dm, rcf_dc = new.rcf_dc, rcf_dmo = new.rcf_dmo,
      app_death = new.app_death, app_disability = new.app_disability, assistance = new.assistance,
      glass_coverage = new.glass_coverage, reserve_car = new.reserve_car,
      bodywork_value = new.bodywork_value, bodywork_type = new.bodywork_type,
      equipment_value = new.equipment_value, equipment_type = new.equipment_type,
      armoring_value = new.armoring_value
    where policy_id = v_new_id and vehicle_id = new.vehicle_id;
  end if;

  if new.endorsement_type in ('vehicle_inclusion', 'vehicle_exclusion', 'coverage_change') then
    update public.policies set total_fleet_value = (
      select sum(casco_value) from public.policy_vehicles where policy_id = v_new_id
    ) where id = v_new_id;
  elsif new.endorsement_type = 'administrative_correction' and new.new_total_fleet_value is not null then
    update public.policies set total_fleet_value = new.new_total_fleet_value where id = v_new_id;
  end if;

  update public.policies set status = 'superseded' where id = v_current.id;

  update public.policy_endorsements
    set new_policy_id = v_new_id, effected_at = now(), effected_by = auth.uid()
    where id = new.id;

  return new;
end;
$$;

create trigger trg_apply_policy_endorsement_effect
  after update of status on policy_endorsements
  for each row
  execute function apply_policy_endorsement_effect();
```

O segundo `UPDATE ... WHERE id = new.id` (setando `new_policy_id`/`effected_at`/`effected_by`) não mexe na coluna `status` — não re-dispara o próprio trigger (`AFTER UPDATE OF status`), sem risco de recursão.

## RLS

### `policy_vehicles`

Select com a mesma visibilidade de `policies` (via `policy_id`, reaproveitando `get_policy_brokerage_id`/`is_my_policy_client`, já existentes). Sem insert/update/delete pra usuário comum.

### `policy_endorsements`

Reaproveita `get_policy_brokerage_id`/`is_my_policy_client` (spec `policies`) — sem função nova.

```sql
-- select — mesma visibilidade de policies
get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
  or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
)

-- insert — seller (dono) abre, ou gestão
get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
and (
  get_my_role() in ('supervisor', 'brokerage_admin', 'platform_admin')
  or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
)

-- update — grupo amplo que participa de alguma transição; o trigger de
-- transição valida QUAL transição cada role pode fazer
get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
and (
  get_my_role() in ('analyst', 'supervisor', 'brokerage_admin', 'platform_admin')
  or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
)
```

Sem `delete` — endosso é histórico permanente.

## Frontend

### PDF do endosso

Reaproveita `@react-pdf/renderer` (já instalado, spec `quotations`) — template novo (`PolicyEndorsementDocument`): número da apólice, tipo em português, data de efetivação, motivo, ajuste de prêmio, resumo antes/depois quando aplicável. Botão "Baixar PDF" só aparece quando `status = 'effected'`.

### Telas

Sem rota de listagem própria — endossos vivem dentro do fluxo de apólice:

- `policy-detail-drawer` (já existe) ganha uma seção "Endossos", listando os da mesma linha lógica (via `root_policy_id`, com uma segunda query buscando todas as `policy_endorsements` cujo `policy_id` está em qualquer versão da cadeia — resolvido com uma função auxiliar `get_policy_endorsements_for_chain` ou uma query que já parte do `root_policy_id`). Botão "Abrir endosso" visível só quando a versão sendo vista tem `status = 'active'` e o usuário tem permissão (Requirement 1.3).
- `/policies/:policyId/endorsements/add` (drawer novo, rota irmã de `:policyId`/`:policyId/edit`) — Select de tipo + campos condicionais (reaproveita o mesmo schema de cobertura de veículo já usado em `quotation-vehicle-coverage-schema.ts`, generalizado ou duplicado) + descrição.
- `/policies/:policyId/endorsements/:endorsementId` (drawer novo, rota irmã) — dados do endosso, ações de transição conforme status/role (mesmo padrão de `quotation-status-actions`, adaptado), botão "Baixar PDF" quando `effected`.
- Também ganha uma aba "Veículos" no `policy-detail-drawer` (view-only, lista `policy_vehicles` da versão sendo vista) — Requirement 12.1.

### Query auxiliar: toda a cadeia de endossos de uma apólice

```sql
-- todas as versões de uma cadeia, dado qualquer policy_id da cadeia
select id from policies where coalesce(root_policy_id, id) = coalesce($1.root_policy_id, $1.id)
```

Usada tanto pra listar endossos da linha lógica inteira quanto pra montar a navegação "essa não é a versão mais recente, ver versão atual" (Requirement 12.3) — a versão mais recente é a que tem `status IN ('active', 'cancelled')` dentro da cadeia (a única sem sucessora).
