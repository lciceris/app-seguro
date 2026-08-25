# Design Document — list-screens-density

## Overview

Essa spec não cria nenhum primitivo novo — reaproveita 100% do que a spec `design-system` já deixou pronto (`Table`, `font-mono-data`, `Input` de busca, `Select` de filtro, padrão de `TableEmptyState` com mensagem distinta pra busca vazia). O trabalho é mecânico e por tela: adicionar um contador de itens, adicionar busca onde falta, e adicionar colunas com dado que **já chega ao componente** (via `select("*")` ou embed já existente) mas nunca é renderizado.

Não existe abstração compartilhada pro contador — cada tela tem substantivo/gênero diferente ("corretora" fem., "cliente" masc.), então generalizar isso num componente exigiria uma API de pluralização (singular/plural + gênero) pra 7 usos só, over-engineering pelo mesmo motivo já documentado em `design-system/design.md` pra tabela. Cada tela escreve sua própria linha de contador, seguindo o mesmo template textual.

## Padrão: contador no cabeçalho (Requirement 1)

Vai no lugar do `<h1>` sozinho, como um `<p>` logo abaixo:

```tsx
<div className="mb-4 flex items-center justify-between">
  <div>
    <h1 className="text-lg font-semibold text-foreground">Corretoras</h1>
    {!isLoading && brokerages && (
      <p className="text-xs text-muted-foreground">
        {search && filteredBrokerages.length !== brokerages.length
          ? `${filteredBrokerages.length} de ${brokerages.length} corretoras`
          : brokerages.length === 1
            ? "1 corretora cadastrada"
            : `${brokerages.length} corretoras cadastradas`}
      </p>
    )}
  </div>
  <Button asChild>...</Button>
</div>
```

Texto por tela (singular / plural, concordância de gênero):

| Tela | Singular | Plural |
|---|---|---|
| Clientes | "1 cliente cadastrado" | "N clientes cadastrados" |
| Veículos | "1 veículo cadastrado" | "N veículos cadastrados" |
| Cotações | "1 cotação cadastrada" | "N cotações cadastradas" |
| Seguradoras | "1 seguradora cadastrada" | "N seguradoras cadastradas" |
| Apólices | "1 apólice emitida" | "N apólices emitidas" |
| Usuários | "1 usuário cadastrado" | "N usuários cadastrados" |
| Corretoras | "1 corretora cadastrada" | "N corretoras cadastradas" |

("Apólices" usa "emitida(s)" em vez de "cadastrada(s)" pra bater com a mensagem de vazio já existente, "Nenhuma apólice emitida ainda.".)

Nas 4 telas que já têm busca/filtro (Clientes, Veículos, Cotações, Apólices), o contador usa a lista já filtrada (`filteredX.length`) vs. o total bruto — reaproveita o `useMemo` que cada uma já tem, sem estado novo.

## Padrão: busca nas telas que não têm (Requirement 2)

Mesmo markup e comportamento já usado em `policies-list-screen.tsx`/`clients-list-screen.tsx` (`Input` com ícone `Search` absoluto, filtro client-side via `useMemo` + `normalize()` — a função `normalize` (lowercase + remove acento) já existe local em pelo menos 2 telas; nesta spec cada tela nova que ganhar busca replica a mesma função local, sem extrair pra `shared/lib` — mesmo padrão de duplicação pequena e deliberada já aceito no projeto pra esse helper específico).

```tsx
const [search, setSearch] = useState("");

const filteredInsurers = useMemo(() => {
  if (!insurers) return insurers;
  const query = normalize(search.trim());
  if (!query) return insurers;
  return insurers.filter(
    (insurer) =>
      normalize(insurer.name).includes(query) || normalize(insurer.cnpj ?? "").includes(query),
  );
}, [insurers, search]);
```

```tsx
<div className="mb-4 flex items-center gap-3">
  <div className="relative max-w-sm flex-1">
    <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      placeholder="Buscar por nome ou CNPJ"
      className="pl-9"
    />
  </div>
</div>
```

Campos de busca por tela:
- **Seguradoras**: nome + `cnpj`.
- **Usuários**: `full_name` + `email`.
- **Corretoras**: `name` + `tax_id`.

`TableEmptyState` ganha a segunda mensagem condicional (já é o padrão em Clientes/Policies): "Nenhum X encontrado pra essa busca" quando `search` não é vazio, vs. a mensagem de lista realmente vazia.

## Padrão: colunas novas (Requirement 3)

### Corretoras — `brokerages-list-screen.tsx`

Novas colunas entre "Nome" e "Plano": CNPJ (mono, `formatCnpj`) e "Criada em" (mono, `toLocaleDateString("pt-BR")` — mesmo padrão de formatação local já usado em `policies-list-screen.tsx:53-56`, sem introduzir date-fns nessa camada de exibição).

```tsx
<TableCell className="font-mono-data text-muted-foreground">
  {brokerage.tax_id ? formatCnpj(brokerage.tax_id) : "—"}
</TableCell>
<TableCell className="font-mono-data text-muted-foreground">
  {new Date(brokerage.created_at).toLocaleDateString("pt-BR")}
</TableCell>
```

Header vira: Nome, CNPJ, Criada em, Plano, Status, Ações. `TableSkeletonRow cells={4}` vira `cells={6}`, `colSpan={4}` dos estados vazio/erro vira `colSpan={6}`.

### Seguradoras — `insurers-list-screen.tsx`

Uma coluna "Contato" entre CNPJ e Ações, com fallback `contact_name ?? phone ?? email ?? "—"` (mesmo padrão de fallback em cadeia já usado no projeto, ex. `client.trade_name` em outros lugares). Não formata telefone com `formatPhone` aqui porque o dado já vem formatado da criação (mesmo padrão de outras colunas desta tela). Não é `font-mono-data` — não é dado técnico tabular, é texto livre (nome ou e-mail).

```tsx
<TableCell className="text-muted-foreground">
  {insurer.contact_name ?? insurer.phone ?? insurer.email ?? "—"}
</TableCell>
```

Header vira: Nome, CNPJ, Contato, Ações. `cells`/`colSpan` de 3 vira 4.

### Apólices — `policies-list-screen.tsx`

O embed `quotations(id, number)` já é buscado em `list-policies.ts` mas descartado. Vira sub-linha da coluna "Número", mesmo padrão de sub-cell já usado em `clients-list-screen.tsx:130-132` (nome principal + `<span className="block text-xs text-muted-foreground">`):

```tsx
<TableCell className="font-mono-data text-foreground">
  {policy.policy_number ?? "Pendente de emissão"}
  {policy.quotations?.number && (
    <span className="block text-xs font-mono-data text-muted-foreground">
      Cotação {policy.quotations.number}
    </span>
  )}
</TableCell>
```

Nenhuma coluna nova (a sub-linha cabe na coluna existente) — `colSpan`/`cells` não mudam.

## Testing Strategy

- **Componente**: nenhum teste de componente novo — não há primitivo novo, só uso de `Input`/`Table`/`formatCnpj` já testados/usados em outros lugares.
- **Testes existentes**: telas com teste de componente hoje (verificar `*.test.tsx` de cada uma das 7) precisam de ajuste pontual se algum assert depender do `colSpan` numérico ou contarem células por linha — checar e corrigir caso a caso durante a implementação, não é esperado nenhuma quebra de comportamento.
- **E2E**: os specs em `e2e/*-create.spec.ts`/`*-isolation.spec.ts` que hoje fazem asserção de texto de linha da tabela (`page.getByText(nome)`) continuam válidos — nenhuma coluna existente é removida ou renomeada, só adicionada. Ajustar/adicionar asserção pontual pra cobrir o contador e a busca nova onde fizer sentido (ex: `brokerages-create.spec.ts` já visita `/brokerages` — pode confirmar o contador aparece).
- **Visual**: mesmo padrão da spec anterior — screenshot real (Playwright efêmero) da tela de Corretoras (a que motivou a spec) confirmando as 2 colunas novas, contador e comparação com o protótipo aprovado.
