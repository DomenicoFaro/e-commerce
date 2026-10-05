# Shop House Giarre — e-commerce

Negozio online di Shop House Giarre (casalinghi, tessile casa, intimo, cura persona): spedizione in tutta Italia o ritiro gratuito in negozio.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind + shadcn/ui · Supabase (Postgres, Auth, Storage) · Stripe · Resend.

## Setup

```bash
npm install
cp .env.example .env.local   # poi compila le variabili
npm run dev                  # http://localhost:3000
```

Variabili principali in `.env.local` (mai committare questo file):

| Variabile | Dove trovarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chiave *publishable* (`sb_publishable_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | chiave *secret* (`sb_secret_…`), solo lato server |
| `STRIPE_*`, `RESEND_API_KEY` | dashboard Stripe / Resend |

Senza `NEXT_PUBLIC_SUPABASE_URL` il sito parte comunque (il middleware salta la sessione).

## Database

Schema e regole di accesso (RLS) in `supabase/migrations/`, dati demo in `supabase/seed.sql`.

```bash
npx supabase link --project-ref <ref>   # collega il progetto remoto
npx supabase db push                    # applica le migration
npm run db:reset                        # locale: migration + seed (richiede Docker)
npm run db:types                        # rigenera src/types/database.ts
```

## Script

- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript
- `npm run build` — build di produzione

## Struttura

- `src/app/` — pagine (home in `src/app/page.tsx`)
- `src/components/layout/` — Header e Footer
- `src/lib/supabase/` — client browser, server e service role
- `src/lib/utils.ts` — `cn()` per shadcn/ui (`components.json`)
- `src/types/database.ts` — tipi del database
