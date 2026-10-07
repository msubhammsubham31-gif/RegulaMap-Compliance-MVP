# RegulaMap

RegulaMap is a demonstration compliance workspace for tracking sample regulations, regulatory changes, facility exposure, actions, deadlines, and risk.

## Run & Operate
- `pnpm --filter @workspace/regulamap run dev` — run the web preview
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push development database schema changes after schema edits
- Required env: `DATABASE_URL` for the PostgreSQL-backed API; Replit supplies `PORT` to the server

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React, Vite, Wouter, TanStack Query, Recharts
- API: Express 5 with generated OpenAPI client and Zod validation
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live
- `artifacts/regulamap/src/App.tsx` — RegulaMap routes, screens, and interactions
- `artifacts/regulamap/src/index.css` — application styling and responsive layouts
- `artifacts/api-server/src/routes/regulamap.ts` — RegulaMap API endpoints
- `artifacts/api-server/src/routes/regulamap-data.ts` — clearly labeled demonstration data and deterministic risk/assistant logic
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/db/src/schema/compliance-actions.ts` — persisted compliance-action schema

## Architecture decisions

- The assistant uses deterministic rules over workspace records; no LLM key or provider is required.
- The weighted risk score is deterministic and explainable: scope 15%, severity 25%, proximity 20%, obligation 15%, exposure 25%.
- The seeded regulation text and sources are simulated. Do not present them as authoritative or add fabricated official-source URLs.
- The demo login is an unprotected entry screen, not production authentication.
- Compliance-action creates and status changes are persisted through the API and PostgreSQL.

## Product

Users can review the dashboard, filter regulations, compare versions, inspect facilities and mapped jurisdictions, prioritize risks, create and complete compliance actions, track deadlines, ask evidence-bounded questions, and print a report.

## User preferences

The MVP must work without an external AI API key; a deterministic demonstration assistant is the first implementation.

## Gotchas

- Update `lib/api-spec/openapi.yaml` first, then run API code generation when changing API request/response shapes.
- Verify source claims against authoritative material before using the sample data for real compliance decisions.
- Action persistence requires a provisioned PostgreSQL `DATABASE_URL`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
