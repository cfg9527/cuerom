# CueRoom

Redesign cues and friction in your physical and digital environments so better habits become the easy default. Bilingual **EN + ZH**. Hosted on **Vercel** with **Neon** Postgres and **Vercel Blob** for optional proof photos.

> Product emphasis: completable **setup tasks** (friction levers), not streak theater. No “Atomic Habits” branding.

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js App Router |
| Hosting | Vercel |
| Database | Neon Postgres + Drizzle ORM |
| Auth | **Auth.js (NextAuth v5) + Credentials + Neon** (Clerk preferred in plan; Clerk keys unavailable at scaffold time) |
| Proof photos | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |

## Features (MVP)

- Auth: register / sign in / sign out / delete account
- Schema: users, environments, habits, habit_environments, cues, friction_levers, check_ins, proof_photos (+ weekly_reviews table)
- **Today**: open setup tasks first; light check-ins second
- Habit + environment detail; mark lever planned → done
- Done flow: optional proof photo → bilingual encouragement
- Exactly **10** bilingual starter templates
- Settings: locale EN|中文, tip/support placeholder, delete account
- Weekly review (rules-based)

## Local setup

```bash
npm install
cp .env.example .env.local
# fill DATABASE_URL, AUTH_SECRET, optionally BLOB_READ_WRITE_TOKEN + NEXT_PUBLIC_TIP_URL
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required env vars

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon pooled Postgres URL |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000` or production URL) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob RW token (proof uploads; optional until you enable photos) |
| `NEXT_PUBLIC_TIP_URL` | Tip jar URL (placeholder OK) |

### Dashboard steps if credentials are missing

1. **Neon** — Create a project → copy the pooled connection string into `DATABASE_URL`.
2. **Vercel** — Import this repo → set the same env vars → deploy.
3. **Vercel Blob** — Project → Storage → create Blob store → copy `BLOB_READ_WRITE_TOKEN`.
4. **Tip link** — Replace `NEXT_PUBLIC_TIP_URL` with your Buy Me a Coffee (or similar) URL.
5. **Clerk (optional later)** — If you prefer Clerk, add Clerk keys and swap the Auth.js provider; schema already has `auth_provider_id`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Push schema / run migrations (`drizzle-kit push`) |
| `npm run db:studio` | Drizzle Studio |

## Design notes

- Visual direction: moss green + warm paper + copper accents; Fraunces + Manrope
- Home hero object: environments / open tasks — not a streak dashboard
- One job per screen; mobile-first

## Neon project (created at scaffold)

- Project name: `cuerom`
- Project id: `cold-hat-78980333` (console: [console.neon.tech](https://console.neon.tech))

Do not commit `.env.local` or any secrets.
