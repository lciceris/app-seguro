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

## Drawer — overlay, corpo e cards de seção

O corpo do drawer (`overflow-y-auto`) **não leva `bg-muted`** — fica branco, herdando o `bg-popover` do `SheetContent`. Cada seção se destaca do corpo branco só por borda + `shadow-sm`, nunca por diferença de cor de fundo (decidido em `.agents/specs/drawer-contrast/`, validado com o usuário via protótipo interativo antes de implementar — overlay `bg-black/35` e vão do topo `top-9`, ambos já no `sheet.tsx`, não precisam ser repetidos por tela).

## Formulários — grid de 2 colunas

Todo formulário de cadastro/edição usa uma seção-card com um grid interno de 2 colunas. Campo curto (texto curto, número, telefone, CEP, UF) fica lado a lado; `Select`, `Textarea` e campo de texto longo (nome, endereço) ocupam a linha inteira.

```tsx
<div className="rounded-xl border border-border bg-card shadow-sm p-5">
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

O `shadow-sm` só se aplica a cards de seção **dentro de um drawer** (`Sheet`). Páginas cheias que usam o mesmo card de seção (ex: `own-brokerage-screen`, `quotation-detail-screen`) mantêm sem sombra — lá o fundo da página já é `--background` (cinza claro), então a borda sozinha já basta pra destacar o card branco.

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

## Listagens — contador e busca

Toda listagem SEMPRE tem um contador de itens abaixo do `<h1>`, e SEMPRE tem busca quando a lista puder crescer além de ~10-15 itens (na prática, todas as 7 listagens hoje). Sem abstração compartilhada — cada tela escreve seu próprio texto (singular/plural, gênero do substantivo variam por entidade) e sua própria busca client-side via `useMemo`.

```tsx
const [search, setSearch] = useState("");

const filteredItems = useMemo(() => {
  if (!items) return items;
  const query = normalize(search.trim());
  if (!query) return items;
  return items.filter((item) => normalize(item.name).includes(query));
}, [items, search]);

const totalCount = items?.length ?? 0;
const filteredCount = filteredItems?.length ?? totalCount;
```

```tsx
<div className="mb-4 flex items-center justify-between">
  <div>
    <h1 className="text-lg font-semibold text-foreground">Título</h1>
    {!isLoading && items && (
      <p className="text-xs text-muted-foreground">
        {filteredCount !== totalCount
          ? `${filteredCount} de ${totalCount} itens`
          : totalCount === 1
            ? "1 item cadastrado"
            : `${totalCount} itens cadastrados`}
      </p>
    )}
  </div>
  <Button asChild>{/* criar */}</Button>
</div>

<div className="mb-4 relative max-w-sm">
  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="pl-9" />
</div>
```

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
