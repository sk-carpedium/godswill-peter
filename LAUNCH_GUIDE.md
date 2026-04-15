# Nexus Social — Complete Launch Guide

## What's in this package

```
nexus-v8/
├── src/                          ← Express backend (Node.js + TypeScript)
│   ├── api/base44Client.js       ← Frontend SDK (drop into your frontend)
│   ├── middleware/auth.ts        ← JWT auth with proper error format
│   ├── modules/                  ← Feature modules (ai, posts, oauth, etc.)
│   ├── router.ts                 ← 239 HTTP routes
│   └── jobs/index.ts             ← Background jobs (publishing, sync, etc.)
├── prisma/schema.prisma          ← 45 database models
├── prisma/seed.ts                ← Full DB seed (`npm run db:seed`)
├── frontend-lib/                 ← Drop into frontend src/lib/
│   ├── AuthContext.jsx
│   ├── AppearanceContext.jsx
│   ├── NavigationTracker.jsx
│   ├── query-client.js
│   └── app-params.js
├── frontend-src/                 ← Complete frontend source
│   ├── App.jsx                   ← Root app component
│   ├── pages.config.jsx          ← Route → component mapping
│   ├── utils.js                  ← createPageUrl, formatNumber, etc.
│   ├── permissions.js            ← Role-based access control
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── index.html
│   ├── .env.example
│   ├── src/
│   │   ├── main.jsx
│   │   └── index.css
│   ├── components/               ← 156 fixed components (0 stubs)
│   │   ├── agency/
│   │   ├── ai/
│   │   ├── analytics/
│   │   ├── content/
│   │   ├── dashboard/
│   │   ├── inbox/
│   │   ├── listening/
│   │   ├── monetization/
│   │   └── ...21 folders total
│   └── hooks/                    ← 7 custom React Query hooks
│       ├── useWorkspace.js
│       ├── usePosts.js
│       ├── useAnalytics.js
│       ├── useConversations.js
│       ├── useMonetization.js
│       ├── useSocialListening.js
│       └── index.js
├── .env.example                  ← Backend environment variables
├── Dockerfile
├── docker-compose.yml
└── API_REFERENCE.md
```

---

## Backend Setup (5 minutes)

```bash
cd nexus-v8

# 1. Copy and fill environment variables
cp .env.example .env
# Minimum required:
#   JWT_SECRET=<random 64 char string>
#   ENCRYPTION_KEY=<random 64 char hex>
#   DATABASE_URL=postgresql://postgres:password@localhost:5432/nexus
# Optional (enables real features):
#   OPENAI_API_KEY, STRIPE_SECRET_KEY, AWS_ACCESS_KEY_ID, etc.

# 2. Start PostgreSQL + Redis
docker compose up postgres redis -d

# 3. Install and migrate
npm install
npm run db:migrate
npm run db:generate

# 4. Start the server
npm run dev
# → http://localhost:4000/v1
# → http://localhost:4000/v1/app/public-settings (verify it works)

# 5. (Optional) Load demo data — see “Database seed” below
npm run db:seed
```

---

## Database seed

The repo includes `prisma/seed.ts`, wired in `package.json` as `prisma.seed`. It fills **all app tables** (users, workspaces, brands, posts, analytics, integrations, etc.) with realistic sample rows. `RefreshToken` is not seeded (tokens are created at login).

| Command | Description |
|---|---|
| `npm run db:seed` | Truncates all public tables, then inserts seed data (destructive). |
| `SEED_SKIP_TRUNCATE=1 npm run db:seed` | Inserts without truncating first (may fail if unique constraints collide). |
| `npx prisma migrate reset` | Drops DB, reapplies migrations, then runs the seed (when `prisma.seed` is set). |

**Requirements:** `DATABASE_URL` must be set and migrations must already be applied (`npm run db:migrate`).

**Default test users** (password for all: `NexusSeed123!`):

| Email | Role |
|---|---|
| `admin@nexus-seed.local` | admin |
| `member@nexus-seed.local` | member |
| `viewer@nexus-seed.local` | viewer |

Use these to sign in at the frontend login page (`/login`) while the API is running. Do **not** use seed credentials in production; run seed only on local or staging databases.

---

## Frontend Setup (5 minutes)

### Option A — Drop into existing Vite + React project

```bash
# 1. Copy files into your frontend project
cp -r nexus-v8/frontend-src/components/  your-frontend/src/components/
cp -r nexus-v8/frontend-src/hooks/       your-frontend/src/hooks/
cp -r nexus-v8/frontend-lib/             your-frontend/src/lib/
cp    nexus-v8/src/api/base44Client.js   your-frontend/src/api/base44Client.js
cp    nexus-v8/frontend-src/utils.js     your-frontend/src/utils.js
cp    nexus-v8/frontend-src/permissions.js your-frontend/src/components/utils/permissions.js
cp    nexus-v8/frontend-src/pages.config.jsx your-frontend/src/pages.config.jsx

# 2. Set environment variable
echo "VITE_API_URL=http://localhost:4000/v1" >> your-frontend/.env

# 3. Install any missing deps
npm install @tanstack/react-query moment sonner
```

### Option B — Start fresh from this package

```bash
# Create new project
npm create vite@latest nexus-frontend -- --template react
cd nexus-frontend

# Copy all frontend source files
cp -r ../nexus-v8/frontend-src/* .
cp ../nexus-v8/frontend-src/src/* src/

# Install
npm install

# Configure
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:4000/v1

# Start
npm run dev
# → http://localhost:5173 (Vite default; see vite.config.js if changed)
```

### Styling (Tailwind)

The app expects **Tailwind CSS** to be processed by PostCSS. In this package, `frontend-src/postcss.config.js` enables `tailwindcss` and `autoprefixer`. Without it, `@tailwind` directives in `src/index.css` are not expanded and the UI will look unstyled.

`frontend-src/tailwind.config.js` must **scan** your JSX: `content` includes `./src/**`, `./components/**`, and `./pages/**`. If you move folders, update `content` or utility classes will be missing from the build.

---

## Environment Variables — Backend (.env)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `REDIS_URL` | ✅ | Redis connection string |
| `JWT_SECRET` | ✅ | 64-char random string for JWT signing |
| `ENCRYPTION_KEY` | ✅ | 64-char hex for OAuth token encryption |
| `OPENAI_API_KEY` | Recommended | GPT-4o for AI features |
| `STRIPE_SECRET_KEY` | For billing | Stripe payments |
| `AWS_ACCESS_KEY_ID` | For uploads | S3 file storage |
| `CLOUDFLARE_R2_*` | For uploads | R2 file storage (alternative) |
| `SMTP_HOST` + `SMTP_*` | For email | Transactional email |
| `SENDGRID_API_KEY` | For email | SendGrid alternative |

---

## Architecture Overview

```
Browser (React)
    ↕ VITE_API_URL (HTTP/JSON + EventSource SSE)
Express API (localhost:4000)
    ↕ Prisma ORM
PostgreSQL — 45 models
    ↕
Redis — Bull queues (publishing, sync, notifications)
    ↕
External APIs:
  - OpenAI GPT-4o  (AI features)
  - Stripe          (billing)
  - 16 social platforms (OAuth + publishing)
  - AWS S3 / Cloudflare R2 (file storage)
  - SendGrid / SMTP (email)
```

---

## Key Integration Points

| Frontend calls | Backend endpoint | Description |
|---|---|---|
| `base44.auth.login(email, password)` | `POST /auth/login` | Returns JWT tokens |
| `base44.auth.me()` | `GET /auth/me` | Current user + role |
| `/login` (frontend route) | — | Email/password sign-in page (`LoginPage.jsx`) |
| `GET /app/public-settings` | Public, no auth | App boot, branding |
| `base44.entities.Post.create(...)` | `POST /posts` | Create post |
| `base44.integrations.Core.InvokeLLM(...)` | `POST /ai/invoke-llm` | GPT-4o JSON mode |
| `base44.integrations.Core.UploadFile(...)` | `POST /integrations/upload` | S3/R2 upload |
| `base44.agents.subscribeToConversation(...)` | `GET /agents/:id/stream` | SSE streaming |
| `base44.functions.invoke('analyzePost',...)` | `POST /ai/post-analysis` | AI post scoring |

---

## Launch Checklist

- [ ] Backend `.env` filled with real credentials
- [ ] `npm run db:migrate` completed successfully
- [ ] (Optional) `npm run db:seed` run on non-production DB for demo users and data
- [ ] `GET /v1/app/public-settings` returns 200
- [ ] `POST /v1/auth/login` works with a real or seeded user; frontend `/login` loads with styles (Tailwind + PostCSS)
- [ ] `POST /v1/auth/register` creates a user
- [ ] Frontend `VITE_API_URL` points to backend
- [ ] At least one social platform OAuth configured
- [ ] Stripe keys set (or billing disabled in Pricing.jsx)
- [ ] OpenAI key set (or AI features will return 500)
- [ ] Email/SMTP configured (or CrisisDetector email alerts will fail silently)
- [ ] S3/R2 configured (or file uploads will fail)
- [ ] Redis running (or background jobs won't process)

---

## Production Deployment

### Backend (e.g. Railway, Render, AWS)
```bash
npm run build
npm start   # → src/index.js compiled output
```

Set all environment variables on your hosting platform.
Set `NODE_ENV=production`.

### Frontend (e.g. Vercel, Netlify, Cloudflare Pages)
```bash
npm run build   # → dist/
```
Set `VITE_API_URL=https://api.yourdomain.com/v1`
Deploy the `dist/` folder.

### Database
Use a managed PostgreSQL (Supabase, Railway, RDS, Neon).
Run `npx prisma migrate deploy` on first deploy.

Do **not** run `npm run db:seed` against production unless you intend to wipe and replace data (seed truncates tables). For production, create users via `/auth/register` or your admin process.

