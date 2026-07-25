# App Seguro

Plataforma SaaS B2B para corretoras de seguros de frotas no Brasil. Reconstrução do `fleet-auth-gate` a partir das specs em `docs/`, seguindo desenvolvimento orientado a spec (SDD): cada peça é documentada antes de ser implementada.

## Stack

- React 19 + React Router v7 (modo library, SPA client-side)
- Vite + TypeScript
- Tailwind CSS v4 (CSS-first) + shadcn/ui
- Supabase (Auth, Postgres, Storage, Edge Functions)

## Desenvolvimento

```bash
npm install
npm run dev
```

## Documentação

Ver `docs/` — specs de arquitetura, banco de dados e regras de negócio, escritas antes de cada etapa de implementação.
