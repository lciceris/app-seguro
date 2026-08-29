# Design Document — insurers-required-fields-and-logo

## 1. Migration — `logo_url`, `cnpj NOT NULL`, bucket

`supabase/migrations/20260829120000_insurers_logo_and_required_cnpj.sql`:

```sql
alter table insurers add column logo_url text;

-- Registros de teste de specs anteriores, sem CNPJ real — únicos 2 hoje.
delete from insurers where cnpj is null;

alter table insurers alter column cnpj set not null;
```

`supabase/migrations/20260829120001_create_insurer_assets_bucket.sql` (espelha `brokerage-assets`, mas sem checagem de pasta por tenant — toda escrita é `platform_admin`):

```sql
insert into storage.buckets (id, name, public)
values ('insurer-assets', 'insurer-assets', true)
on conflict (id) do nothing;

create policy insurer_assets_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'insurer-assets' and get_my_role() = 'platform_admin');

create policy insurer_assets_update on storage.objects for update to authenticated
  using (bucket_id = 'insurer-assets' and get_my_role() = 'platform_admin');

create policy insurer_assets_delete on storage.objects for delete to authenticated
  using (bucket_id = 'insurer-assets' and get_my_role() = 'platform_admin');

-- Sem essa policy, o upsert:true do upload falha com RLS mesmo sem
-- conflito real — mesmo bug já documentado/corrigido em brokerage-assets
-- (20260825100001_add_brokerage_assets_select_policy.sql).
create policy insurer_assets_select on storage.objects for select to authenticated
  using (bucket_id = 'insurer-assets' and get_my_role() = 'platform_admin');
```

Depois de aplicado: `supabase gen types typescript --linked` pra `logo_url` aparecer no `Insurer` (`database-types.ts`).

## 2. Validação (`create-insurer-schema.ts` / `edit-insurer-schema.ts`)

```diff
-  cnpj: z.string().optional(),
+  cnpj: z.string().min(1, "Informe o CNPJ"),
```
(idêntico nos dois arquivos — já é como `name` está definido hoje, só duplicando o padrão)

## 3. API

`src/features/insurers/api/upload-insurer-logo/upload-insurer-logo.ts` (novo, espelha `upload-brokerage-logo.ts` linha por linha, trocando bucket/param):

```ts
import { supabase } from "@/shared/lib/supabase";

export interface UploadInsurerLogoInput {
  insurerId: string;
  file: File;
}

export async function uploadInsurerLogo({ insurerId, file }: UploadInsurerLogoInput) {
  const filePath = `${insurerId}/logo`;

  const { error: uploadError } = await supabase.storage
    .from("insurer-assets")
    .upload(filePath, file, { upsert: true, contentType: file.type });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("insurer-assets").getPublicUrl(filePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}
```

`create-insurer.ts`/`update-insurer.ts`: `CreateInsurerInput`/`UpdateInsurerInput` ganham `logo_url: string | null`.

## 4. `create-insurer-drawer.tsx` — upload no create (mesmo problema de "path depende do id" resolvido em `create-brokerage-drawer.tsx`)

- Estado local: `logoFile`, `logoPreviewUrl`, `fileInputRef` (sem `Controller`, mesmo padrão do brokerage).
- Card novo "Identidade visual" (dashed box vazio / preview+remover quando tem arquivo — copia exata do bloco de `create-brokerage-drawer.tsx` linhas ~478-517, só trocando o rótulo do card se necessário — mesmo é igual).
- `onSubmit`: depois do `createInsurer.mutate` ter sucesso, se `logoFile` existir, chama `uploadInsurerLogo({ insurerId: insurer.id, file: logoFile })` e faz um `supabase.from("insurers").update({ logo_url }).eq("id", insurer.id)` pontual — erro aqui vira toast "Seguradora criada, mas não foi possível salvar o logo." sem bloquear o fluxo (mesmo texto/padrão do brokerage).

## 5. `edit-insurer-drawer.tsx` — upload no edit (id já existe, sem o problema acima)

- Mesmo estado local + card, mas usa o padrão de `own-brokerage-screen.tsx`: `logo_url` some campo do form (`setValue("logo_url", "")` no remove), e o `onSubmit` faz upload primeiro (se houver arquivo novo) e só then chama `updateInsurer.mutate` com `logo_url` resolvido — mais simples que o create porque não precisa de update pontual separado, o `logo_url` já vai junto no payload principal.

## 6. `insurer-detail-drawer.tsx` — mostrar o logo

No topo do card "Identificação", antes do `DetailField` de Nome: se `insurer.logo_url` existir, `<img src={insurer.logo_url} className="size-16 rounded-lg border border-border bg-card object-contain p-1.5" />`. Sem logo, nada aparece (sem placeholder/inicial — é só visualização, diferente do avatar-editor de `own-brokerage-screen`).

## Testing Strategy

- `tsc`/`eslint`/`vitest run` completos (ajustar os testes existentes de `create-insurer-drawer.test.tsx`/`edit-insurer-drawer.test.tsx` que hoje devem submeter sem CNPJ — checar antes de mexer).
- Verificação visual via Playwright: criar seguradora sem nome/CNPJ mostra erro e não submete; criar com nome/CNPJ + logo funciona e o logo aparece no detalhe; editar pra trocar o logo funciona; editar pra remover o logo funciona.
