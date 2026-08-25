# UI Guidelines

> Design system e padrões de componentes visuais.
> Direção: **denso e técnico** (referência Supabase/Retool) — mais informação por tela, densidade compacta, sem abrir mão de hierarquia clara. Definido e implementado em `.agents/specs/design-system/`.

## Tokens de cor

Tudo em `src/styles/globals.css`, exposto via `@theme inline` (Tailwind v4) — usar sempre como utility (`bg-success-bg`, `text-destructive` etc.), nunca cor solta (`bg-emerald-100`).

| Token | Uso |
|---|---|
| `--background` / `--card` / `--border` / `--muted-foreground` | superfícies e texto neutro |
| `--primary` | cor de destaque — **dinâmica por corretora**, nunca hardcode um azul/indigo específico |
| `--destructive` | ações destrutivas (ver seção Botões) |
| `--success` / `--success-bg` / `--success-text` | estado "ativo" |
| `--neutral-bg` / `--neutral-text` | estado "inativo" |
| `--warning` / `--warning-bg` / `--warning-text` | alerta genérico fora do fluxo de cotação |
| `--status-*` (waiting/progress/negotiation/presented/effect/effected/notclosed) | específicos do badge de status de cotação — não reaproveitar fora desse contexto |

```tsx
<Badge variant="outline" className="border-transparent bg-success-bg text-success-text">Ativo</Badge>
```

## Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| Títulos de página/drawer | Plus Jakarta Sans (`font-sans`, padrão) | `<h1>`, `<SheetTitle>` |
| Corpo, formulário, tabela | Inter (`font-data`) | aplicado automaticamente em `<table>` |
| Dado técnico em tabela (CNPJ, telefone, CEP, número de cotação/apólice, data, ID) | IBM Plex Mono (`font-mono-data`) | `<TableCell className="font-mono-data">` |

## Formulários — grid de 2 colunas

Todo formulário de cadastro/edição usa uma seção-card com um grid interno de 2 colunas. Campo curto (texto curto, número, telefone, CEP, UF) fica lado a lado; `Select`, `Textarea` e campo de texto longo (nome, endereço) ocupam a linha inteira.

```tsx
<div className="rounded-xl border border-border bg-card p-5">
  <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
    Identificação
  </p>
  <div className="grid grid-cols-2 gap-3">
    <div className="col-span-2 flex flex-col gap-1.5">
      <Label htmlFor="name">Nome *</Label>
      <Input id="name" {...register("name")} />
    </div>
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="phone">Telefone</Label>
      <Input id="phone" {...register("phone")} />
    </div>
  </div>
</div>
```

Campo obrigatório sempre leva `*` no label (`"CNPJ *"`), além da mensagem de erro inline abaixo do campo.

## Telas de detalhe — `DetailField`

Nunca reimplemente o par label/valor à mão — use o primitivo compartilhado:

```tsx
import { DetailField } from "@/shared/components/ui/detail-field";

<DetailField label="Nome fantasia" value={client.trade_name} />
```

Mostra `"Não informado"` pra valor nulo/vazio — nunca esconde o campo.

## Tabelas — primitivo compartilhado

```tsx
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmptyState, TableErrorState, TableSkeletonRow,
} from "@/shared/components/ui/table";

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead className="text-right">Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {isLoading && Array.from({ length: 3 }).map((_, i) => <TableSkeletonRow key={i} cells={2} />)}
    {isError && !isLoading && (
      <TableErrorState colSpan={2} message="Não foi possível carregar." onRetry={refetch} />
    )}
    {!isLoading && !isError && items?.length === 0 && (
      <TableEmptyState colSpan={2} message="Nenhum item cadastrado ainda." />
    )}
    {items?.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell className="text-right">{/* ações */}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

Não tenta abstrair "colunas configuráveis" — cada tela compõe o próprio conjunto de `TableHead`/`TableCell`. Coluna de dado técnico leva `font-mono-data`.

## Botões — hierarquia

| Papel | Como |
|---|---|
| Primário (criar, salvar) | `<Button>` padrão (usa `--primary`, dinâmico) |
| Secundário (cancelar) | `<Button variant="outline">` |
| Ação de linha de tabela (ver/editar) | `<Button variant="ghost" size="icon-sm">` + ícone + `Tooltip` |
| **Destrutivo** (desativar, excluir) | `<AlertDialogAction variant="destructive">` — nunca o botão padrão pra uma ação que não pode ser desfeita de forma trivial |

## Empty states e loading

Texto de vazio segue o padrão `"Nenhum X encontrado/cadastrado"` (busca vs. lista realmente vazia têm mensagens diferentes — ver `TableEmptyState`). Loading usa `TableSkeletonRow`/`Skeleton`, nunca spinner de página inteira pra uma lista.

## Drawers

Ver `.agents/specs/drawer-pattern/` — abrem de baixo pra cima, ocupam a tela inteira, conteúdo centralizado (720px cadastro/edição, 1000px visualização).
