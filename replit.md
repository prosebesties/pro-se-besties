# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + wouter routing

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── pro-se-besties/     # React/Vite frontend (main app at /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Applications

### Pro Se Besties (`artifacts/pro-se-besties`) — served at `/`

A legal-tech platform helping people navigate workplace discrimination, harassment, retaliation, and wrongful termination.

**Pages:**
- `/` — Landing page with hero, how-it-works, features, testimonials, CTAs
- `/intake` — Multi-step intake form (4 steps)
- `/results/:id` — Case analysis results with summary, issue categories, next steps, attorney questions, agencies
- `/insights` — Legal Q&A from vetted contributors + submit a question
- `/referrals` — Filtered directory of lawyers, therapists, consultants, community resources

**Design:** Navy/black/white/red palette. Professional, trauma-aware tone. Mobile responsive.

### API Server (`artifacts/api-server`) — served at `/api`

Express 5 REST API.

**Routes:**
- `GET /api/healthz` — Health check
- `POST /api/intake` — Submit intake form (returns case analysis)
- `GET /api/intake/:id` — Retrieve intake result
- `GET /api/insights` — List all legal insight Q&As
- `GET /api/insights/featured` — Get featured insights
- `POST /api/insights` — Submit a question
- `GET /api/referrals` — List referrals (filter by `?category=lawyer|therapist|consultant|community`)
- `GET /api/referrals/categories` — Category summary with counts

## Database Schema (PostgreSQL)

### `intakes` — Intake form submissions and generated case analyses
- Stores user submission + AI-generated (currently rule-based) case summary, next steps, attorney questions, relevant agencies

### `insights` — Legal insight Q&As
- `contributor_name`, `contributor_title`, `is_featured` for curated responses
- New user questions come in with no answer (pending review)

### `referrals` — Referral directory
- Lawyers, therapists, pro se consultants, community resources
- `accepts_pro_se`, `sliding_scale` flags for badging

## AI Integration Points

The API server contains clear `// TODO: Replace with AI integration` comments where AI analysis should go:
- `artifacts/api-server/src/routes/intake.ts` — `generateCaseAnalysis()` function should call OpenAI/Claude for dynamic case analysis

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Codegen

Run codegen after OpenAPI changes:
```
pnpm --filter @workspace/api-spec run codegen
```

## Database

Push schema changes:
```
pnpm --filter @workspace/db run push
```
