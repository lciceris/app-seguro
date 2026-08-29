# Design — client-form-redesign

## Migrations (ordem)

1. `create_client_status_and_backfill.sql`
   ```sql
   create type client_status as enum ('active', 'inactive');

   alter table clients add column status client_status not null default 'active';

   update clients set status = 'inactive' where segment = 'inactive';
   ```
2. `drop_segment_and_lead_source_from_clients.sql` (aplicada só depois do código migrado)
   ```sql
   alter table clients drop column segment;
   alter table clients drop column lead_source;
   drop type client_segment;
   ```
3. Regenerar tipos: `supabase gen types typescript --linked`.

## Toggle PF/PJ

Sem dependência nova (`@radix-ui/react-toggle-group` não está instalado). Dois `Button` lado a lado dentro de um container `inline-flex rounded-lg border border-border p-1 bg-muted`, cada botão `flex-1`, ativo = `variant="default"` (bg-primary), inativo = `variant="ghost"`. Controlado via `Controller` no `client_type`.

Campos condicionais por tipo, renderizados com `{clientType === "individual" && (...)}` / `{clientType === "company" && (...)}` — ler `client_type` via `watch("client_type")`.

## Seção Identificação (create/edit-client-drawer)

Ordem nova:
1. Toggle PF/PJ (full width)
2. CPF/CNPJ (full width, com botão Buscar quando PJ) — rotulado dinamicamente "CPF *"/"CNPJ *" — **obrigatório agora** (antes era opcional; ver Requirements 3, decisão: documento é o campo mais usado pra evitar duplicidade, faz sentido como obrigatório junto com o nome)

   > Nota: tornar `tax_id` obrigatório é uma pequena extensão além do que o usuário pediu literalmente ("adiciona o * nos campos obrigatórios" pressupõe que já exista uma lista de obrigatórios). Optei por manter `tax_id` **opcional** como está hoje, só reordenando e mascarando — não vou adicionar `.min(1)` novo no schema sem pedido explícito. O asterisco (Requirement 5) fica só em `client_type`/`legal_name`, que já eram obrigatórios.
3. Razão social/Nome (full width) — rótulo dinâmico "Nome completo *" (PF) / "Razão social *" (PJ)
4. Nome fantasia (PJ only)
5. Data de nascimento (PF only)
6. CNAE, Setor, Inscrição estadual (PJ only)

## Máscaras

`src/shared/lib/masks.ts` ganha:
```ts
export function formatCpf(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
```
No `onChange` do campo `tax_id`: `setValue("tax_id", clientType === "company" ? formatCnpj(v) : formatCpf(v))`.

## Busca CNPJ/CEP

Mesmo padrão de `create-brokerage-drawer.tsx`: `handleFetchCnpj`/`handleFetchCep`, `isFetchingCnpj`/`isFetchingCep`, `Button variant="outline"` com texto "Buscar"/"Buscando...". Botão de CNPJ só aparece quando `client_type === "company"`.

## Remoção de Configurações

- `create-client-schema.ts`/`edit-client-schema.ts`: remove `segment`, `lead_source`.
- `create-client-drawer.tsx`/`edit-client-drawer.tsx`: remove seção Configurações inteira, remove `segment: "lead"` do default.
- `client-detail-drawer.tsx`: remove o card Configurações inteiro.
- `constants/labels.ts`: remove `SEGMENT_LABELS`/`SEGMENT_BADGE_CLASSES`, adiciona `STATUS_LABELS`/`STATUS_BADGE_CLASSES` (tokens semânticos `bg-success-bg text-success-text` / `bg-neutral-bg text-neutral-text`, igual `user-detail-drawer.tsx`).
- `deactivate-client.ts`/`reactivate-client.ts`: `.update({ segment: ... })` → `.update({ status: ... })`.
- `clients-list-screen.tsx`: coluna "Segmento" → "Status" (Badge com `STATUS_BADGE_CLASSES`), toggle Reativar/Inativar passa a checar `client.segment === "inactive"` → `client.status === "inactive"`.

## Testes afetados

- `use-create-client.test.tsx`/`use-update-client.test.tsx`: mock removem `segment`/`lead_source`, adicionam `status: "active"`.
- `edit-client-drawer.test.tsx`/`client-detail-drawer.test.tsx`: mock removem `segment`/`lead_source`, adicionam `status`.
- `create-client-drawer.test.tsx`: sem mudança de assert (não testa Configurações).
- Novo: nenhum teste de `clients-list-screen` existe hoje — não criar um novo (fora do escopo pedido; risco de expandir demais).
