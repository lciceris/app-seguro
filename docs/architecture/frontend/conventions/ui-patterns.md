# UI Patterns

> Como tratar de forma consistente os estados recorrentes de interface: loading, skeleton, empty state, error state, retry, toast, confirm dialog e success feedback. Documento único — não criar um arquivo por padrão.

Os componentes reutilizáveis por trás desses padrões (skeleton wrapper, empty state, confirm dialog) vivem em `shared/components/` (ver [`folder-structure.md`](folder-structure.md)), já que são usados por 2+ features — mas a criação desses componentes em si é implementação, não faz parte deste documento.

## Loading

Dois casos distintos, tratados diferente:
- **Carregamento inicial de dados** (query sem cache ainda, `isLoading` do React Query) → Skeleton (ver abaixo), não spinner.
- **Ação em andamento** (submit de formulário, clique num botão) → o próprio botão fica desabilitado com indicador de loading (`mutation.isPending`, ver [`forms.md`](forms.md)). Nunca bloquear a tela inteira para uma ação pontual.

## Skeleton

Usado no carregamento inicial de listas e telas de detalhe — placeholders com a forma aproximada do conteúdo final, não um spinner genérico centralizado. Não usar skeleton para atualizações em background (quando já existe dado em cache e o React Query está revalidando) — nesse caso o conteúdo antigo permanece visível.

## Empty State

Quando uma query retorna zero resultados. Distinguir dois casos:
- **Genuinamente vazio** (ex. corretora ainda não tem nenhum cliente cadastrado) → mensagem + call-to-action pra criar o primeiro registro.
- **Sem resultado para o filtro atual** (ex. busca não encontrou nada) → mensagem diferente, sugerindo limpar/ajustar os filtros, sem oferecer o CTA de criação.

## Error State

Quando uma **query** falha (`isError` do React Query) — diferente de erro de validação de formulário (inline por campo, ver [`forms.md`](forms.md)) e de erro de mutation (toast, ver abaixo). Mostrar uma mensagem de erro no próprio lugar onde o conteúdo apareceria, com ação de retry — nunca deixar a área simplesmente em branco nem só um toast que desaparece.

## Retry

A ação do Error State: botão "Tentar novamente" chamando `refetch()` da query (ver [`react-query.md`](react-query.md)). Não é retry automático — o usuário decide quando tentar de novo.

## Toast

Biblioteca: `sonner` (já é dependência do projeto). Usado para:
- Sucesso de mutation (ver [`forms.md`](forms.md)).
- Erro de mutation não atribuível a um campo específico (ver [`forms.md`](forms.md)).
- Feedback de ações rápidas fora de formulário (ex. alternar status numa lista).

**Não** usado para: erro de validação de campo (inline) nem erro de carregamento de query (Error State inline, porque precisa ficar visível até o usuário agir, não sumir sozinho).

## Confirm Dialog

Para ações destrutivas ou irreversíveis (excluir, desativar, recusar/cancelar uma cotação) — sempre confirmar antes de executar, usando o `AlertDialog` do shadcn.

Isso **não** contradiz a regra de nunca abrir `Dialog` dentro de um `Drawer` (ver [ADR 002](../adr/002-feature-first.md) / `folder-structure.md`): aquela regra é sobre não aninhar um fluxo de formulário dentro de outro fluxo de formulário — usar navegação interna nesse caso. Uma confirmação simples de sim/não para uma ação destrutiva disparada de dentro de um drawer é um caso diferente e pode usar `AlertDialog` normalmente.

## Success Feedback

Toast de sucesso (ver acima) é o padrão geral, tanto para submits de formulário quanto para ações rápidas fora de formulário. Não há um padrão visual adicional além do toast — não usar banners de sucesso persistentes nem redirecionar a página só para mostrar uma mensagem.
