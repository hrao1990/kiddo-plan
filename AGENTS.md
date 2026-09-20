# AGENTS.md

## Project Structure

Two-package pnpm workspace:
- **Root** (`.`): Vue 3 SPA (frontend)
- **`worker/`**: Cloudflare Workers API (Hono + D1 + KV)

## Local Development

Requires **two terminals**:

```bash
# Terminal 1: Worker API (port 8787)
cd worker && pnpm dev

# Terminal 2: Frontend (port 5173)
pnpm dev
```

Vite proxies `/api` → `http://localhost:8787`. Do NOT run both `pnpm dev` in the root directory.

Worker auto-creates D1 tables and admin account on first request. Config in `worker/.dev.vars`:
- Admin: `admin` / `admin123`

## Build & Verify

```bash
# Frontend typecheck + build
pnpm build

# Worker typecheck only
cd worker && npx tsc --noEmit
```

Build order matters: `vue-tsc -b` runs before `vite build`.

## Key Commands

| Command | What it does |
|---------|-------------|
| `pnpm build` | Typecheck + build frontend |
| `cd worker && pnpm dev` | Start local API server |
| `pnpm dev` | Start Vite dev server |
| `cd worker && pnpm deploy` | Deploy Worker to Cloudflare |
| `pnpm deploy:pages` | Build + deploy to Cloudflare Pages |

## Tech Stack

- Vue 3 + Vite + Tailwind CSS 4 + ECharts + vue-i18n + Pinia
- Worker: Hono, Cloudflare D1 (SQLite), Cloudflare KV
- JWT auth via `hono/jwt` (not a separate package)

## Design Target

Mobile-first. All pages must work well on phones (320px-428px). Desktop layout is secondary.

## Conventions

- Date format: use `-` separator (YYYY-MM-DD), not `/`
- Date time format: YYYY-MM-DD HH:mm

## Gotchas

- `worker/.dev.vars` contains local secrets. Never commit it.
- `wrangler.toml` has placeholder `database_id` and `id`. Replace with real IDs before deploying.
- Local D1 is ephemeral (resets on worker restart). Schema auto-applies via `ensureSchema()` in `worker/src/index.ts`.
- Worker uses `--local` flag for dev (Miniflare). Real Cloudflare bindings only work after deploy.
- `@cloudflare/workers-types` provides `D1Database`, `KVNamespace` types for worker code only.
