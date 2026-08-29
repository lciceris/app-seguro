# Tasks — insurers-required-fields-and-logo

- [x] 1. Migrations: `logo_url`, `cnpj NOT NULL`, bucket `insurer-assets`
  - [x] 1.1 `logo_url` + `cnpj NOT NULL`
    - _Requirements: 1.2, 1.3, 2.1_
    - _Nota: `DELETE` das 2 linhas de teste sem CNPJ falhou de verdade (referenciadas por `quotation_insurers`/`policies` de teste via `on delete restrict`) — trocado por `UPDATE ... SET cnpj = '00000000000000' WHERE cnpj IS NULL` antes do `NOT NULL`, evitando arrastar a limpeza pra outras tabelas._
  - [x] 1.2 Bucket `insurer-assets` (público) + policies insert/update/delete/select restritas a `platform_admin`
    - _Requirements: 2.5_
  - [x] 1.3 `supabase db push` + `supabase gen types typescript --linked`
    - _Requirements: —_

- [x] 2. Validação obrigatória
  - [x] 2.1 `cnpj: z.string().min(1, "Informe o CNPJ")` em `create-insurer-schema.ts`/`edit-insurer-schema.ts`; labels "Nome"/"CNPJ" ganham " *" nos dois drawers (convenção geral do projeto pra campo obrigatório)
    - _Requirements: 1.1_

- [x] 3. Upload de logo
  - [x] 3.1 `upload-insurer-logo.ts` (novo) + `logo_url`/`cnpj: string` (não mais nullable) em `CreateInsurerInput`/`UpdateInsurerInput`
    - _Requirements: 2.2, 2.3_
  - [x] 3.2 `create-insurer-drawer.tsx`: card "Identidade visual" + upload pontual pós-insert (espelha `create-brokerage-drawer.tsx`)
    - _Requirements: 2.2_
  - [x] 3.3 `edit-insurer-drawer.tsx`: card "Identidade visual" + upload antes do update (estado local `logoUrl`, sem precisar de campo novo no schema Zod — mais simples que o `own-brokerage-screen`, que precisa do campo no form por outro motivo)
    - _Requirements: 2.3_
  - [x] 3.4 `insurer-detail-drawer.tsx`: exibe o logo quando existir
    - _Requirements: 2.4_

- [x] 4. Verificação
  - [x] 4.1 Ajustados: `edit-insurer-drawer.test.tsx`/`create-insurer-drawer.test.tsx` (payload ganha `logo_url: null`, `getByLabelText` busca "Nome \*"/"CNPJ \*"), `use-create-insurer.test.tsx`/`use-update-insurer.test.tsx` (fixture ganha `cnpj` string + `logo_url: null`). `tsc`/`eslint`/`vitest run` completos — 134/134 passando
    - _Requirements: —_
  - [x] 4.2 Verificação visual via Playwright — submeter vazio bloqueia com "Informe o nome"/"Informe o CNPJ" e não navega; criar com nome/CNPJ/logo funciona, `logo_url` salvo no banco com URL pública válida, logo aparece no drawer de detalhe
    - _Requirements: 1.1, 2.2, 2.3, 2.4_

- [x] 5. Addendum — máscara de CNPJ e telefone (pedido depois da entrega inicial)
  - [x] 5.1 `create-insurer-drawer.tsx`/`edit-insurer-drawer.tsx`: `onChange` com `formatCnpj`/`formatPhone`, payload salva só dígitos; `edit` formata o valor do banco pro form
    - _Requirements: —_
  - [x] 5.2 `insurers-list-screen.tsx`/`insurer-detail-drawer.tsx`: exibição formatada (dado agora é salvo sem pontuação)
    - _Requirements: —_
  - [x] 5.3 Testes ajustados (payload esperado vira dígitos puros); `tsc`/`eslint`/`vitest run` completos (134/134); verificação visual via Playwright — máscara aplica ao digitar, banco recebe só dígitos, edição e detalhe mostram formatado
    - _Requirements: —_
