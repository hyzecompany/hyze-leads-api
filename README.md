# API de leads — api.hyzecompany.com.br

Recebe os formulários de todos os sites (`POST /v1/leads`), valida com Zod, confere o Turnstile no servidor, grava no D1 (Drizzle) e avisa no Telegram (opcional). CORS liberado só para `*.hyzecompany.com.br`.

```bash
pnpm install
pnpm dev   # http://localhost:8787 (precisa de .dev.vars e pnpm db:migrate:local)
pnpm test && pnpm check && pnpm lint
pnpm db:generate   # nova migração após mudar src/db/schema.ts
```

Guia completo do grupo (stack, identidade, deploy): [hyzecompany/.github → WORKSPACE.md](https://github.com/hyzecompany/.github/blob/main/WORKSPACE.md).
