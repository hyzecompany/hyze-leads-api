# API de leads — api.hyzecompany.com.br

Faz parte do workspace Hyze (organização GitHub `hyzecompany`). **Leia primeiro o guia geral**:
`../CLAUDE.md` no PC do Gabriel, ou `WORKSPACE.md` no repositório `hyzecompany/.github`.
Ele traz o protocolo de trabalho em dupla (Claude no VS Code + Claude no Cowork), a stack, a
identidade visual e as convenções de animação.

## Este repositório

Recebe os formulários de todos os sites (`POST /v1/leads`), valida com Zod, confere o Turnstile no servidor, grava no D1 (Drizzle) e avisa no Telegram (opcional). CORS liberado só para `*.hyzecompany.com.br`.

## Comandos

```bash
pnpm install
pnpm dev   # http://localhost:8787 (precisa de .dev.vars e pnpm db:migrate:local)
pnpm test && pnpm check && pnpm lint
pnpm db:generate   # nova migração após mudar src/db/schema.ts
```

## Atenção

Mudança no schema = nova migração gerada (nunca edite migrações já aplicadas). Segredos só via `wrangler secret put`.

Ao terminar uma tarefa: registre no topo de `docs/HANDOFF.md`, commite (trailer `Agente: vscode`
ou `Agente: cowork`) e faça push (o Cowork não faz push — deixa anotado no HANDOFF).
