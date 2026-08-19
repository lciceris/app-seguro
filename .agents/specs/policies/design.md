# Design — policies

## Overview

- **Backend**: 1 tabela nova (`policies`), 1 tabela de anexos (`policy_attachments`), 1 enum novo (`policy_status`), 1 `ALTER TABLE` em `quotation_qar` (coluna `renewed_policy_id`, adiada de propósito na spec `quotations`), 1 trigger central (`create_policy_from_effected_quotation`) que faz todo o trabalho de criação automática — não existe endpoint/formulário de "criar apólice" no frontend.
- **Storage**: bucket novo `policy-documents` (privado), mesmo padrão de `qar-attachments`.
- **UI**: volta ao padrão de drawer (não página cheia como `quotations`) — os campos são poucos e cabem numa `SheetContent` de visualização com anexos inline.

## Data Models

### Enum novo

```sql
create type policy_status as enum ('active', 'cancelled', 'renewed');
```

`expiring_soon`/`expired` **não entram no enum** — são calculados no frontend a partir de `coverage_end`, exatamente como no modelo antigo (`docs/database/schema.md`, seção `policies`, "Nota sobre status derivado"). `cancelled` existe no enum porque o schema precisa do estado final, mas nenhuma ação desta spec o produz — fica para `policy-endorsements`.

### `policies`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `brokerage_id` | uuid, not null, fk `brokerages(id)` on delete cascade | |
| `client_id` | uuid, not null, fk `clients(id)` on delete restrict | |
| `insurer_id` | uuid, not null, fk `insurers(id)` on delete restrict | seguradora vencedora da cotação — sempre existe, porque só o trigger cria a linha e só cria quando há vencedora marcada |
| `quotation_id` | uuid, not null, unique, fk `quotations(id)` on delete restrict | **not null**, diferente do modelo antigo — toda apólice nasce de uma cotação efetivada |
| `renewed_from_policy_id` | uuid, nullable, fk `policies(id)` on delete set null | preenchido pelo trigger a partir de `quotation_qar.renewed_policy_id` |
| `policy_number` | text, nullable | preenchido depois, quando a seguradora emite |
| `premium_amount` | numeric, nullable | herdado de `quotation_insurers.premium_amount` na criação; editável depois |
| `total_fleet_value` | numeric, nullable | `sum(quotation_vehicles.casco_value)` da cotação na criação; editável depois |
| `coverage_start` | date, nullable | herdado de `quotations.coverage_start` |
| `coverage_end` | date, nullable | herdado de `quotations.coverage_end` |
| `status` | `policy_status`, not null, default `'active'` | |
| `created_at` | timestamptz, not null, default `now()` | |
| `updated_at` | timestamptz, not null, default `now()` | trigger `set_updated_at` (já existe, reaproveitado) |

Sem `ON DELETE CASCADE` em `client_id`/`quotation_id`/`insurer_id` — apólice é o registro mais "pesado" da cadeia, nunca deve desaparecer por causa da exclusão de outra coisa (aliás nenhuma dessas três tabelas tem DELETE exposto ao frontend hoje).

Índices: `brokerage_id`, `client_id` (mesmo padrão de índice em toda coluna usada em policy RLS, já seguido em todas as specs anteriores). `quotation_id` já é indexado implicitamente pelo `UNIQUE`.

### `policy_attachments`

Mesmo padrão de `quotation_qar_attachments`:

```sql
create table policy_attachments (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references policies (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint not null,
  created_at timestamptz not null default now()
);

create index policy_attachments_policy_id_idx on policy_attachments (policy_id);
```

### `quotation_qar` — `ALTER TABLE`

```sql
alter table quotation_qar
  add column renewed_policy_id uuid references policies (id) on delete set null;
```

Só agora, porque só agora `policies` existe — mantém a dependência numa via só (documentado em `quotations/design.md`).

## Trigger de criação automática

```sql
create or replace function create_policy_from_effected_quotation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_winner record;
  v_fleet_value numeric;
  v_renewed_policy_id uuid;
  v_new_policy_id uuid;
begin
  if new.status <> 'effected' or old.status = 'effected' then
    return new;
  end if;

  select insurer_id, premium_amount into v_winner
  from public.quotation_insurers
  where quotation_id = new.id and is_winner
  limit 1;

  select sum(casco_value) into v_fleet_value
  from public.quotation_vehicles
  where quotation_id = new.id;

  select renewed_policy_id into v_renewed_policy_id
  from public.quotation_qar
  where quotation_id = new.id;

  insert into public.policies (
    brokerage_id, client_id, insurer_id, quotation_id, renewed_from_policy_id,
    premium_amount, total_fleet_value, coverage_start, coverage_end
  ) values (
    new.brokerage_id, new.client_id, v_winner.insurer_id, new.id, v_renewed_policy_id,
    v_winner.premium_amount, v_fleet_value, new.coverage_start, new.coverage_end
  )
  returning id into v_new_policy_id;

  if v_renewed_policy_id is not null then
    update public.policies set status = 'renewed' where id = v_renewed_policy_id;
  end if;

  return new;
end;
$$;

create trigger trg_create_policy_from_effected_quotation
  after update of status on quotations
  for each row
  execute function create_policy_from_effected_quotation();
```

`old.status = 'effected'` na guarda cobre o caso (impossível hoje, mas defensivo) de um novo `UPDATE OF status` disparar sem mudar de valor — o trigger de `quotations` já barra qualquer transição a partir de `effected` (estado terminal), então isso nunca deveria acontecer, mas custa nada garantir que o `INSERT` não roda duas vezes (o `UNIQUE(quotation_id)` já pegaria isso com um erro feio; a guarda evita o erro e é mais clara sobre a intenção).

`v_winner`/`v_fleet_value` podem vir `null` (sem veículos com `casco_value`, ou — teoricamente impossível, já que `presented` exige vencedora marcada — sem vencedora). `insert` com `insurer_id` `null` violaria o `not null` da coluna; na prática nunca acontece porque o trigger de status já exige vencedora antes de `presented`, e `effected` só é alcançável depois de passar por `presented`.

## RLS

### `policies`

Reaproveita `is_my_client(client_id)` (já existe, spec `clients`) — sem função nova, porque `client_id` já é uma coluna direta da própria tabela.

```sql
-- select
brokerage_id = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
  or (get_my_role() = 'seller' and is_my_client(client_id))
)

-- update — só quem efetiva cotações também edita apólices
brokerage_id = get_my_brokerage_id()
and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
```

Sem policy de `insert` (só o trigger `security definer` cria — roda com privilégios que ignoram RLS) e sem `delete` (apólice nunca é excluída).

### `policy_attachments`

Funções auxiliares no mesmo padrão de `get_quotation_brokerage_id`/`is_my_quotation`:

```sql
create function get_policy_brokerage_id(p_policy_id uuid) returns uuid
language sql security definer set search_path = '' stable as $$
  select brokerage_id from public.policies where id = p_policy_id
$$;

create function is_my_policy_client(p_policy_id uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.policies p
    join public.client_sellers cs on cs.client_id = p.client_id
    where p.id = p_policy_id and cs.seller_id = auth.uid()
  )
$$;
```

```sql
-- select — mesma visibilidade da policy pai
get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
  or (get_my_role() = 'seller' and is_my_policy_client(policy_id))
)

-- insert/delete — mesmo grupo que edita a apólice
get_policy_brokerage_id(policy_id) = get_my_brokerage_id()
and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
```

## Storage — bucket `policy-documents`

Privado, path `{brokerage_id}/{policy_id}/{filename}` — mesmo padrão de `qar-attachments`:

```sql
insert into storage.buckets (id, name, public) values ('policy-documents', 'policy-documents', false);

create policy policy_documents_select on storage.objects for select to authenticated using (
  bucket_id = 'policy-documents'
  and (storage.foldername(name))[1] = get_my_brokerage_id()::text
  and (
    get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
    or (get_my_role() = 'seller' and is_my_policy_client(((storage.foldername(name))[2])::uuid))
  )
);

create policy policy_documents_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'policy-documents'
  and (storage.foldername(name))[1] = get_my_brokerage_id()::text
  and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
);

create policy policy_documents_delete on storage.objects for delete to authenticated using (
  bucket_id = 'policy-documents'
  and (storage.foldername(name))[1] = get_my_brokerage_id()::text
  and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor')
);
```

## Status derivado (frontend)

Utilitário puro, sem estado — `getDerivedPolicyStatus(policy)`:

```
se status persistido != 'active' → retorna o persistido (cancelled | renewed)
senão, se coverage_end é null → 'active' (sem dado suficiente pra vencer)
senão, se coverage_end < hoje → 'expired'
senão, se coverage_end <= hoje + 30 dias → 'expiring_soon'
senão → 'active'
```

Mesma função vai ser reaproveitada depois pelos dashboards (fora de escopo aqui, mas o utilitário já nasce genérico).

## Telas

Volta ao padrão de drawer (diferente da divergência de página cheia de `quotations` — aqui os dados cabem numa `SheetContent` de 1000px):

- `/policies` — listagem, sem botão "Nova apólice" (Requirement 1.2 — só o trigger cria).
- `/policies/:policyId` — drawer de visualização (`policy-detail-drawer`, 1000px): dados da apólice, link para a cotação de origem, vínculo de renovação (para qual apólice essa renova / se já foi renovada por outra), lista de anexos com upload/remoção inline (não é modal-dentro-de-drawer — é ação direta na mesma superfície, mesmo padrão já usado em `qar-attachments` dentro da aba QAR).
- `/policies/:policyId/edit` — drawer de edição (`edit-policy-drawer`, 720px, sobreposto ao de detalhe): `policy_number`, `coverage_start`, `coverage_end`, `premium_amount`, `total_fleet_value`. Só visível para `supervisor`/`brokerage_admin`/`platform_admin` (Requirement 2.2).
