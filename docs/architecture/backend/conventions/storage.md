# Storage

> Buckets do Supabase Storage e convenção de path.

## Buckets

| Bucket | Acesso | Path | Conteúdo |
|---|---|---|---|
| `brokerage-assets` | Público | `{brokerage_id}/logo` | Logo da corretora |
| `avatars` | Público | `{user_id}/avatar` | Foto de perfil do usuário |
| `qar-attachments` | Privado | `{brokerage_id}/{quotation_id}/{filename}` | Anexos do questionário de análise de risco (QAR) por cotação |

## Público vs. privado

- **Público** (`brokerage-assets`, `avatars`) — precisam carregar sem fricção de autenticação (aparecem na sidebar, header, menus). Uma URL pública direta é suficiente — logo e avatar não são dado sensível.
- **Privado** (`qar-attachments`) — anexos de uma cotação são dado sensível da corretora. Acesso exige policy de RLS em `storage.objects`, seguindo o mesmo princípio de isolamento por `brokerage_id` da [ADR 001](../adr/001-multitenancy.md) — só que aplicado a arquivo, não a linha de tabela.

## Convenção de path

O primeiro segmento do path é sempre o identificador que ancora o isolamento (`brokerage_id` ou `user_id`). Isso permite que a policy de RLS de storage extraia esse segmento do path e compare com `get_my_brokerage_id()`/`auth.uid()` (ver [ADR 002](../adr/002-security-definer-rls.md)), sem depender de uma tabela auxiliar de metadados para saber a quem cada arquivo pertence.
