# Prisma Migrations

## Running

```bash
# Development — creates new migration + applies it
npx prisma migrate dev --name init

# Production — applies all pending migrations  
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

## Schema additions in this version

**Post:** `published_at`, `engagement_rate`, `metrics Json`, `thumbnail_url`, `ai_analysis Json`, `is_sponsored`  
**User:** `tour_completed`, `checklist_dismissed`, `checklist_completed`  
**SocialAccount:** `follower_growth Float`, `follower_count_prev Int`  
**Analytics:** `follower_count Int`
