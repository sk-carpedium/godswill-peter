# Nexus Social — Complete API Reference
Generated from analysis of 207 frontend components across 4 batches.
Base URL: http://localhost:4000/v1 | Auth: Bearer token

## AUTH
POST   /auth/register                    { name, email, password, workspace_name }
POST   /auth/login                       { email, password }
POST   /auth/refresh                     { refresh_token }
DELETE /auth/logout
GET    /auth/me
PATCH  /auth/me                          { display_name, onboarding_completed, tour_completed,
                                           checklist_dismissed, checklist_completed, sidebar_order }
POST   /auth/password/reset-request      { email }
POST   /auth/password/reset              { token, new_password }

## OAUTH (16 platforms)
GET    /oauth/connect/:platform          ?workspace_id=X&brand_id=Y
GET    /oauth/callback/:platform
POST   /oauth/connect-apikey             { platform, workspace_id, api_key, username, password }
POST   /oauth/refresh/:accountId

## WORKSPACES
GET    /workspaces                       ?status
GET    /workspaces/agency/aggregate      (agency multi-workspace stats)
POST   /workspaces                       { name, slug, industry, plan, settings:{timezone,white_label} }
GET    /workspaces/:id
PATCH  /workspaces/:id                   { settings:{white_label:{},custom_kpis[],custom_dashboard_layout[]} }
DELETE /workspaces/:id
GET    /workspaces/:id/brands
POST   /workspaces/:id/brands            { name, logo_url, website, industry, brand_voice:{} }
PATCH  /workspaces/:id/brands/:brandId   { brand_voice:{tone[],banned_words[],ai_profile{}},
                                           compliance_rules:{require_disclosure,prohibited_content[]} }
DELETE /workspaces/:id/brands/:brandId

## SOCIAL ACCOUNTS
GET    /social-accounts                  ?workspace_id&platform&status
POST   /social-accounts
GET    /social-accounts/:id
PATCH  /social-accounts/:id              { follower_count, health_status, follower_growth }
DELETE /social-accounts/:id

## POSTS
GET    /posts                            ?workspace_id&status&platform&campaign_id&sort&limit
POST   /posts                            { content:{text,media_urls[]}, platforms[], post_type,
                                           scheduled_at, schedule_type, recurrence_rule,
                                           labels[], schedule{}, campaign_id, is_sponsored }
GET    /posts/:id
PATCH  /posts/:id                        { status, labels[], schedule, content }
DELETE /posts/:id
POST   /posts/:id/publish
POST   /posts/:id/schedule               { scheduled_at }
POST   /posts/:id/duplicate

## ANALYTICS
GET    /analytics                        ?workspace_id&platform&social_account_id&post_id
                                          &period=24h|7d|30d|90d&date_from&date_to
                                          &group_by=hour&sort&limit
POST   /analytics                        { workspace_id, platform, social_account_id, ... }
GET    /analytics/:id
POST   /analytics/sync                   { workspace_id, platform, account_id }

## CONVERSATIONS
GET    /conversations                    ?workspace_id&status&type&platform&priority&is_vip
POST   /conversations                    { workspace_id, platform, type, participant, messages[] }
GET    /conversations/:id
PATCH  /conversations/:id                { status, priority, is_vip, assigned_to, unread_count, sla }
DELETE /conversations/:id
POST   /conversations/:id/reply          { message, is_ai_generated }

## MENTIONS
GET    /mentions                         ?workspace_id&sentiment&status&is_crisis&platform
POST   /mentions                         { workspace_id, platform, author, content, sentiment }
GET    /mentions/:id
PATCH  /mentions/:id                     { status:'reviewed'|'dismissed'|'escalated', is_crisis }
DELETE /mentions/:id

## REVENUE
GET    /revenue                          ?workspace_id&source&platform&post_id&limit
POST   /revenue                          { workspace_id, source, amount, platform, post_id, transaction_date }
GET    /revenue/:id
PATCH  /revenue/:id
DELETE /revenue/:id
GET    /revenue/deals                    ?workspace_id&status
POST   /revenue/deals                    { brand_name, deal_type, contract_value, deliverables{},
                                           performance{}, payment_structure{} }
PATCH  /revenue/deals/:id
DELETE /revenue/deals/:id

## CAMPAIGNS
GET    /campaigns                        ?workspace_id&status&brand_id
POST   /campaigns                        { name, objective, brand_id, platforms[], budget:{total,spent},
                                           kpis:{target_reach,target_engagement,target_conversions},
                                           utm_parameters:{}, start_date, end_date }
GET    /campaigns/:id
PATCH  /campaigns/:id
DELETE /campaigns/:id
POST   /campaigns/:id/sync-performance  (aggregates Analytics→campaign.performance)

## AI
POST   /ai/ask                           { workspace_id, question }
POST   /ai/post-analysis                 { workspace_id, content, platforms[], post_type }
POST   /ai/invoke-llm                    { workspace_id, prompt, response_json_schema }
POST   /ai/check-alerts                  { workspace_id }
POST   /ai/crisis/execute                { workspace_id, alert_id, responses[] }
POST   /ai/monitor                       { workspace_id, keyword_ids[] }
POST   /ai/sentiment                     { workspace_id }
POST   /ai/crisis                        { workspace_id }
POST   /ai/trends                        { workspace_id, industry, brand_keywords[] }
POST   /ai/generate-content              { workspace_id, platform, topic|prompt, tone,
                                           post_type|contentType, hashtag_count, keywords }
POST   /ai/predictive-monetization       { workspace_id, post_id, platforms[] }

## SOCIAL LISTENING
GET    /listening/keywords               ?workspace_id
POST   /listening/keywords               { workspace_id, keyword, category, alert_enabled }
PATCH  /listening/keywords/:id
DELETE /listening/keywords/:id
GET    /listening/competitors            ?workspace_id
POST   /listening/competitors            { workspace_id, name }
PATCH  /listening/competitors/:id
DELETE /listening/competitors/:id
GET    /listening/trends                 ?workspace_id
GET    /listening/alerts                 ?workspace_id

## MEDIA & CONTENT
GET    /media                            ?workspace_id&type&is_brand_asset
POST   /media                            { workspace_id, file_url, type, name }
PATCH  /media/:id
DELETE /media/:id
GET    /content/templates                ?workspace_id&platform
POST   /content/templates                { workspace_id, name, content, platform, category }
PATCH  /content/templates/:id
DELETE /content/templates/:id
POST   /integrations/upload              (multipart, field: file) → S3/R2

## AUTOMATIONS
GET    /automations                      ?workspace_id&status
POST   /automations                      { workspace_id, name, trigger:{type,platforms[],conditions[]},
                                           actions:[{type,config}], status:'draft'|'active'|'paused' }
PATCH  /automations/:id
DELETE /automations/:id

## TEAM & USERS
GET    /users/workspace/:id/members
POST   /users/invite                     { workspace_id, email, role, permissions:{can_publish,
                                           can_approve, can_delete, can_manage_team} }
PATCH  /users/workspace/:id/members/:memberId
DELETE /users/workspace/:id/members/:memberId

## REPORTS & CLIENT PORTAL
GET    /reports                          ?workspace_id
POST   /reports                          { workspace_id, report_name, client_email,
                                           metrics_included[], auto_send_enabled, delivery_time }
PATCH  /reports/:id
DELETE /reports/:id
POST   /reports/:id/generate
POST   /reports/generate/adhoc

## SUBSCRIPTIONS
GET    /subscriptions                    ?workspace_id&user_email
POST   /subscriptions                    { workspace_id, plan_id:'free'|'starter'|'growth'|'professional'|'agency' }
PATCH  /subscriptions/:id
GET    /usage/:workspaceId
POST   /usage/:workspaceId/increment     { metric, amount }
POST   /usage/:workspaceId/reset-monthly

## INTEGRATIONS
GET    /integrations                     ?workspace_id&integration_type
POST   /integrations                     { workspace_id, integration_type, name, settings:{} }
PATCH  /integrations/:id
DELETE /integrations/:id
POST   /integrations/:id/sync            { integration_type }

## NOTIFICATIONS
GET    /notifications                    ?workspace_id&is_read
PATCH  /notifications/:id                { is_read: true }
DELETE /notifications/:id

## AGENTS (AI Conversations / Customer Support)
GET    /agents/conversations
POST   /agents/conversations
GET    /agents/conversations/:id
POST   /agents/conversations/:id/message { content, agent_name }
GET    /agents/conversations/:id/stream  (SSE)
DELETE /agents/conversations/:id
POST   /agents/extract                   { file_url, extraction_prompt }
GET    /agents/whatsapp/connect-url

## STRIPE / BILLING
POST   /stripe/webhook
GET    /stripe/subscription/:workspaceId
POST   /stripe/checkout                  { plan_id, workspace_id }
POST   /stripe/portal                    { workspace_id }

## ADMIN
POST   /admin/email/send                 { to, subject, body }
POST   /admin/run/publisher
POST   /admin/run/sync-all
GET    /admin/run/status

## SDK ENTITIES (base44.entities.X)
Post · Analytics · Mention · Revenue · Campaign · Brand · BrandDeal · SocialAccount ·
Conversation · MediaAsset · KeywordTrack · CompetitorTrack · ContentTemplate · ClientReport ·
Integration · Automation · Workspace · WorkspaceMember · Subscription · AIConversation ·
Video · PlatformComment · UserInvitation · PlatformReview · NotificationSchedule ·
ClientPortal · UsageLimits · Permissions

## SDK AUTH (base44.auth.X)
me() · login() · register() · logout() · updateMe() · isAuthenticated() ·
redirectToLogin() · inviteUser()

## SDK FUNCTIONS (base44.functions.invoke(name, params))
aiSocialListening: monitor_mentions · analyze_sentiment · detect_crisis ·
                   track_competitor · execute_crisis_response
socialListening:   detect_trends · check_alerts
Functions: analyzePost · syncIntegration · exportToSQL · syncSocialData ·
           generateClientReport · syncAllAccounts · publishPosts · syncAnalytics ·
           syncSocialAnalytics · predictiveMonetization

## PLATFORM CHARACTER LIMITS
instagram:2200 · facebook:63206 · twitter:280 · linkedin:3000 · tiktok:2200 ·
threads:500 · pinterest:500 · youtube:5000 · bluesky:300 · twitch:500 ·
rumble:1000 · kick:500 · truth_social:500 · google_business:1500
