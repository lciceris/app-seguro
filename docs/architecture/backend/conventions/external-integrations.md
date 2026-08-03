# Integrações Externas e Configuração

## APIs externas

- **BrasilAPI** (consulta de CNPJ) — usada no cadastro/edição de cliente PJ, pra preencher automaticamente razão social/endereço a partir do CNPJ digitado. Chamada direto do navegador (API pública, sem chave secreta) — não precisa de Edge Function nem passa pelo Supabase.
- **ViaCEP** (consulta de CEP) — mesma lógica, preenche endereço a partir do CEP. Usado em mais de um formulário (cliente, dados da corretora) — candidato natural a `shared/lib/via-cep/` no frontend (ver `folder-structure.md` do frontend), diferente da consulta de CNPJ, que é específica do cadastro de cliente.

Essas duas integrações existiam no `fleet-auth-gate` original mas a própria documentação de lá as marcava como "não confirmadas" — tratar como ponto de partida a validar quando a feature de clientes for implementada, não como fato já testado.

## E-mail (SMTP/Resend)

Configurado no nível do projeto Supabase (Auth → SMTP customizado), não em código da aplicação. Usado para:
- E-mail de convite (disparado pela Edge Function `invite-user`, ver [`edge-functions.md`](edge-functions.md)).
- E-mail de redefinição de senha.

Isso é configuração de infraestrutura do projeto Supabase, não faz parte do código do frontend.

### TODO — ainda não configurado no projeto novo

O SMTP sandbox padrão do Supabase rejeita domínios de teste e tem rate limit agressivo — insuficiente mesmo pra validar manualmente. Precisa configurar SMTP customizado (Resend) no dashboard do projeto (Auth → SMTP Settings) antes de qualquer envio real funcionar.

**Specs que dependem disso e já documentam a limitação nas notas de verificação do próprio `tasks.md`** (a lógica de negócio em si está implementada e verificada — só o envio de fato não foi confirmado):
- `.agents/specs/users/tasks.md` — Tasks 2, 5 e 10 (convite de usuário).
- `.agents/specs/auth/tasks.md` — fluxo de "definir senha no primeiro acesso" depende do link de convite chegar por e-mail.

Quando configurar: refazer a verificação manual de convite ponta a ponta (convite → e-mail chega → definir senha → login) e atualizar as notas "Não verificado" desses `tasks.md` para refletir a confirmação.

## Variáveis de ambiente

| Variável | Onde vive | Público? |
|---|---|---|
| `VITE_SUPABASE_URL` | `.env` do frontend | Sim — só identifica o projeto, seguro expor |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env` do frontend | Sim — chave anônima, respeita RLS |
| Service role key | Secret da Edge Function (nunca no frontend) | **Nunca** — ver [ADR 003](../adr/003-edge-functions-scope.md) |

Prefixo `VITE_` é o que o Vite expõe ao bundle do cliente — qualquer variável sem esse prefixo não chega ao frontend (e é assim que a service role key fica de fora por padrão, não só por convenção).
