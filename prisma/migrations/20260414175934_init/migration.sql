-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'member', 'viewer', 'client');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'scheduled', 'publishing', 'published', 'failed', 'archived', 'pending_approval');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('once', 'recurring');

-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "AcctStatus" AS ENUM ('active', 'inactive', 'disconnected');

-- CreateEnum
CREATE TYPE "AcctHealth" AS ENUM ('healthy', 'error', 'disconnected', 'pending');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('positive', 'neutral', 'negative');

-- CreateEnum
CREATE TYPE "MentionStatus" AS ENUM ('new', 'reviewed', 'escalated', 'resolved', 'ignored', 'dismissed');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TrendType" AS ENUM ('hashtag', 'topic', 'event', 'news', 'viral_content');

-- CreateEnum
CREATE TYPE "Momentum" AS ENUM ('rising', 'peaked', 'declining');

-- CreateEnum
CREATE TYPE "ReportFreq" AS ENUM ('weekly', 'monthly', 'quarterly');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('draft', 'scheduled', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "IntegType" AS ENUM ('mailchimp', 'sendgrid', 'salesforce', 'hubspot', 'zapier', 'slack', 'shopify', 'google_analytics');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('healthy', 'error', 'pending', 'never_synced');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('todo', 'in_progress', 'done', 'blocked');

-- CreateEnum
CREATE TYPE "SubPlan" AS ENUM ('free', 'starter', 'growth', 'professional', 'enterprise', 'agency');

-- CreateEnum
CREATE TYPE "SubStatus" AS ENUM ('active', 'cancelled', 'past_due', 'trialing');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('pending_review', 'approved', 'rejected', 'changes_requested', 'withdrawn');

-- CreateEnum
CREATE TYPE "NotifType" AS ENUM ('post_published', 'post_failed', 'mention', 'crisis', 'report_ready', 'approval_requested', 'approval_approved', 'approval_rejected', 'new_follower', 'follower_milestone', 'ecommerce_sale', 'system');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'twitch', 'bluesky', 'threads', 'truthsocial', 'rumble', 'kick', 'spotify', 'google_business', 'shopify');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "role" "Role" NOT NULL DEFAULT 'member',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "totp_secret" TEXT,
    "totp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "tour_completed" BOOLEAN NOT NULL DEFAULT false,
    "checklist_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "checklist_completed" BOOLEAN NOT NULL DEFAULT false,
    "sidebar_order" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "plan" TEXT DEFAULT 'free',
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'member',
    "custom_role_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joined_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSONB,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "brand_color" TEXT,
    "status" TEXT DEFAULT 'active',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "brand_voice" JSONB,
    "compliance_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "platform" "Platform" NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_handle" TEXT,
    "platform_account_id" TEXT,
    "profile_image_url" TEXT,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "follower_count" INTEGER NOT NULL DEFAULT 0,
    "follower_growth" DOUBLE PRECISION,
    "follower_count_prev" INTEGER,
    "following_count" INTEGER NOT NULL DEFAULT 0,
    "post_count" INTEGER NOT NULL DEFAULT 0,
    "status" "AcctStatus" NOT NULL DEFAULT 'active',
    "health_status" "AcctHealth" NOT NULL DEFAULT 'healthy',
    "health_message" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "extra_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "title" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "schedule" JSONB,
    "post_type" TEXT,
    "content" JSONB,
    "media_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "schedule_type" "ScheduleType",
    "scheduled_at" TIMESTAMP(3),
    "recurrence_rule" "Recurrence",
    "recurrence_end_date" TIMESTAMP(3),
    "parent_post_id" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "created_by" TEXT,
    "approval_required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),
    "engagement_rate" DOUBLE PRECISION,
    "metrics" JSONB,
    "thumbnail_url" TEXT,
    "ai_analysis" JSONB,
    "is_sponsored" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPlatform" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "social_account_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" "PostStatus" NOT NULL DEFAULT 'draft',
    "platform_post_id" TEXT,
    "published_at" TIMESTAMP(3),
    "error_message" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PostPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "objective" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'draft',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "budget" JSONB,
    "duration" TEXT,
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "goals" JSONB,
    "kpis" JSONB,
    "utm_parameters" JSONB,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "performance" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "social_account_id" TEXT,
    "post_id" TEXT,
    "platform" "Platform",
    "date" TEXT NOT NULL,
    "period" TEXT NOT NULL DEFAULT 'daily',
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "reach" INTEGER NOT NULL DEFAULT 0,
    "engagement" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "video_views" INTEGER NOT NULL DEFAULT 0,
    "profile_visits" INTEGER NOT NULL DEFAULT 0,
    "website_clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "total_followers" INTEGER NOT NULL DEFAULT 0,
    "new_followers" INTEGER NOT NULL DEFAULT 0,
    "unfollowers" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "follower_quality_score" INTEGER NOT NULL DEFAULT 0,
    "audience" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "display_name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "platform" "Platform",
    "platform_user_id" TEXT,
    "username" TEXT,
    "follower_count" INTEGER NOT NULL DEFAULT 0,
    "follower_growth" DOUBLE PRECISION,
    "follower_count_prev" INTEGER,
    "is_influencer" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "platform" "Platform",
    "contact_id" TEXT,
    "subject" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "type" TEXT DEFAULT 'dm',
    "participant" JSONB,
    "priority" TEXT DEFAULT 'normal',
    "is_vip" BOOLEAN NOT NULL DEFAULT false,
    "unread_count" INTEGER NOT NULL DEFAULT 0,
    "sentiment" TEXT,
    "last_message_at" TIMESTAMP(3),
    "messages" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "url" TEXT,
    "thumbnail_url" TEXT,
    "file_type" TEXT NOT NULL DEFAULT 'image',
    "type" TEXT,
    "mime_type" TEXT,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "duration" DOUBLE PRECISION,
    "alt_text" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "is_brand_asset" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mention" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "platform" "Platform",
    "mention_type" TEXT NOT NULL DEFAULT 'brand_keyword',
    "author" JSONB NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "sentiment" "Sentiment" NOT NULL DEFAULT 'neutral',
    "sentiment_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "engagement" JSONB,
    "influence_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_crisis" BOOLEAN NOT NULL DEFAULT false,
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "status" "MentionStatus" NOT NULL DEFAULT 'new',
    "mentioned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeywordTrack" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "keyword" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "stats" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorTrack" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "competitor_name" TEXT NOT NULL,
    "website" TEXT,
    "social_handles" JSONB,
    "tracking_keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metrics" JSONB,
    "recent_campaigns" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "last_analyzed_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitorTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrendAnalysis" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "trend_title" TEXT NOT NULL,
    "trend_type" "TrendType" NOT NULL,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "momentum" "Momentum" NOT NULL DEFAULT 'rising',
    "velocity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_mentions" INTEGER NOT NULL DEFAULT 0,
    "total_reach" INTEGER NOT NULL DEFAULT 0,
    "sentiment_breakdown" JSONB,
    "relevance_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "opportunity_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ai_insights" TEXT,
    "recommended_action" TEXT,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrendAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamTask" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'todo',
    "assigned_to" TEXT,
    "due_date" TIMESTAMP(3),
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamDiscussion" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "author_id" TEXT,
    "replies" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamDiscussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTemplate" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "platform" "Platform",
    "post_type" TEXT,
    "content" JSONB NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReply" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" JSONB NOT NULL,
    "actions" JSONB[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "last_run_at" TIMESTAMP(3),
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandDeal" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "brand_id" TEXT,
    "deal_name" TEXT NOT NULL,
    "brand_name" TEXT,
    "brand_logo_url" TEXT,
    "sponsor_name" TEXT,
    "deal_type" TEXT DEFAULT 'sponsored_post',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "contract_value" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "deliverables" JSONB,
    "performance" JSONB,
    "payment_structure" JSONB,
    "kpis" JSONB,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "contract_url" TEXT,
    "commission_rate" DOUBLE PRECISION,
    "promo_code" TEXT,
    "tracking_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revenue" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "brand_deal_id" TEXT,
    "post_id" TEXT,
    "source" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT,
    "platform" "Platform",
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "integration_type" "IntegType" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "credentials" JSONB,
    "settings" JSONB,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'never_synced',
    "sync_error" TEXT,
    "last_synced_at" TIMESTAMP(3),
    "stats" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_email" TEXT,
    "plan" "SubPlan" NOT NULL DEFAULT 'free',
    "plan_id" TEXT NOT NULL DEFAULT 'free',
    "billing_cycle" TEXT NOT NULL DEFAULT 'monthly',
    "price" TEXT,
    "status" "SubStatus" NOT NULL DEFAULT 'trialing',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "trial_end" TIMESTAMP(3),
    "trial_ends_at" TIMESTAMP(3),
    "seats" INTEGER NOT NULL DEFAULT 1,
    "usage_limits" JSONB,
    "current_usage" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientReport" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "client_workspace_id" TEXT,
    "report_name" TEXT NOT NULL,
    "report_type" TEXT DEFAULT 'comprehensive',
    "frequency" "ReportFreq" NOT NULL DEFAULT 'monthly',
    "status" "ReportStatus" NOT NULL DEFAULT 'draft',
    "date_range" JSONB,
    "client_email" TEXT,
    "custom_message" TEXT,
    "metrics_included" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "delivery_time" TEXT DEFAULT '09:00',
    "delivery_day" TEXT DEFAULT '1',
    "pdf_url" TEXT,
    "analytics_data" JSONB,
    "white_label_settings" JSONB,
    "custom_sections" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "auto_send_enabled" BOOLEAN NOT NULL DEFAULT true,
    "next_scheduled_send" TIMESTAMP(3),
    "last_sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT,
    "type" "NotifType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "action_url" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApprovalWorkflow" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stages" JSONB[],
    "platforms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "post_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentApproval" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "workflow_id" TEXT,
    "post_id" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'pending_review',
    "current_stage" INTEGER NOT NULL DEFAULT 0,
    "stage_history" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "submitted_by" TEXT,
    "reviewed_by" TEXT,
    "review_notes" TEXT,
    "due_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgencyClient" (
    "id" TEXT NOT NULL,
    "agency_workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "client_workspace_id" TEXT,
    "plan" TEXT,
    "monthly_retainer" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "contract_start" TIMESTAMP(3),
    "contract_end" TIMESTAMP(3),
    "onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "contact_person" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgencyClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppearanceSettings" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "primary_color" TEXT NOT NULL DEFAULT '#d4af37',
    "font_size" TEXT NOT NULL DEFAULT '14px',
    "sidebar_style" TEXT NOT NULL DEFAULT 'expanded',
    "dark_mode" TEXT NOT NULL DEFAULT 'system',
    "logo_url" TEXT,
    "favicon_url" TEXT,
    "brand_name" TEXT,
    "custom_css" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppearanceSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingState" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "completed_steps" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "is_complete" BOOLEAN NOT NULL DEFAULT false,
    "workspace_created" BOOLEAN NOT NULL DEFAULT false,
    "accounts_connected" BOOLEAN NOT NULL DEFAULT false,
    "first_post_created" BOOLEAN NOT NULL DEFAULT false,
    "team_invited" BOOLEAN NOT NULL DEFAULT false,
    "appearance_set" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benchmark" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "platform" "Platform",
    "metric_name" TEXT NOT NULL,
    "metric_value" DOUBLE PRECISION NOT NULL,
    "percentile_25" DOUBLE PRECISION,
    "percentile_50" DOUBLE PRECISION,
    "percentile_75" DOUBLE PRECISION,
    "top_10_pct" DOUBLE PRECISION,
    "your_value" DOUBLE PRECISION,
    "period" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'calculated',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Benchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EcommerceIntegration" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'shopify',
    "shop_url" TEXT,
    "shop_name" TEXT,
    "access_token" TEXT,
    "api_key" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sync_products" BOOLEAN NOT NULL DEFAULT true,
    "sync_orders" BOOLEAN NOT NULL DEFAULT true,
    "sync_customers" BOOLEAN NOT NULL DEFAULT false,
    "last_synced_at" TIMESTAMP(3),
    "stats" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EcommerceIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "contact_id" TEXT,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "priority" "Priority" NOT NULL DEFAULT 'medium',
    "platform" "Platform",
    "channel" TEXT,
    "messages" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "assigned_to" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomRole" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptimizationRule" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rule_type" TEXT NOT NULL,
    "platform" "Platform",
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "last_run_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptimizationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "page_name" TEXT,
    "event_type" TEXT NOT NULL DEFAULT 'page_view',
    "path" TEXT,
    "referrer" TEXT,
    "duration_ms" INTEGER,
    "metadata" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "social_account_id" TEXT,
    "platform" "Platform" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT,
    "thumbnail_url" TEXT,
    "duration_seconds" INTEGER,
    "file_size_bytes" BIGINT,
    "status" TEXT NOT NULL DEFAULT 'uploading',
    "platform_video_id" TEXT,
    "platform_url" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments_count" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "published_at" TIMESTAMP(3),
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformComment" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "video_id" TEXT,
    "social_account_id" TEXT,
    "platform" "Platform" NOT NULL,
    "platform_comment_id" TEXT,
    "author_name" TEXT NOT NULL,
    "author_avatar" TEXT,
    "content" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "is_reply" BOOLEAN NOT NULL DEFAULT false,
    "parent_comment_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'visible',
    "sentiment" "Sentiment" NOT NULL DEFAULT 'neutral',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "replied_at" TIMESTAMP(3),
    "reply_content" TEXT,
    "commented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvitation" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "invited_by" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "token" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformReview" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "social_account_id" TEXT,
    "platform" "Platform" NOT NULL,
    "platform_review_id" TEXT,
    "reviewer_name" TEXT NOT NULL,
    "reviewer_avatar" TEXT,
    "reviewer_id" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "title" TEXT,
    "content" TEXT,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'neutral',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'visible',
    "reply_content" TEXT,
    "replied_at" TIMESTAMP(3),
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationSchedule" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "post_id" TEXT,
    "social_account_id" TEXT,
    "platform" "Platform",
    "notification_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "audience" TEXT NOT NULL DEFAULT 'all_followers',
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT,
    "user_id" TEXT NOT NULL,
    "agent_name" TEXT NOT NULL DEFAULT 'assistant',
    "title" TEXT,
    "messages" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspace_id_user_id_key" ON "WorkspaceMember"("workspace_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspace_id_user_email_key" ON "WorkspaceMember"("workspace_id", "user_email");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_workspace_id_platform_platform_account_id_key" ON "SocialAccount"("workspace_id", "platform", "platform_account_id");

-- CreateIndex
CREATE INDEX "Post_workspace_id_status_idx" ON "Post"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Post_workspace_id_scheduled_at_idx" ON "Post"("workspace_id", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "PostPlatform_post_id_social_account_id_key" ON "PostPlatform"("post_id", "social_account_id");

-- CreateIndex
CREATE INDEX "Campaign_workspace_id_status_idx" ON "Campaign"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Campaign_workspace_id_brand_id_idx" ON "Campaign"("workspace_id", "brand_id");

-- CreateIndex
CREATE INDEX "Analytics_workspace_id_date_idx" ON "Analytics"("workspace_id", "date");

-- CreateIndex
CREATE INDEX "Analytics_social_account_id_date_idx" ON "Analytics"("social_account_id", "date");

-- CreateIndex
CREATE INDEX "Conversation_workspace_id_status_idx" ON "Conversation"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Conversation_workspace_id_priority_idx" ON "Conversation"("workspace_id", "priority");

-- CreateIndex
CREATE INDEX "Conversation_workspace_id_type_idx" ON "Conversation"("workspace_id", "type");

-- CreateIndex
CREATE INDEX "MediaAsset_workspace_id_category_idx" ON "MediaAsset"("workspace_id", "category");

-- CreateIndex
CREATE INDEX "MediaAsset_workspace_id_is_brand_asset_idx" ON "MediaAsset"("workspace_id", "is_brand_asset");

-- CreateIndex
CREATE INDEX "Mention_workspace_id_status_idx" ON "Mention"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Mention_workspace_id_is_crisis_idx" ON "Mention"("workspace_id", "is_crisis");

-- CreateIndex
CREATE UNIQUE INDEX "KeywordTrack_workspace_id_keyword_key" ON "KeywordTrack"("workspace_id", "keyword");

-- CreateIndex
CREATE INDEX "TrendAnalysis_workspace_id_detected_at_idx" ON "TrendAnalysis"("workspace_id", "detected_at");

-- CreateIndex
CREATE INDEX "TeamTask_workspace_id_status_idx" ON "TeamTask"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Automation_workspace_id_status_idx" ON "Automation"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "Automation_workspace_id_is_active_idx" ON "Automation"("workspace_id", "is_active");

-- CreateIndex
CREATE INDEX "Revenue_workspace_id_date_idx" ON "Revenue"("workspace_id", "date");

-- CreateIndex
CREATE INDEX "Revenue_workspace_id_post_id_idx" ON "Revenue"("workspace_id", "post_id");

-- CreateIndex
CREATE INDEX "Revenue_workspace_id_source_idx" ON "Revenue"("workspace_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "Integration_workspace_id_integration_type_key" ON "Integration"("workspace_id", "integration_type");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_workspace_id_key" ON "Subscription"("workspace_id");

-- CreateIndex
CREATE INDEX "ClientReport_workspace_id_status_idx" ON "ClientReport"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "ClientReport_client_workspace_id_auto_send_enabled_idx" ON "ClientReport"("client_workspace_id", "auto_send_enabled");

-- CreateIndex
CREATE INDEX "Notification_workspace_id_is_read_idx" ON "Notification"("workspace_id", "is_read");

-- CreateIndex
CREATE INDEX "Notification_workspace_id_created_at_idx" ON "Notification"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "Notification_user_id_is_read_idx" ON "Notification"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "ContentApproval_workspace_id_status_idx" ON "ContentApproval"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "AgencyClient_agency_workspace_id_status_idx" ON "AgencyClient"("agency_workspace_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AppearanceSettings_workspace_id_key" ON "AppearanceSettings"("workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingState_workspace_id_key" ON "OnboardingState"("workspace_id");

-- CreateIndex
CREATE INDEX "Benchmark_workspace_id_platform_idx" ON "Benchmark"("workspace_id", "platform");

-- CreateIndex
CREATE INDEX "Benchmark_workspace_id_period_idx" ON "Benchmark"("workspace_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "EcommerceIntegration_workspace_id_platform_key" ON "EcommerceIntegration"("workspace_id", "platform");

-- CreateIndex
CREATE INDEX "SupportTicket_workspace_id_status_idx" ON "SupportTicket"("workspace_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CustomRole_workspace_id_name_key" ON "CustomRole"("workspace_id", "name");

-- CreateIndex
CREATE INDEX "AppLog_user_id_created_at_idx" ON "AppLog"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "AppLog_workspace_id_page_name_idx" ON "AppLog"("workspace_id", "page_name");

-- CreateIndex
CREATE INDEX "AppLog_event_type_created_at_idx" ON "AppLog"("event_type", "created_at");

-- CreateIndex
CREATE INDEX "Video_workspace_id_platform_idx" ON "Video"("workspace_id", "platform");

-- CreateIndex
CREATE INDEX "Video_workspace_id_status_idx" ON "Video"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "PlatformComment_workspace_id_platform_idx" ON "PlatformComment"("workspace_id", "platform");

-- CreateIndex
CREATE INDEX "PlatformComment_video_id_idx" ON "PlatformComment"("video_id");

-- CreateIndex
CREATE INDEX "PlatformComment_status_idx" ON "PlatformComment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_token_key" ON "UserInvitation"("token");

-- CreateIndex
CREATE INDEX "UserInvitation_email_status_idx" ON "UserInvitation"("email", "status");

-- CreateIndex
CREATE INDEX "UserInvitation_workspace_id_status_idx" ON "UserInvitation"("workspace_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "UserInvitation_workspace_id_email_key" ON "UserInvitation"("workspace_id", "email");

-- CreateIndex
CREATE INDEX "PlatformReview_workspace_id_platform_idx" ON "PlatformReview"("workspace_id", "platform");

-- CreateIndex
CREATE INDEX "PlatformReview_workspace_id_rating_idx" ON "PlatformReview"("workspace_id", "rating");

-- CreateIndex
CREATE INDEX "PlatformReview_workspace_id_status_idx" ON "PlatformReview"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "NotificationSchedule_workspace_id_status_idx" ON "NotificationSchedule"("workspace_id", "status");

-- CreateIndex
CREATE INDEX "NotificationSchedule_workspace_id_scheduled_at_idx" ON "NotificationSchedule"("workspace_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "AIConversation_user_id_agent_name_idx" ON "AIConversation"("user_id", "agent_name");

-- CreateIndex
CREATE INDEX "AIConversation_workspace_id_agent_name_idx" ON "AIConversation"("workspace_id", "agent_name");

-- CreateIndex
CREATE INDEX "AIConversation_user_id_created_at_idx" ON "AIConversation"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_custom_role_id_fkey" FOREIGN KEY ("custom_role_id") REFERENCES "CustomRole"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_parent_post_id_fkey" FOREIGN KEY ("parent_post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPlatform" ADD CONSTRAINT "PostPlatform_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPlatform" ADD CONSTRAINT "PostPlatform_social_account_id_fkey" FOREIGN KEY ("social_account_id") REFERENCES "SocialAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_social_account_id_fkey" FOREIGN KEY ("social_account_id") REFERENCES "SocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mention" ADD CONSTRAINT "Mention_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeywordTrack" ADD CONSTRAINT "KeywordTrack_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorTrack" ADD CONSTRAINT "CompetitorTrack_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrendAnalysis" ADD CONSTRAINT "TrendAnalysis_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamTask" ADD CONSTRAINT "TeamTask_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamDiscussion" ADD CONSTRAINT "TeamDiscussion_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTemplate" ADD CONSTRAINT "ContentTemplate_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReply" ADD CONSTRAINT "SavedReply_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDeal" ADD CONSTRAINT "BrandDeal_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandDeal" ADD CONSTRAINT "BrandDeal_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_brand_deal_id_fkey" FOREIGN KEY ("brand_deal_id") REFERENCES "BrandDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revenue" ADD CONSTRAINT "Revenue_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientReport" ADD CONSTRAINT "ClientReport_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentApproval" ADD CONSTRAINT "ContentApproval_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentApproval" ADD CONSTRAINT "ContentApproval_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "ApprovalWorkflow"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentApproval" ADD CONSTRAINT "ContentApproval_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentApproval" ADD CONSTRAINT "ContentApproval_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentApproval" ADD CONSTRAINT "ContentApproval_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgencyClient" ADD CONSTRAINT "AgencyClient_agency_workspace_id_fkey" FOREIGN KEY ("agency_workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppearanceSettings" ADD CONSTRAINT "AppearanceSettings_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingState" ADD CONSTRAINT "OnboardingState_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benchmark" ADD CONSTRAINT "Benchmark_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EcommerceIntegration" ADD CONSTRAINT "EcommerceIntegration_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomRole" ADD CONSTRAINT "CustomRole_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptimizationRule" ADD CONSTRAINT "OptimizationRule_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformComment" ADD CONSTRAINT "PlatformComment_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformComment" ADD CONSTRAINT "PlatformComment_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvitation" ADD CONSTRAINT "UserInvitation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformReview" ADD CONSTRAINT "PlatformReview_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationSchedule" ADD CONSTRAINT "NotificationSchedule_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
