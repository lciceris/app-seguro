# Design Document — drawer-contrast

## Overview

Três mudanças pontuais, nenhuma estrutural: 2 classes em `sheet.tsx` (componente compartilhado), remover 1 classe repetida em 25 arquivos, adicionar 1 classe repetida em 28 arquivos. Nenhum token novo em `globals.css` — `shadow-sm` e `bg-black/35` já existem como utilities padrão do Tailwind.

## Components and Interfaces

### 1. `sheet.tsx` — overlay e vão do topo

```diff
- "fixed inset-0 z-50 bg-black/10 duration-100 ..."
+ "fixed inset-0 z-50 bg-black/35 duration-100 ..."
```

```diff
- "data-[side=bottom]:inset-x-0 data-[side=bottom]:top-16 data-[side=bottom]:bottom-0 data-[side=bottom]:rounded-t-2xl data-[side=bottom]:border-t sm:data-[side=bottom]:top-28",
+ "data-[side=bottom]:inset-x-0 data-[side=bottom]:top-9 data-[side=bottom]:bottom-0 data-[side=bottom]:rounded-t-2xl data-[side=bottom]:border-t",
```

Único arquivo, mudança única — afeta todo drawer do sistema de uma vez (é o ponto do componente compartilhado).

### 2. Corpo sem `bg-muted` (25 arquivos)

Sweep mecânico: em cada arquivo, a linha do wrapper de corpo

```tsx
className="flex flex-1 flex-col gap-4 overflow-y-auto bg-muted p-5"
```

vira

```tsx
className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
```

Só essa linha por arquivo — outros usos de `bg-muted` no mesmo arquivo (upload de logo, preview) ficam como estão.

Lista dos 25: `client-detail-drawer`, `edit-client-drawer`, `create-client-drawer`, `brokerage-detail-drawer`, `edit-brokerage-drawer`, `create-brokerage-drawer`, `insurer-detail-drawer`, `create-insurer-drawer`, `edit-insurer-drawer`, `policy-detail-drawer`, `edit-policy-drawer`, `edit-user-drawer`, `user-detail-drawer`, `invite-user-drawer`, `create-vehicle-drawer`, `vehicle-detail-drawer`, `edit-vehicle-drawer`, `create-quotation-drawer`, `edit-quotation-drawer`, `quotation-vehicle-coverage-drawer`, `quotation-insurer-drawer`, `insurer-response-form`, `not-closed-reason-form`, `create-policy-endorsement-drawer`, `policy-endorsement-detail-drawer`.

### 3. Cards de seção com `shadow-sm` (28 arquivos = 25 acima + 3 sub-componentes)

Cada ocorrência de

```tsx
className="rounded-xl border border-border bg-card p-5"
```

(ou variante com classes extras no mesmo elemento, ex. `flex flex-col gap-4 rounded-xl border border-border bg-card p-5`) ganha `shadow-sm` no final. Mecânico, sem mudar mais nada da classe.

Os 3 sub-componentes adicionais (não têm o wrapper de corpo próprio, só cards): `policy-attachments-section.tsx`, `policy-endorsements-section.tsx`, `policy-vehicles-section.tsx`.

## Verificação de escopo negativo

Antes de fechar cada task, `grep` confirma que os 15 arquivos fora de escopo (`own-brokerage-screen`, `quotation-detail-screen` e suas abas, `login-screen`, `set-password-screen`, `account-deactivated-screen`, `insurer-catalog-screen`) continuam com `bg-card` sem `shadow-sm` e sem terem perdido nenhum `bg-muted` que não seja de drawer.

## Testing Strategy

- Nenhum teste de componente novo — mudança é só classe CSS, comportamento e texto não mudam. Rodar a suíte completa (`vitest run`) confirma que nada quebrou (nenhum teste deveria depender de classe CSS).
- Verificação visual real (Playwright efêmero): screenshot do drawer de cadastro de Corretoras (o caso que motivou a spec) e de mais 1 drawer de detalhe e 1 de edição de outra feature, confirmando overlay mais escuro, vão menor, corpo branco e cards com sombra.
