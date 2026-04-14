# Nexus Social API — Complete Backend

Production-ready Node.js/TypeScript API for Nexus Social, a full-featured social
media management platform. Built from analysis of 30+ frontend source files.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework | Express 4 |
| Database | PostgreSQL 16 via Prisma ORM |
| Cache / Queues | Redis 7 + Bull |
| Auth | JWT (15m access + 7d refresh, auto-rotation) |
| AI | OpenAI GPT-4o |
| Payments | Stripe (checkout, portal, webhooks) |
| Encryption | AES-256-GCM (OAuth tokens at rest) |
| Logging | Winston + Morgan |
| Security | Helmet, CORS, express-rate-limit |

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
# Required: DATABASE_URL, JWT_SECRET, ENCRYPTION_KEY
# Generate secrets: openssl rand -base64 48

# 3. Start infrastructure
docker compose up postgres redis -d

# 4. Run migrations
npm run db:migrate
npm run db:generate

# 5. Start dev server
npm run dev
# API → http://localhost:4000/v1
# Health → http://localhost:4000/health
```

### Docker (full stack)
```bash
cp .env.example .env   # fill in secrets
docker compose up --build
```

---

## Project Structure

```
nexus-social-api/
├── prisma/schema.prisma          ← 31 models, 16 platforms, all relations
├── src/
│   ├── index.ts                  ← Bootstrap + graceful shutdown
│   ├── app.ts                    ← Express + middleware stack
│   ├── router.ts                 ← All 75+ endpoints mounted
│   ├── config/
│   │   ├── env.ts                ← Zod validation (50+ env vars)
│   │   ├── database.ts           ← Prisma singleton
│   │   ├── redis.ts              ← Redis client
│   │   └── logger.ts             ← Winston logger
│   ├── middleware/
│   │   └── auth.ts               ← JWT verify + Base44-compatible error format
│   ├── modules/
│   │   ├── auth/                 ← register, login, refresh, logout, me, password
│   │   ├── posts/                ← CRUD, scheduling, calendar, bulk ops
│   │   ├── ai/                   ← assistant, listening, crisis, trends,
│   │   │                            content gen, predictive monetization, SQL export
│   │   ├── stripe/               ← checkout, portal, webhook, 5 plans
│   │   ├── notifications/        ← CRUD + SSE stream (LiveNotifications page)
│   │   ├── approval/             ← workflow templates + content approval pipeline
│   │   ├── agency/               ← agency clients + appearance settings
│   │   └── app-logs/             ← page view tracking (NavigationTracker.jsx)
│   ├── platform-integrations/
│   │   └── index.ts              ← All 16 platforms: Instagram, Facebook, Twitter,
│   │                                LinkedIn, TikTok, YouTube, Pinterest, Twitch,
│   │                                Bluesky, Threads, TruthSocial, Rumble, Kick,
│   │                                Spotify, Google Business, Shopify
│   ├── jobs/
│   │   └── index.ts              ← 5 Bull queues + cron schedulers
│   ├── utils/index.ts            ← AES-256-GCM crypto, recurrence, response helpers
│   └── types/index.ts            ← Shared TypeScript types
├── .env.example                  ← 50+ variables documented
├── Dockerfile                    ← Multi-stage production build
├── docker-compose.yml            ← API + PostgreSQL + Redis
└── tsconfig.json
```

---

## Database Models (31)

| Model | Description |
|---|---|
| `User` | User accounts with 2FA support |
| `RefreshToken` | Rotating refresh tokens |
| `Workspace` | Multi-workspace support |
| `WorkspaceMember` | Workspace roles + custom roles |
| `Brand` | Brand profiles per workspace |
| `SocialAccount` | All 16 platforms, encrypted tokens |
| `Post` | Posts with scheduling + recurrence |
| `PostPlatform` | Per-platform publish status |
| `Campaign` | Campaign management |
| `Analytics` | Daily/monthly analytics data |
| `Contact` | CRM contacts |
| `Conversation` | Inbox conversations with message threads |
| `MediaAsset` | Media library |
| `Mention` | Social listening mentions |
| `KeywordTrack` | Brand keyword monitoring |
| `CompetitorTrack` | Competitor tracking |
| `TrendAnalysis` | AI trend detection results |
| `TeamTask` | Kanban tasks |
| `TeamDiscussion` | Team discussions with replies |
| `ContentTemplate` | Reusable post templates |
| `SavedReply` | Quick reply templates |
| `Automation` | Workflow automations |
| `BrandDeal` | Sponsored deal tracking |
| `Revenue` | Revenue entries |
| `Integration` | CRM/email integrations |
| `Subscription` | Stripe subscription state |
| `ClientReport` | White-label client reports |
| `Notification` | In-app notifications (SSE) |
| `ApprovalWorkflow` | Content approval workflow templates |
| `ContentApproval` | Per-post approval records |
| `AgencyClient` | Agency client management |
| `AppearanceSettings` | Per-workspace branding (API-side) |
| `OnboardingState` | Onboarding progress tracking |
| `Benchmark` | Industry benchmark data |
| `EcommerceIntegration` | Shopify/ecommerce connections |
| `SupportTicket` | Customer support tickets |
| `CustomRole` | RBAC custom roles |
| `OptimizationRule` | AI posting optimization rules |
| `AppLog` | User activity / page view logs |

---

## API Reference (75+ endpoints)

All routes are prefixed with `/v1`

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account + workspace |
| POST | `/auth/login` | Login → JWT tokens |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Invalidate session |
| GET | `/auth/me` | Current user + workspaces |
| PATCH | `/auth/me` | Update profile |
| POST | `/auth/password` | Change password |

### Posts (AIContentCalendar, Content pages)
| Method | Path | Description |
|---|---|---|
| GET | `/posts` | List with filters |
| GET | `/posts/calendar/month` | Monthly calendar view |
| GET | `/posts/:id` | Full detail + analytics |
| POST | `/posts` | Create draft or scheduled |
| PATCH | `/posts/:id` | Update |
| DELETE | `/posts/:id` | Delete |
| POST | `/posts/:id/status` | Update status |
| POST | `/posts/bulk/status` | Bulk update (kanban) |

### Social Accounts (all platform pages)
| Method | Path | Description |
|---|---|---|
| GET | `/social-accounts` | List accounts |
| POST | `/social-accounts` | Connect account |
| PATCH | `/social-accounts/:id` | Update |
| DELETE | `/social-accounts/:id` | Remove |
| POST | `/social-accounts/:id/sync` | Queue async sync |
| POST | `/social-accounts/:id/sync/now` | Sync immediately |

### Analytics (AnalyticsDashboard, AdvancedAnalytics)
| Method | Path | Description |
|---|---|---|
| GET | `/analytics` | List with filters |
| GET | `/analytics/summary` | Aggregated summary |
| GET | `/analytics/breakdown` | Per-platform breakdown |
| POST | `/analytics/sync` | Trigger analytics sync |

### AI (AIAssistant, SocialListening pages)
| Method | Path | Description |
|---|---|---|
| POST | `/ai/ask` | AI assistant (data-aware) |
| POST | `/ai/monitor` | Monitor brand keywords |
| POST | `/ai/sentiment` | Sentiment analysis |
| POST | `/ai/crisis` | Crisis detection |
| POST | `/ai/trends` | Trend detection |
| POST | `/ai/competitors/:id/analyze` | AI competitor analysis |
| POST | `/ai/generate-content` | AI content generation |
| POST | `/ai/predictive-monetization` | Revenue forecast |
| GET | `/ai/export/sql` | Full DB SQL export |

### Notifications (LiveNotifications page)
| Method | Path | Description |
|---|---|---|
| **GET** | `/notifications/stream` | **SSE real-time stream** |
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread badge count |
| POST | `/notifications` | Create notification |
| PATCH | `/notifications/:id/read` | Mark read |
| POST | `/notifications/mark-all-read` | Mark all read |
| DELETE | `/notifications/:id` | Delete |

### Approval Workflow (ApprovalWorkflow, WorkflowApprovals)
| Method | Path | Description |
|---|---|---|
| GET | `/approval/workflows` | List workflow templates |
| POST | `/approval/workflows` | Create workflow |
| PATCH | `/approval/workflows/:id` | Update |
| DELETE | `/approval/workflows/:id` | Delete |
| GET | `/approval/approvals` | List approvals |
| GET | `/approval/approvals/pending` | Pending approvals for current user |
| POST | `/approval/approvals` | Submit post for approval |
| POST | `/approval/approvals/:id/review` | Approve / reject / request changes |
| GET | `/approval/stats` | Dashboard stats |

### Agency (AgencyDashboard, AgencyClientManagement)
| Method | Path | Description |
|---|---|---|
| GET | `/agency` | List agency clients |
| POST | `/agency` | Add client |
| PATCH | `/agency/:id` | Update client |
| DELETE | `/agency/:id` | Remove client |
| GET | `/agency/dashboard/metrics` | Dashboard KPIs |

### Appearance (Settings, public branding)
| Method | Path | Auth | Description |
|---|---|---|---|
| **GET** | `/appearance/public/:slug` | **None** | **Public workspace branding** |
| GET | `/appearance/:workspaceId` | Required | Get appearance settings |
| PUT | `/appearance/:workspaceId` | Required | Upsert settings |
| PATCH | `/appearance/:workspaceId` | Required | Update fields |

### App Logs (NavigationTracker.jsx)
| Method | Path | Description |
|---|---|---|
| POST | `/app-logs/page-view` | Log page navigation (called by `base44.appLogs.logUserInApp`) |
| POST | `/app-logs/event` | Log custom event |
| GET | `/app-logs` | Query logs |
| GET | `/app-logs/page-analytics` | Most visited pages |
| GET | `/app-logs/user/:userId` | User activity |
| GET | `/app-logs/summary` | Workspace activity summary |

### All Other Modules
- **Campaigns** — `/campaigns` (CRUD)
- **Contacts** — `/contacts` (CRUD + search)
- **Conversations** — `/conversations` (CRUD + messages + status)
- **Team** — `/team/tasks`, `/team/discussions` (CRUD + bulk ops + replies)
- **Revenue** — `/revenue/deals`, `/revenue/entries`, `/revenue/summary`
- **Content** — `/content/templates`, `/content/saved-replies`, `/content/automations`
- **Listening** — `/listening/mentions`, `/listening/keywords`, `/listening/competitors`, `/listening/trends`, `/listening/alerts`
- **Integrations** — `/integrations` (CRUD + sync + toggle)
- **Media** — `/media` (list + delete)
- **Reports** — `/reports` (CRUD + auto-send)
- **Workspaces** — `/workspaces/:id` (CRUD + members + brands)
- **Onboarding** — `/onboarding/:workspaceId` (get + put + complete-step)
- **Benchmarks** — `/benchmarks` + `/benchmarks/generate`
- **Ecommerce** — `/ecommerce` (CRUD + sync) — Shopify + WooCommerce
- **Roles** — `/roles` (CRUD + assign)
- **Support** — `/support/tickets` (CRUD + messages)
- **Optimization** — `/optimization/rules`, `/optimization/best-times`
- **Platforms** — `/platforms` (metadata for all 16)
- **Stripe** — `/stripe/plans`, `/stripe/checkout`, `/stripe/portal`, `/stripe/webhook`, `/stripe/subscription/:id`
- **Admin** — `/admin/health`, `/admin/run/publisher`, `/admin/run/sync-all`, `/admin/users`, `/admin/workspaces`

---

## Background Jobs (Bull Queues)

| Queue | Cron | Job |
|---|---|---|
| `publish-posts` | Every minute | Publish scheduled posts, create recurring copies |
| `send-reports` | Every hour | Auto-send client reports |
| `sync-social` | On demand | Sync one social account (all 16 platforms) |
| `sync-analytics` | On demand | Fetch analytics for an account |
| `notifications` | On demand | Push notifications to SSE clients |

---

## Social Platforms (16)

**Original 8:** Instagram, Facebook, Twitter/X, LinkedIn, TikTok, YouTube, Pinterest, Twitch

**New 8 (from pages.config.js):** Bluesky (AT Protocol), Threads (Meta), TruthSocial (Mastodon), Rumble, Kick, Spotify, Google Business Profile, Shopify

---

## Auth Error Format

All 401/403 errors include a `extra_data.reason` field for Base44 SDK compatibility:

```json
HTTP 403
{
  "success": false,
  "error": "Authentication required",
  "extra_data": {
    "reason": "auth_required"
  }
}
```

Reasons: `auth_required` | `user_not_registered` | `token_expired` | `forbidden`

This matches what `AuthContext.jsx` checks:
```js
if (appError.status === 403 && appError.data?.extra_data?.reason) { ... }
```

---

## Security

- OAuth tokens stored with AES-256-GCM encryption (never plain-text in DB)
- JWT access tokens: 15 min lifetime, refresh tokens: 7 days, auto-rotated
- Stripe webhooks: signature verified before processing
- Rate limiting: 500 req/15min global, 20 req/15min auth, 10 req/min AI
- Passwords: bcrypt (cost factor 12)
- Helmet sets secure HTTP headers on every response

---

## Environment Variables

See `.env.example` for all 50+ variables. Required minimum:

```bash
DATABASE_URL=postgresql://nexus:nexus_pass@localhost:5432/nexus_social
JWT_SECRET=<openssl rand -base64 48>
ENCRYPTION_KEY=<openssl rand -base64 48>
```

---

## Deployment Checklist

- [ ] Generate `JWT_SECRET` and `ENCRYPTION_KEY` (`openssl rand -base64 48`)
- [ ] Set `DATABASE_URL` to production PostgreSQL
- [ ] Configure Redis URL
- [ ] Set `STRIPE_*` keys and price IDs
- [ ] Set `OPENAI_API_KEY`
- [ ] Configure platform API credentials for supported platforms
- [ ] Set `FRONTEND_URL` and `ALLOWED_ORIGINS` to production domain
- [ ] Set `OAUTH_CALLBACK_BASE_URL` to production API domain
- [ ] Run `npm run db:migrate` on production DB
- [ ] Configure SMTP for report delivery
