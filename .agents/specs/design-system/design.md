# Design Document — design-system

## Overview

Essa spec não introduz uma paleta nova do zero — o levantamento em `src/styles/globals.css` mostrou que o sistema de tokens shadcn (`--background`, `--card`, `--border`, `--muted-foreground`, `--sidebar`, `--destructive`, tokens de status de cotação) **já existe e já bate** com a direção "denso e técnico" validada nos protótipos visuais (Opção A · Slate Azul, aprovada pelo usuário). O trabalho real é: (1) preencher as lacunas — não existe token genérico de sucesso/alerta, só o `--destructive` e os tokens específicos de status de cotação; ativo/inativo hoje é `bg-emerald-100 text-emerald-700` / `bg-slate-100 text-slate-500` copiado à mão em 6 lugares; (2) generalizar o grid de 2 colunas hoje só em `brokerages`; (3) extrair `DetailField` e a tabela como primitivos compartilhados; (4) ligar o `variant="destructive"` (que já existe no `Button` do shadcn) nas confirmações de desativação, que hoje usam o botão padrão.

## Design Tokens

### Cor — reconciliado com `globals.css`

| Token | Valor | Status |
|---|---|---|
| `--background` | `#F1F5F9` | ✅ já existe, mantém |
| `--foreground` | `#0F172A` | ✅ já existe, mantém |
| `--card` | `#FFFFFF` | ✅ já existe, mantém |
| `--border` | `#E2E8F0` | ✅ já existe, mantém |
| `--muted-foreground` | `#64748B` | ✅ já existe, mantém |
| `--sidebar` | `#0F172A` | ✅ já existe, mantém |
| `--primary` | `#4F46E5` (default; sobrescrito por corretora em runtime) | ✅ já existe, mantém — os protótipos usaram `#3B82F6` só como exemplo de contraste, a cor de verdade continua dinâmica |
| `--destructive` | `#EF4444` | ✅ já existe, mantém |
| `--status-*` (waiting/progress/negotiation/presented/effect/effected/notclosed) | já existem | ✅ mantém — específicos do fluxo de cotação, não mexer |

**Novos tokens (lacuna real, não existiam):**

| Token | Valor | Uso |
|---|---|---|
| `--success` | `#10B981` (emerald-500) | ponto de status ativo, ícone de sucesso |
| `--success-bg` | `#D1FAE5` (emerald-100) | fundo de badge "Ativo" |
| `--success-text` | `#047857` (emerald-700) | texto de badge "Ativo" — **mesmo valor já usado hoje hardcoded** em `brokerages-list-screen.tsx:111`, `users-list-screen.tsx:121`, `vehicles-list-screen.tsx:163` e os 3 detail-drawers equivalentes |
| `--neutral-bg` | `#F1F5F9` (slate-100) | fundo de badge "Inativo" |
| `--neutral-text` | `#64748B` (slate-500) | texto de badge "Inativo" — idem, já hardcoded nos mesmos 6 lugares |
| `--warning` | `#F59E0B` (amber-500) | ponto de alerta genérico (fora do fluxo de cotação) |
| `--warning-bg` | `#FFFBEB` | fundo de badge de alerta |
| `--warning-text` | `#B45309` | texto de badge de alerta |

Essas 3 famílias (`success`/`neutral`/`warning`) entram em `@theme inline` do `globals.css`, ao lado dos tokens já existentes — não substituem nada, só preenchem a lacuna. `--destructive` não precisa de token novo: já existe e o `Button`/`AlertDialogAction` do shadcn já sabem usá-lo via `variant="destructive"`.

### Tipografia

| Papel | Fonte | Status |
|---|---|---|
| Títulos (`font-sans`) | Plus Jakarta Sans Variable | ✅ já importada e configurada |
| Corpo/dado/tabela (`font-data`) | Inter Variable | ✅ já importada, já aplicada em `table` via `globals.css:143-145` |
| **Dado técnico** (CNPJ, IDs, datas em coluna de tabela) | **IBM Plex Mono** (nova) | ❌ não existe hoje — adição deliberada validada no protótipo, via `@fontsource-variable/ibm-plex-mono` (mesmo mecanismo de import já usado pras outras duas fontes) |

A fonte mono é aplicada só em células de tabela com dado técnico (CNPJ, telefone, CEP, datas, IDs) via uma classe utilitária nova (`font-mono tabular-nums`), não no corpo de texto geral — segue exatamente o que os protótipos mostraram.

### Espaçamento e densidade (Requirement 5)

| Elemento | Hoje | Proposto |
|---|---|---|
| Padding de card de seção (form) | `p-5` | mantém `p-5` — já é a densidade certa pro formulário, o que muda é o grid interno (Requirement 1), não o card em si |
| Linha de tabela (`td`/`th` padding) | `px-4 py-3` | `px-3 py-1.5` — mais compacto, valida o protótipo de listagem |
| Fonte de tabela | `text-sm` (14px) | `text-[12.5px]` |
| Header de tabela | `text-xs uppercase` | mantém, só reduz padding vertical |

## Components and Interfaces

### 1. Grid de formulário (Requirement 1)

Já implementado em `create-brokerage-drawer.tsx`/`own-brokerage-screen.tsx`/`edit-brokerage-drawer.tsx` — vira o padrão a generalizar:

```tsx
<div className="grid grid-cols-2 gap-3">
  <div className="col-span-2 flex flex-col gap-1.5">{/* campo largo: CNPJ, nome, endereço */}</div>
  <div className="flex flex-col gap-1.5">{/* campo curto, lado a lado */}</div>
  <div className="flex flex-col gap-1.5">{/* campo curto, lado a lado */}</div>
</div>
```

Migração mecânica por feature (sweep, mesmo modelo da spec `drawer-pattern`): trocar o wrapper de cada seção de `flex flex-col gap-4` (empilhado) pra `grid grid-cols-2 gap-3` (`col-span-2` nos campos que hoje são largura total: nome, textarea, select de item único, endereço/logradouro). Nenhuma mudança de nome de campo, validação ou ordem de tab.

### 2. `DetailField` compartilhado (Requirement 2)

Novo primitivo em `src/shared/components/ui/detail-field.tsx`:

```tsx
export function DetailField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
      <span className="text-sm text-foreground">{value ?? "Não informado"}</span>
    </div>
  );
}
```

Substitui as 6 cópias locais (`client-detail-drawer.tsx`, `vehicle-detail-drawer.tsx`, `insurer-detail-drawer.tsx`, `policy-detail-drawer.tsx`, `brokerage-detail-drawer.tsx`, `policy-endorsement-detail-drawer.tsx`) — a versão de `policy-endorsement-detail-drawer.tsx` tem `if (!value) return null` (esconde o campo); a migração corrige esse drift, alinhando com o comportamento das outras 5 (sempre mostra "Não informado").

### 3. Tabela compartilhada (Requirement 3)

Novo primitivo em `src/shared/components/ui/data-table.tsx` (nome a confirmar), cobrindo o markup hoje copiado em 7 telas: wrapper `rounded-xl border border-border bg-card overflow-hidden`, header `bg-muted`, linha com hover, skeleton de loading, estado vazio. Densidade nova (linha `px-3 py-1.5`, ver seção de tokens acima). Coluna de dado técnico usa `font-mono tabular-nums text-muted-foreground`.

Como as 7 telas têm colunas e ações completamente diferentes entre si, o primitivo não tenta abstrair "colunas configuráveis" (over-engineering pra 7 usos só) — é um conjunto de sub-componentes (`DataTable`, `DataTableHeader`, `DataTableRow`, `DataTableEmpty`, `DataTableSkeleton`) que cada tela compõe do jeito que já compõe hoje com `<table>`/`<thead>`/`<tbody>` cru, só que via componente em vez de HTML solto — mesma ideia do `Table`/`TableHeader`/`TableRow` que o shadcn já disponibiliza como primitivo (hoje não instalado no projeto).

### 4. Botão destrutivo (Requirement 4)

Não precisa de componente novo — `Button`/`AlertDialogAction` do shadcn já suportam `variant="destructive"` (usa o token `--destructive` já existente). A mudança é só de uso: todo `AlertDialogAction` de desativação/exclusão (`deactivate-client-confirm-dialog.tsx`, `deactivate-confirm-dialog.tsx` de users, `deactivate-vehicle-confirm-dialog.tsx`, e o de brokerages) ganha `variant="destructive"`.

### 5. Badge de status ativo/inativo

Troca o `bg-emerald-100 text-emerald-700` / `bg-slate-100 text-slate-500` hardcoded pelos tokens novos (`--success-bg`/`--success-text`/`--neutral-bg`/`--neutral-text`) nos 6 pontos já mapeados — mesma cor visual, agora como token.

## Error Handling

Não aplicável — essa spec é só de estilo/estrutura visual, não introduz fluxos novos de erro. A migração de tabela/DetailField preserva o comportamento de loading/erro já existente em cada tela (skeleton, mensagem de "não foi possível carregar", botão "tentar novamente").

## Testing Strategy

- **Componente (RTL)**: `DetailField` e o(s) componente(s) de tabela ganham teste próprio (renderização, "Não informado" pra valor nulo). Testes existentes das 7 telas de listagem e 6 telas de detalhe continuam passando sem alteração de asserção — são mudanças de implementação interna (markup via componente em vez de HTML cru), não de comportamento ou texto visível, exceto o fix do drift em `policy-endorsement-detail-drawer` (esse teste precisa de ajuste pra refletir "Não informado" em vez de campo ausente).
- **Visual**: verificação manual via screenshot real (Playwright) de pelo menos 1 tela de cada tipo migrada (1 listagem, 1 cadastro, 1 detalhe), comparando com os protótipos aprovados.
- **Fora do escopo automatizado**: comparação pixel-a-pixel com os protótipos HTML — são referência de direção, não superfície de teste.
