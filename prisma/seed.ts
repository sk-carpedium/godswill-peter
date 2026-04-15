/**
 * Nexus Social — full database seed (dev / staging).
 *
 * Usage:
 *   npm run db:seed
 *   SEED_SKIP_TRUNCATE=1 npm run db:seed   # append without wiping (may fail on unique constraints)
 *
 * Default login after seed:
 *   admin@nexus-seed.local / NexusSeed123!
 *   member@nexus-seed.local / NexusSeed123!
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  Role,
  Platform,
  PostStatus,
  CampaignStatus,
  SubPlan,
  SubStatus,
  NotifType,
  ApprovalStatus,
  IntegType,
  SyncStatus,
  ReportFreq,
  ReportStatus,
  TaskStatus,
  Priority as PrismaPriority,
  MentionStatus,
  Sentiment,
  TrendType,
  Momentum,
  AcctStatus,
  AcctHealth,
} from '@prisma/client';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'NexusSeed123!';

/** All public Prisma models (table names match model names). */
const ALL_TABLES = [
  'AIConversation',
  'AgencyClient',
  'Analytics',
  'AppearanceSettings',
  'AppLog',
  'ApprovalWorkflow',
  'Automation',
  'Benchmark',
  'Brand',
  'BrandDeal',
  'Campaign',
  'ClientReport',
  'CompetitorTrack',
  'Contact',
  'ContentApproval',
  'ContentTemplate',
  'Conversation',
  'CustomRole',
  'EcommerceIntegration',
  'Integration',
  'KeywordTrack',
  'MediaAsset',
  'Mention',
  'Notification',
  'NotificationSchedule',
  'OnboardingState',
  'OptimizationRule',
  'PlatformComment',
  'PlatformReview',
  'Post',
  'PostPlatform',
  'RefreshToken',
  'Revenue',
  'SavedReply',
  'SocialAccount',
  'Subscription',
  'SupportTicket',
  'TeamDiscussion',
  'TeamTask',
  'TrendAnalysis',
  'User',
  'UserInvitation',
  'Video',
  'Workspace',
  'WorkspaceMember',
] as const;

async function wipePublicTables(): Promise<void> {
  const tables = ALL_TABLES.map((t) => `"${t}"`).join(', ');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`,
  );
}

async function main(): Promise<void> {
  if (process.env.SEED_SKIP_TRUNCATE !== '1') {
    console.log('Truncating all public tables…');
    await wipePublicTables();
  }

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nexus-seed.local',
      password_hash: passwordHash,
      display_name: 'Seed Admin',
      role: Role.admin,
      onboarding_completed: true,
    },
  });

  const memberUser = await prisma.user.create({
    data: {
      email: 'member@nexus-seed.local',
      password_hash: passwordHash,
      display_name: 'Seed Member',
      role: Role.member,
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@nexus-seed.local',
      password_hash: passwordHash,
      display_name: 'Seed Viewer',
      role: Role.viewer,
    },
  });

  const wsMain = await prisma.workspace.create({
    data: {
      name: 'Demo Studio',
      slug: `demo-studio-${Date.now()}`,
      industry: 'Marketing',
      timezone: 'America/New_York',
      plan: 'growth',
      settings: {
        custom_kpis: ['reach', 'engagement'],
        white_label: { client_name: 'Demo Co' },
      },
    },
  });

  const wsAgency = await prisma.workspace.create({
    data: {
      name: 'Agency Hub',
      slug: `agency-hub-${Date.now()}`,
      industry: 'Agency',
      timezone: 'UTC',
      plan: 'agency',
    },
  });

  await prisma.subscription.create({
    data: {
      workspace_id: wsMain.id,
      user_email: adminUser.email,
      plan: SubPlan.growth,
      plan_id: 'growth',
      status: SubStatus.trialing,
      seats: 5,
      usage_limits: {
        social_accounts: 25,
        posts_per_month: 500,
        team_members: 10,
        ai_requests_per_month: 2000,
        storage_gb: 50,
        brands: 10,
        workspaces: 3,
      },
      current_usage: {
        social_accounts: 2,
        posts_this_month: 12,
        team_members: 3,
        ai_requests_this_month: 45,
        storage_used_gb: 1.2,
      },
    },
  });

  await prisma.subscription.create({
    data: {
      workspace_id: wsAgency.id,
      plan: SubPlan.agency,
      plan_id: 'agency',
      status: SubStatus.active,
      seats: 20,
    },
  });

  await prisma.appearanceSettings.createMany({
    data: [
      {
        workspace_id: wsMain.id,
        primary_color: '#d4af37',
        font_size: '14px',
        sidebar_style: 'expanded',
        brand_name: 'Demo Studio',
      },
      {
        workspace_id: wsAgency.id,
        primary_color: '#0F172A',
        brand_name: 'Agency Hub',
      },
    ],
  });

  await prisma.onboardingState.createMany({
    data: [
      {
        workspace_id: wsMain.id,
        user_id: adminUser.id,
        current_step: 5,
        completed_steps: [0, 1, 2, 3, 4],
        is_complete: true,
        workspace_created: true,
        accounts_connected: true,
        first_post_created: true,
        team_invited: true,
        appearance_set: true,
      },
      {
        workspace_id: wsAgency.id,
        user_id: adminUser.id,
        is_complete: false,
        workspace_created: true,
      },
    ],
  });

  const customRole = await prisma.customRole.create({
    data: {
      workspace_id: wsMain.id,
      name: 'Content Editor',
      description: 'Can edit and schedule posts',
      permissions: { posts: ['read', 'write'], analytics: ['read'] },
    },
  });

  await prisma.workspaceMember.createMany({
    data: [
      {
        workspace_id: wsMain.id,
        user_id: adminUser.id,
        role: Role.admin,
        status: 'active',
        joined_at: new Date(),
        custom_role_id: null,
      },
      {
        workspace_id: wsMain.id,
        user_id: memberUser.id,
        role: Role.member,
        status: 'active',
        joined_at: new Date(),
        custom_role_id: customRole.id,
      },
      {
        workspace_id: wsMain.id,
        user_id: viewerUser.id,
        role: Role.viewer,
        status: 'active',
        joined_at: new Date(),
      },
      {
        workspace_id: wsAgency.id,
        user_id: adminUser.id,
        role: Role.admin,
        status: 'active',
        joined_at: new Date(),
      },
    ],
  });

  const brand = await prisma.brand.create({
    data: {
      workspace_id: wsMain.id,
      name: 'Acme Coffee',
      industry: 'Food & Beverage',
      brand_color: '#6F4E37',
      brand_voice: {
        tone: ['warm', 'authentic'],
        banned_words: ['cheap'],
        formality: 'casual',
      },
      compliance_rules: { require_disclosure: true, prohibited_content: ['hate'] },
    },
  });

  const socialIg = await prisma.socialAccount.create({
    data: {
      workspace_id: wsMain.id,
      brand_id: brand.id,
      platform: Platform.instagram,
      account_name: 'Acme Coffee Official',
      account_handle: '@acmecoffee',
      follower_count: 12500,
      status: AcctStatus.active,
      health_status: AcctHealth.healthy,
    },
  });

  const socialLi = await prisma.socialAccount.create({
    data: {
      workspace_id: wsMain.id,
      brand_id: brand.id,
      platform: Platform.linkedin,
      account_name: 'Acme Coffee',
      account_handle: 'acme-coffee',
      follower_count: 3200,
      status: AcctStatus.active,
      health_status: AcctHealth.healthy,
    },
  });

  const campaign = await prisma.campaign.create({
    data: {
      workspace_id: wsMain.id,
      brand_id: brand.id,
      name: 'Spring Launch 2026',
      objective: 'engagement',
      status: CampaignStatus.active,
      start_date: new Date('2026-04-01'),
      end_date: new Date('2026-06-30'),
      budget: { total: 5000, spent: 1200, currency: 'USD' },
      platforms: ['instagram', 'linkedin'],
      kpis: { target_reach: 100000, target_engagement: 5000 },
    },
  });

  const post = await prisma.post.create({
    data: {
      workspace_id: wsMain.id,
      campaign_id: campaign.id,
      title: 'Welcome Spring',
      status: PostStatus.published,
      content: { text: 'Fresh beans are here!', hashtags: ['#spring', '#coffee'] },
      media_urls: ['https://placehold.co/800x600'],
      scheduled_at: new Date(),
      published_at: new Date(),
      engagement_rate: 4.2,
      metrics: { likes: 1200, comments: 89, shares: 34, reach: 45000 },
      created_by: adminUser.id,
    },
  });

  await prisma.postPlatform.createMany({
    data: [
      {
        post_id: post.id,
        social_account_id: socialIg.id,
        platform: Platform.instagram,
        status: PostStatus.published,
        published_at: new Date(),
        likes: 800,
        comments: 50,
        shares: 20,
        reach: 30000,
      },
      {
        post_id: post.id,
        social_account_id: socialLi.id,
        platform: Platform.linkedin,
        status: PostStatus.published,
        published_at: new Date(),
        likes: 400,
        comments: 39,
        shares: 14,
        reach: 15000,
      },
    ],
  });

  await prisma.analytics.create({
    data: {
      workspace_id: wsMain.id,
      social_account_id: socialIg.id,
      post_id: post.id,
      platform: Platform.instagram,
      date: '2026-04-15',
      period: 'daily',
      impressions: 52000,
      reach: 45000,
      engagement: 2100,
      likes: 800,
      comments: 50,
      shares: 20,
      engagement_rate: 4.2,
    },
  });

  const contact = await prisma.contact.create({
    data: {
      workspace_id: wsMain.id,
      display_name: 'Jane Influencer',
      email: 'jane@example.com',
      platform: Platform.instagram,
      username: 'janebrews',
      is_influencer: true,
      tags: ['vip'],
    },
  });

  await prisma.conversation.create({
    data: {
      workspace_id: wsMain.id,
      contact_id: contact.id,
      platform: Platform.instagram,
      type: 'dm',
      status: 'open',
      priority: 'normal',
      unread_count: 2,
      sentiment: 'positive',
      participant: { display_name: 'Jane Influencer', username: 'janebrews', is_verified: true },
      messages: [
        {
          role: 'user',
          content: 'Love your new blend!',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  });

  await prisma.mediaAsset.create({
    data: {
      workspace_id: wsMain.id,
      name: 'hero-spring.jpg',
      file_url: 'https://placehold.co/1200x630',
      url: 'https://placehold.co/1200x630',
      file_type: 'image',
      type: 'image',
      file_size: 240000,
      category: 'promotional',
      is_brand_asset: true,
    },
  });

  await prisma.mention.create({
    data: {
      workspace_id: wsMain.id,
      brand_id: brand.id,
      platform: Platform.instagram,
      author: { name: 'Fan User', handle: '@fan123' },
      content: '@acmecoffee best latte in town',
      sentiment: Sentiment.positive,
      status: MentionStatus.new,
      mention_type: 'brand_keyword',
    },
  });

  await prisma.keywordTrack.create({
    data: {
      workspace_id: wsMain.id,
      brand_id: brand.id,
      keyword: 'acme coffee review',
      is_active: true,
      stats: { hits_7d: 42 },
    },
  });

  await prisma.competitorTrack.create({
    data: {
      workspace_id: wsMain.id,
      competitor_name: 'Rival Roasters',
      website: 'https://example.com',
      social_handles: { instagram: '@rival' },
      tracking_keywords: ['coffee', 'subscription'],
    },
  });

  await prisma.trendAnalysis.create({
    data: {
      workspace_id: wsMain.id,
      trend_title: 'Cold brew summer',
      trend_type: TrendType.hashtag,
      keywords: ['coldbrew', 'summer'],
      platforms: ['instagram', 'tiktok'],
      momentum: Momentum.rising,
      total_mentions: 12000,
    },
  });

  await prisma.teamTask.create({
    data: {
      workspace_id: wsMain.id,
      title: 'Approve April content calendar',
      status: TaskStatus.in_progress,
      priority: PrismaPriority.high,
      assigned_to: memberUser.id,
      created_by: adminUser.id,
    },
  });

  await prisma.teamDiscussion.create({
    data: {
      workspace_id: wsMain.id,
      title: 'Campaign kickoff notes',
      body: 'Remember to tag compliance on all paid posts.',
      author_id: adminUser.id,
      replies: [],
    },
  });

  await prisma.contentTemplate.create({
    data: {
      workspace_id: wsMain.id,
      name: 'Product highlight',
      platform: Platform.instagram,
      content: { headline: 'New drop', body: 'Try it today.' },
      use_count: 3,
    },
  });

  await prisma.savedReply.create({
    data: {
      workspace_id: wsMain.id,
      title: 'Thanks for reaching out',
      content: 'Thanks! Our team will reply within 24h.',
      use_count: 10,
    },
  });

  await prisma.automation.create({
    data: {
      workspace_id: wsMain.id,
      name: 'Negative mention alert',
      trigger: { type: 'sentiment_detected', platforms: ['instagram'], conditions: [] },
      actions: [{ type: 'send_notification', config: { channel: 'email' } }],
      status: 'active',
      is_active: true,
    },
  });

  const deal = await prisma.brandDeal.create({
    data: {
      workspace_id: wsMain.id,
      brand_id: brand.id,
      deal_name: 'Q2 Sponsored Series',
      brand_name: 'Partner Brand',
      deal_type: 'sponsored_post',
      amount: 2500,
      contract_value: 2500,
      status: 'active',
      deliverables: { posts_required: 4, posts_completed: 1 },
    },
  });

  await prisma.revenue.createMany({
    data: [
      {
        workspace_id: wsMain.id,
        brand_deal_id: deal.id,
        post_id: post.id,
        source: 'brand_deal',
        amount: 625,
        currency: 'USD',
        platform: Platform.instagram,
        transaction_date: new Date(),
      },
      {
        workspace_id: wsMain.id,
        source: 'ecommerce',
        amount: 199.99,
        description: 'Merch order',
      },
    ],
  });

  await prisma.integration.createMany({
    data: [
      {
        workspace_id: wsMain.id,
        name: 'Slack',
        integration_type: IntegType.slack,
        is_active: true,
        sync_status: SyncStatus.healthy,
      },
      {
        workspace_id: wsMain.id,
        name: 'SendGrid',
        integration_type: IntegType.sendgrid,
        is_active: true,
        sync_status: SyncStatus.never_synced,
      },
    ],
  });

  await prisma.clientReport.create({
    data: {
      workspace_id: wsMain.id,
      report_name: 'Monthly Performance',
      report_type: 'comprehensive',
      frequency: ReportFreq.monthly,
      status: ReportStatus.sent,
      metrics_included: ['reach', 'engagement'],
      delivery_time: '09:00',
      auto_send_enabled: true,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        workspace_id: wsMain.id,
        user_id: adminUser.id,
        type: NotifType.post_published,
        title: 'Post published',
        message: 'Your post is live on Instagram.',
        is_read: false,
      },
      {
        workspace_id: wsMain.id,
        type: NotifType.system,
        title: 'Seed complete',
        message: 'Database seeded successfully.',
      },
    ],
  });

  const workflow = await prisma.approvalWorkflow.create({
    data: {
      workspace_id: wsMain.id,
      name: 'Standard review',
      stages: [{ name: 'Manager', approver_ids: [adminUser.id], order: 0 }],
      platforms: ['instagram'],
      is_active: true,
    },
  });

  const approvalPost = await prisma.post.create({
    data: {
      workspace_id: wsMain.id,
      title: 'Pending approval draft',
      status: PostStatus.pending_approval,
      approval_required: true,
      content: { text: 'Pending…' },
      created_by: memberUser.id,
    },
  });

  await prisma.contentApproval.create({
    data: {
      workspace_id: wsMain.id,
      workflow_id: workflow.id,
      post_id: approvalPost.id,
      status: ApprovalStatus.pending_review,
      submitted_by: memberUser.id,
    },
  });

  await prisma.agencyClient.create({
    data: {
      agency_workspace_id: wsAgency.id,
      name: 'Client Brand LLC',
      email: 'client@clientbrand.com',
      status: 'active',
      plan: 'growth',
      monthly_retainer: 5000,
    },
  });

  await prisma.benchmark.create({
    data: {
      workspace_id: wsMain.id,
      industry: 'Food & Beverage',
      platform: Platform.instagram,
      metric_name: 'engagement_rate',
      metric_value: 3.5,
      percentile_50: 3.2,
      your_value: 4.2,
      period: '30d',
    },
  });

  await prisma.ecommerceIntegration.create({
    data: {
      workspace_id: wsMain.id,
      platform: 'shopify',
      shop_name: 'Acme Merch',
      shop_url: 'https://acme-shop.example.com',
      is_active: true,
    },
  });

  await prisma.supportTicket.create({
    data: {
      workspace_id: wsMain.id,
      contact_id: contact.id,
      subject: 'Billing question',
      status: 'open',
      priority: PrismaPriority.medium,
      messages: [{ from: 'user', body: 'Invoice copy please', at: new Date().toISOString() }],
    },
  });

  await prisma.optimizationRule.create({
    data: {
      workspace_id: wsMain.id,
      name: 'Best time to post',
      rule_type: 'schedule',
      platform: Platform.instagram,
      config: { windows: ['09:00', '18:00'] },
      is_active: true,
    },
  });

  await prisma.appLog.create({
    data: {
      user_id: adminUser.id,
      workspace_id: wsMain.id,
      page_name: 'Dashboard',
      event_type: 'page_view',
      path: '/',
    },
  });

  const video = await prisma.video.create({
    data: {
      workspace_id: wsMain.id,
      platform: Platform.youtube,
      title: 'Behind the roast',
      status: 'published',
      views: 5000,
      likes: 200,
      platform_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      file_size_bytes: BigInt(12_500_000),
      created_by: adminUser.id,
    },
  });

  await prisma.platformComment.create({
    data: {
      workspace_id: wsMain.id,
      video_id: video.id,
      platform: Platform.youtube,
      author_name: 'Viewer1',
      content: 'Great video!',
      sentiment: Sentiment.positive,
    },
  });

  await prisma.userInvitation.create({
    data: {
      workspace_id: wsMain.id,
      invited_by: adminUser.id,
      email: 'invitee@example.com',
      role: Role.member,
      token: `invite_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 864e5),
    },
  });

  await prisma.platformReview.create({
    data: {
      workspace_id: wsMain.id,
      platform: Platform.google_business,
      reviewer_name: 'Local Guide',
      rating: 5,
      content: 'Friendly staff and great coffee.',
      sentiment: Sentiment.positive,
    },
  });

  await prisma.notificationSchedule.create({
    data: {
      workspace_id: wsMain.id,
      post_id: post.id,
      platform: Platform.instagram,
      notification_type: 'post',
      title: 'New post',
      message: 'You have a new post from Acme Coffee.',
      status: 'sent',
      sent_at: new Date(),
    },
  });

  await prisma.aIConversation.create({
    data: {
      workspace_id: wsMain.id,
      user_id: adminUser.id,
      agent_name: 'assistant',
      title: 'Content ideas',
      messages: [
        {
          role: 'user',
          content: 'Give me 3 Instagram caption ideas.',
          timestamp: new Date().toISOString(),
        },
        {
          role: 'assistant',
          content: 'Here are three witty captions…',
          timestamp: new Date().toISOString(),
        },
      ],
    },
  });

  console.log('');
  console.log('Seed finished.');
  console.log('  Workspaces:', wsMain.slug, '|', wsAgency.slug);
  console.log('  Log in as:');
  console.log('    ', adminUser.email, '/', SEED_PASSWORD);
  console.log('    ', memberUser.email, '/', SEED_PASSWORD);
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
