# Design Document

## Overview

Cotações — a entidade mais complexa da plataforma até agora: agrega cliente, veículos (com cobertura por veículo), seguradoras convidadas (com retorno e negociação), QAR e uma máquina de estados de 8 status com regras de quem pode fazer cada transição. Diferente das specs anteriores, o detalhe de uma cotação não cabe bem num drawer — vira uma **página própria com abas** (Visão geral, Veículos, QAR, Seguradoras), mesmo padrão que o fleet-auth-gate antigo já usava (`quotations.$id.tsx`).

## Architecture

- **Frontend**: `features/quotations/` — feature própria.
- **Backend**: 6 tabelas novas (`quotations`, `quotation_vehicles`, `quotation_insurers`, `quotation_qar`, `quotation_qar_attachments`, `quotation_insurer_events`), 7 enums novos, um contador de numeração sequencial, e um trigger central que valida toda transição de status (não é só RLS de leitura/escrita — é regra de negócio real, então vive num trigger, não só na UI).
- **Storage**: primeira spec a usar o bucket `qar-attachments` (privado) — precisa ser criado agora (não existe ainda no projeto Supabase novo).
- **PDF de proposta**: gerado 100% no navegador (`@react-pdf/renderer`), sem Edge Function.

## Divergência de padrão: detalhe da cotação é uma página, não um drawer

Toda spec anterior usou Sheet (drawer) pra ver detalhe. Cotação tem 4 grupos de informação (dados gerais, veículos com ~19 campos de cobertura cada, QAR com ~15 campos, seguradoras com retorno + linha do tempo de eventos) — não cabe com qualidade numa `SheetContent` de 1000px. `/quotations/:quotationId` é uma rota de página cheia com abas internas (não dialogs dentro de abas — navegação normal). Criar continua sendo um drawer simples (`/quotations/add`), já que os campos de criação são poucos; editar os campos gerais da cotação (datas, coberturas desejadas, prazo, observações) também é um drawer leve (`/quotations/:quotationId/edit`); veículos/QAR/seguradoras são geridos inline dentro das abas da página de detalhe, não em drawers separados.

## Data Models

### Enums novos

```sql
create type quotation_status as enum (
  'waiting', 'in_progress', 'in_negotiation', 'presented',
  'waiting_effect', 'client_accepted', 'effected', 'not_closed'
);

create type quotation_type as enum ('new', 'renewal');

create type insurer_response_status as enum ('pending', 'accepted', 'declined', 'waiting_info');

create type quotation_event_type as enum ('comment', 'system');

-- Cobertura por veículo (ver quotation_vehicles)
create type coverage_type as enum ('rcf', 'total', 'vd'); -- Responsabilidade Civil Facultativa | Compreensiva/Total | Valor Determinado
create type franchise_type as enum ('normal', 'reduced');
create type glass_coverage_level as enum ('basic', 'complete', 'armored');
```

`circulation_regions` (QAR) fica como `text[]` livre, não enum — o catálogo de regiões não está confirmado em nenhum doc antigo; inventar um agora seria arriscado. Revisamos se/quando tivermos a lista real.

### `quotations`

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid, pk | |
| `brokerage_id` | uuid, not null, fk `brokerages(id)` on delete cascade | |
| `client_id` | uuid, not null, fk `clients(id)` on delete restrict | nunca cascade — cliente com cotação não pode sumir |
| `seller_id` | uuid, nullable, fk `users(id)` on delete set null | |
| `analyst_id` | uuid, nullable, fk `users(id)` on delete set null | setado ao entrar em `in_progress` |
| `number` | text, not null | gerado automaticamente, ver "Numeração sequencial" |
| `status` | `quotation_status`, not null, default `'waiting'` | |
| `quotation_type` | `quotation_type`, nullable | |
| `coverage_start`, `coverage_end` | date, nullable | |
| `coverages` | text[], nullable | |
| `deductible_pref` | text, nullable | |
| `due_date` | date, nullable | |
| `seller_notes` | text, nullable | |
| `lost_reason` | text, nullable | |
| `created_at`, `updated_at` | timestamptz | trigger `set_updated_at` |

Sem `winning_insurer_id` — ver `quotation_insurers.is_winner`.

### Numeração sequencial

```sql
create table quotation_number_counters (
  brokerage_id uuid not null references brokerages (id) on delete cascade,
  year integer not null,
  last_number integer not null default 0,
  primary key (brokerage_id, year)
);

create function generate_quotation_number() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  v_year integer := extract(year from now());
  v_next integer;
begin
  insert into public.quotation_number_counters (brokerage_id, year, last_number)
  values (new.brokerage_id, v_year, 1)
  on conflict (brokerage_id, year)
  do update set last_number = public.quotation_number_counters.last_number + 1
  returning last_number into v_next;

  new.number := 'QT-' || v_year || '-' || lpad(v_next::text, 4, '0');
  return new;
end;
$$;

create trigger trg_generate_quotation_number
  before insert on quotations
  for each row
  execute function generate_quotation_number();
```

O `UPSERT ... ON CONFLICT DO UPDATE ... RETURNING` é atômico — duas inserções concorrentes pra mesma corretora/ano serializam no lock da linha do contador, sem race condition.

### `quotation_vehicles`

Mesmos ~19 campos de cobertura do modelo antigo (RCF danos materiais/corporais/morais, APP morte/invalidez, casco, franquia, bônus, sinistros, assistência 24h, vidros, carro reserva, blindagem, equipamentos) — PK composta `(vehicle_id, quotation_id)`, ambos `on delete cascade`.

Um trigger `BEFORE INSERT` valida que o veículo pertence ao mesmo `client_id` da cotação (`vehicles.client_id = quotations.client_id`) — a RLS por si só não pega uma inconsistência assim (os dois estão na mesma corretora, só o cliente diverge), então é uma checagem de integridade, não de autorização.

Um segundo trigger bloqueia `INSERT`/`DELETE` quando `quotations.status` não é `waiting` nem `in_progress` (Requirement 3.2/3.3) — `UPDATE` dos campos de cobertura continua liberado em qualquer status não-terminal.

### `quotation_insurers`

Mesmos campos do modelo antigo, mais:
- `installments_count` (integer, nullable) — novo, parcelamento.
- `is_winner` (boolean, not null, default `false`) — novo, substitui `quotations.winning_insurer_id`.
- `created_at` (timestamptz) — não existia antes, adicionado pra consistência/ordenação.

`UNIQUE(quotation_id, insurer_id)` mantido. `CHECK (NOT is_winner OR response_status = 'accepted')` — trava Requirement 7.2 direto no schema, sem precisar de trigger. Trigger `enforce_single_quotation_winner` (mesmo padrão de `enforce_single_primary_seller`) garante só uma vencedora por cotação.

### `quotation_qar`

Mesmos campos do modelo antigo (1:1 com `quotations`, `UNIQUE(quotation_id)`). **`renewed_policy_id` não entra nessa spec** — a coluna e sua FK pra `policies` são adicionadas via `ALTER TABLE` na spec `policies`, quando a tabela referenciada existir (mantém a dependência numa via só: `policies` depende de `quotations`, nunca o inverso). A Task correspondente (Requirement 4.2) fica marcada como dependente e é implementada de fato só na spec `policies`.

### `quotation_qar_attachments`

Mesmos campos do modelo antigo. Bucket `qar-attachments` (privado), path `{brokerage_id}/{quotation_id}/{filename}`.

### `quotation_insurer_events`

Mesmos campos do modelo antigo — `event_type` agora é o enum `quotation_event_type` em vez de `CHECK (event_type IN (...))` sobre texto livre.

## RLS

### Funções auxiliares (`SECURITY DEFINER`, mesmo padrão de `is_my_client`/`get_client_brokerage_id`)

```sql
create function get_quotation_brokerage_id(p_quotation_id uuid) returns uuid
language sql security definer set search_path = '' stable as $$
  select brokerage_id from public.quotations where id = p_quotation_id
$$;

create function is_my_quotation(p_quotation_id uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.quotations
    where id = p_quotation_id and seller_id = auth.uid()
  )
$$;

create function is_my_quotation_insurer(p_quotation_insurer_id uuid) returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (
    select 1 from public.quotation_insurers qi
    join public.quotations q on q.id = qi.quotation_id
    where qi.id = p_quotation_insurer_id and q.seller_id = auth.uid()
  )
$$;
```

`quotations.seller_id` é uma coluna direta (não N:N como `client_sellers`), então a policy de `quotations` em si compara `seller_id = auth.uid()` inline sem precisar de função — é uma comparação na própria linha, não uma subquery cross-table (diferente da pegadinha já documentada em `brokerages`/`clients`).

### `quotations`

```sql
-- select
brokerage_id = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
  or (get_my_role() = 'seller' and seller_id = auth.uid())
)

-- insert
brokerage_id = get_my_brokerage_id()
and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'seller')

-- update (mesma condição do select, menos viewer)
brokerage_id = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
  or (get_my_role() = 'seller' and seller_id = auth.uid())
)
```

Sem policy de DELETE.

### Trigger `enforce_quotation_status_transition`

RLS sozinha não expressa "só `supervisor`/`brokerage_admin`/`platform_admin` fazem `client_accepted → effected`, mas `seller` também faz as transições anteriores" — é regra condicionada ao **valor** de `OLD.status`/`NEW.status`, não só a quem é o usuário. Um trigger `BEFORE UPDATE OF status`, `SECURITY DEFINER`, valida a tabela de transições inteira (Requirement 6) numa função só — inclui a exigência de vencedora marcada antes de `presented` (6.3), a exigência de `lost_reason` antes de `not_closed` (6.8/6.9), e a definição automática de `analyst_id` ao entrar em `in_progress` (6.1). Fica registrado como um `CASE OLD.status WHEN ... THEN ...` explícito — cada branch checa o novo status permitido e o role de quem está fazendo a chamada (`get_my_role()`, sempre qualificado com `public.`).

### `quotation_vehicles`, `quotation_qar`, `quotation_qar_attachments`

Mesma condição de visibilidade da cotação pai, via `get_quotation_brokerage_id`/`is_my_quotation`:

```sql
get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
  or (get_my_role() = 'seller' and is_my_quotation(quotation_id))
)
```
(`viewer` só teria SELECT aqui, sem INSERT/UPDATE/DELETE — mesma lógica de "vê a cotação mas não mexe".)

### `quotation_insurers`

```sql
-- select: mesma condição de visibilidade acima, incluindo viewer
-- insert/update: só analyst/supervisor/brokerage_admin/platform_admin (Requirement 5.4)
get_quotation_brokerage_id(quotation_id) = get_my_brokerage_id()
and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
```

### `quotation_insurer_events`

`brokerage_id` já denormalizado na própria tabela (como no modelo antigo) — não precisa de função extra pra isso, só pra escopo de `seller`:

```sql
-- select
brokerage_id = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst', 'viewer')
  or (get_my_role() = 'seller' and is_my_quotation_insurer(quotation_insurer_id))
)

-- insert: só analyst/supervisor/brokerage_admin/platform_admin (Requirement 8.1)
brokerage_id = get_my_brokerage_id()
and get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
```

## Storage — bucket `qar-attachments`

Primeira spec a criar esse bucket (privado, path `{brokerage_id}/{quotation_id}/{filename}` — CLAUDE.md seção 12). Policies em `storage.objects`:

```sql
-- SELECT/INSERT/DELETE: brokerage_id do path bate com a própria corretora,
-- e (perfil de gestão/analyst) ou (seller dono da cotação do path)
(storage.foldername(name))[1]::uuid = get_my_brokerage_id()
and (
  get_my_role() in ('platform_admin', 'brokerage_admin', 'supervisor', 'analyst')
  or (get_my_role() = 'seller' and is_my_quotation(((storage.foldername(name))[2])::uuid))
)
```
Sem policy de UPDATE (mesmo padrão de `qar-attachments` no modelo antigo — substituir um anexo é apagar e subir de novo).

## PDF de proposta

`@react-pdf/renderer` (React, cliente, sem backend). Layout simples: cabeçalho com dados da corretora (nome, cor primária — já disponíveis no auth store) e do cliente, tabela de veículos com cobertura resumida, bloco da proposta vencedora (seguradora, prêmio, franquia, parcelas, vigência). Botão "Baixar" sempre disponível quando há vencedora marcada; botão "Compartilhar" condicional a `navigator.share` com suporte a arquivos (`navigator.canShare({ files })`).

## Error Handling

- Validação de formulário — inline, React Hook Form.
- Transição de status inválida ou fora de permissão — bloqueada pelo trigger `enforce_quotation_status_transition`; a UI só mostra os botões de transição válidos pro status/role atual (mesmo objeto `STATUS_TRANSITIONS` que já existia no modelo antigo, adaptado).
- Tentar marcar vencedora sem `response_status = 'accepted'` — bloqueada pelo `CHECK` do banco, toast de erro.
- Anexo de QAR — mesmo padrão de erro dos outros uploads já implementados.

## Testing Strategy

- **Componente** — `create-quotation-drawer`, `edit-quotation-drawer`, a página de detalhe por aba (vehicles tab, QAR tab, insurers tab com seleção de vencedora e eventos), geração do PDF (mock de `@react-pdf/renderer`).
- **Hooks** — mutations de cada sub-entidade, com atenção especial ao hook de transição de status (mapeamento de transições válidas no frontend, espelhando o trigger).
- **E2E** — fluxo completo: `seller` cria cotação → `analyst` assume, convida seguradoras, registra retorno `accepted`, marca vencedora, apresenta → `seller` avança pra `waiting_effect` e depois `client_accepted` → `supervisor` efetiva (`effected`) → confirma que `seller`/`analyst` são bloqueados nessa última transição; um segundo `seller` sem vínculo com o cliente não vê a cotação.
