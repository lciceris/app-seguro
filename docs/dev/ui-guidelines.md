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
| Todo o projeto (títulos, corpo, formulário, tabela, menu) | Plus Jakarta Sans (`font-sans`, padrão do `html`) | tudo, por herança — não precisa de classe |
| Dado técnico em tabela (CNPJ, telefone, CEP, número de cotação/apólice, data, ID) | IBM Plex Mono (`font-mono-data`) | `<TableCell className="font-mono-data">` |

> Até a spec `sidebar-flat-nav`/`project-font-unify`, corpo/tabela usavam Inter (`font-data`). O projeto unificou em uma fonte só (Plus Jakarta Sans) — Inter foi removida (`@fontsource-variable/inter` desinstalada). `font-mono-data` (IBM Plex Mono) continua à parte por ser uma escolha deliberada de alinhamento tabular para dado técnico, não uma fonte de UI geral.

## Drawer de cadastro/edição — padrão obrigatório

Todo drawer novo (`Sheet`/`SheetContent`) segue esta estrutura sem exceção — é o padrão fechado nas specs `drawer-pattern` → `design-system` → `drawer-contrast` → `drawer-layout-refinements`, validado com o usuário via protótipo interativo antes de cada mudança:

- Abre de baixo pra cima, ocupa a tela inteira: overlay `bg-black/35`, vão do topo `top-9` — ambos já embutidos em `sheet.tsx`, nunca repetir por tela.
- **Corpo cinza claro** (`bg-background`), nunca `bg-muted` (quase idêntico ao branco, foi o problema original) — o elemento com `overflow-y-auto` não leva `max-w` nem padding direto: o scroll nasce na borda real da tela.
- Conteúdo (título do header, cards do corpo, botões do footer) sempre centralizado na mesma coluna: `max-w-[720px]` em cadastro/edição (`size` padrão), `max-w-[1000px]` em detalhe (`size="lg"`). `SheetHeader`/`SheetFooter` já centralizam sozinhos — o corpo é o único pedaço que cada drawer monta à mão.
- Cards de seção com `shadow-sm` (não só borda) — é o que os destaca do corpo cinza.
- X do header sempre no canto absoluto da tela, nunca alinhado à coluna — convenção universal de "fechar" (decisão registrada em `drawer-layout-refinements`, não alterar sem motivo novo).

Template de um drawer de cadastro:

```tsx
<Sheet open onOpenChange={(open) => !open && handleClose()}>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Novo X</SheetTitle>
    </SheetHeader>

    <form
      id="create-x-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex-1 min-h-0 overflow-y-auto bg-background"
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-5">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card shadow-sm p-5">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Identificação
          </p>
          {/* grid de 2 colunas — ver seção "Formulários" abaixo */}
        </div>
      </div>
    </form>

    <SheetFooter className="flex-row justify-end">
      <Button variant="outline" onClick={handleClose}>
        Cancelar
      </Button>
      <Button type="submit" form="create-x-form">
        Criar
      </Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

Drawer de detalhe (`<SheetContent size="lg">`): mesma estrutura, `<div>` no lugar de `<form>`, `max-w-[1000px]` no wrapper interno do corpo, `DetailField` no lugar de `Label`+`Input`.

`SheetHeader`/`SheetFooter` já cuidam de fundo (`bg-card`), borda (`border-b`/`border-t`) e recentralização do conteúdo — não adicionar `border`/`bg` de novo por cima; o `className` de call-site é só pro alinhamento interno (`flex-row justify-end`, `flex-row items-center justify-between`, etc.).

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

## Listagens — padrão de página obrigatório

Toda tela de listagem segue esta estrutura sem exceção — definida e validada com o usuário via protótipo interativo (2 rodadas de exploração + ajuste fino) em `.agents/specs/list-page-panel/`, com Corretoras como tela de validação:

- Título+contador+botão, busca/filtro e a `Table` inteira ficam dentro de **um único painel branco** (`rounded-2xl border border-border bg-card shadow-sm p-5`) — o cinza da página (`--background`) vira só uma moldura ao redor, não aparece entre os blocos internos.
- A `Table` continua com seu próprio container (borda + cantos arredondados) por dentro do painel — isso já é nativo do primitivo, não precisa de wrapper extra.
- Header da tabela com fundo `#E9EDF2` (mais escuro que o corpo do painel, pra se destacar) e hover de linha suave (`bg-background/30`) — ambos já embutidos em `table.tsx`, não repetir por tela.
- `Outlet` (drawer de rota aninhada) e diálogos de confirmação ficam **fora** do painel — são overlays, não conteúdo de página.
- Contador de itens sempre abaixo do `<h1>`; busca sempre que a lista puder crescer além de ~10-15 itens (na prática, todas as 7 listagens hoje). Sem abstração compartilhada pra isso — cada tela escreve seu próprio texto (singular/plural varia por entidade) e sua própria busca client-side via `useMemo`.

Template completo:

```tsx
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  TableEmptyState, TableErrorState, TableSkeletonRow,
} from "@/shared/components/ui/table";

const [search, setSearch] = useState("");

const filteredItems = useMemo(() => {
  if (!items) return items;
  const query = normalize(search.trim());
  if (!query) return items;
  return items.filter((item) => normalize(item.name).includes(query));
}, [items, search]);

const totalCount = items?.length ?? 0;
const filteredCount = filteredItems?.length ?? totalCount;

return (
  <div className="p-6">
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
    </div>

    <Outlet />
  </div>
);
```

`Table` não tenta abstrair "colunas configuráveis" — cada tela compõe o próprio conjunto de `TableHead`/`TableCell`. Coluna de dado técnico leva `font-mono-data`.

## Botões — hierarquia

| Papel | Como |
|---|---|
| Primário (criar, salvar) | `<Button>` padrão (usa `--primary`, dinâmico) |
| Secundário (cancelar) | `<Button variant="outline">` |
| Ação de linha de tabela (ver/editar) | `<Button variant="ghost" size="icon-sm">` + ícone + `Tooltip` |
| **Destrutivo** (desativar, excluir) | `<AlertDialogAction variant="destructive">` — nunca o botão padrão pra uma ação que não pode ser desfeita de forma trivial |

## Empty states e loading

Texto de vazio segue o padrão `"Nenhum X encontrado/cadastrado"` (busca vs. lista realmente vazia têm mensagens diferentes — ver `TableEmptyState`). Loading usa `TableSkeletonRow`/`Skeleton`, nunca spinner de página inteira pra uma lista.
