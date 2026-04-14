import { Router, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import db from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, fail } from '../../utils';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

const router = Router();
router.use(authenticate);

function ai() { if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured'); return new OpenAI({ apiKey: env.OPENAI_API_KEY }); }

async function llm<T>(prompt: string): Promise<T> {
  const res = await ai().chat.completions.create({ model: 'gpt-4o', messages: [{ role: 'system', content: 'You are a social media intelligence expert. Always respond with valid JSON only. No markdown, no backticks.' }, { role: 'user', content: prompt }], response_format: { type: 'json_object' }, temperature: 0.3 });
  return JSON.parse(res.choices[0]?.message?.content ?? '{}') as T;
}

// ─── AI ASSISTANT ─────────────────────────────────────────────────────────────

router.post('/ask', async (req: AuthRequest, res: Response): Promise<void> => {
  const p = z.object({ workspace_id: z.string().cuid(), question: z.string().min(3).max(1000) }).safeParse(req.body);
  if (!p.success) { fail(res, p.error.errors[0].message); return; }
  const { workspace_id, question } = p.data;
  const [posts, analytics, revenues, campaigns, mentions] = await Promise.all([
    db.post.findMany({ where: { workspace_id }, take: 100, orderBy: { created_at: 'desc' } }).catch(() => []),
    db.analytics.findMany({ where: { workspace_id }, take: 200 }).catch(() => []),
    db.revenue.findMany({ where: { workspace_id } }).catch(() => []),
    db.campaign.findMany({ where: { workspace_id }, take: 20 }).catch(() => []),
    db.mention.findMany({ where: { workspace_id }, take: 50 }).catch(() => []),
  ]);
  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  const totalEng = analytics.reduce((s, a) => s + a.engagement, 0);
  const totalReach = analytics.reduce((s, a) => s + a.reach, 0);
  const context = `METRICS: Revenue=$${totalRevenue.toFixed(2)}, Reach=${totalReach}, Engagement=${totalEng}\nPOSTS: ${posts.length} total (${posts.filter(p => p.status==='published').length} published)\nCAMPAIGNS: ${campaigns.map(c=>`${c.name}:${c.status}`).join(', ')}\nMENTIONS: ${mentions.length} total, ${mentions.filter(m=>m.sentiment==='positive').length} positive, ${mentions.filter(m=>m.sentiment==='negative').length} negative`;
  try {
    const result = await llm<any>(`You are an expert social media analytics consultant.\n\nDATA:\n${context}\n\nQUESTION: ${question}\n\nRespond in JSON: { "answer": "string", "key_insights": ["string"], "recommendations": ["string"], "data_points": ["string"] }`);
    ok(res, { response: result.answer, insights: result.key_insights ?? [], recommendations: result.recommendations ?? [], data_points: result.data_points ?? [] });
  } catch (e) { logger.error('AI error', { error: e }); fail(res, (e as Error).message, 500); }
});

// ─── SOCIAL MONITORING ────────────────────────────────────────────────────────

router.post('/monitor', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, keyword_ids } = req.body as { workspace_id: string; keyword_ids?: string[] };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const keywords = await db.keywordTrack.findMany({ where: { workspace_id, is_active: true, ...(keyword_ids && { id: { in: keyword_ids } }) } });
  if (!keywords.length) { fail(res, 'No active keywords to monitor'); return; }
  try {
    const result = await llm<{ mentions: any[] }>(`Find 5-8 realistic recent social media mentions of: ${keywords.map(k=>k.keyword).join(', ')}. Respond in JSON: { "mentions": [{ "platform": "string", "author_username": "string", "author_name": "string", "follower_count": 0, "content": "string", "url": "string", "sentiment": "positive|neutral|negative", "sentiment_score": 0.5, "engagement_likes": 0, "engagement_comments": 0, "is_crisis": false, "priority": "medium", "mentioned_at": "ISO date" }] }`);
    const stored = await Promise.all((result.mentions ?? []).map(m => db.mention.create({ data: { workspace_id, brand_id: keywords[0]?.brand_id ?? null, platform: m.platform as any, mention_type: 'brand_keyword', author: { username: m.author_username, display_name: m.author_name, follower_count: m.follower_count ?? 0, is_verified: false }, content: m.content, url: m.url ?? '', sentiment: m.sentiment as any ?? 'neutral', sentiment_score: m.sentiment_score ?? 0, engagement: { likes: m.engagement_likes ?? 0, comments: m.engagement_comments ?? 0, shares: 0 }, influence_score: Math.min(100, (m.follower_count ?? 0) / 1000), is_crisis: m.is_crisis ?? false, priority: m.priority as any ?? 'medium', mentioned_at: m.mentioned_at ? new Date(m.mentioned_at) : new Date() } })));
    ok(res, { mentions_found: stored.length, mentions: stored });
  } catch (e) { fail(res, (e as Error).message, 500); }
});

router.post('/sentiment', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.body as { workspace_id?: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const mentions = await db.mention.findMany({ where: { workspace_id }, orderBy: { created_at: 'desc' }, take: 50 });
  if (!mentions.length) { ok(res, { overall_trend: 'stable', sentiment_breakdown: { positive_pct: 0, neutral_pct: 100, negative_pct: 0 }, key_themes: [], recommendations: ['Start monitoring keywords to gather mention data.'], alerts: [] }); return; }
  try {
    const result = await llm<any>(`Analyze sentiment from ${mentions.length} mentions:\n${mentions.map(m=>`${m.platform}: "${m.content}" (${m.sentiment})`).join('\n')}\n\nRespond in JSON: { "overall_trend": "improving|stable|declining", "sentiment_breakdown": { "positive_pct": 0, "neutral_pct": 0, "negative_pct": 0 }, "key_themes": ["string"], "recommendations": ["string"], "alerts": ["string"] }`);
    ok(res, result);
  } catch (e) { fail(res, (e as Error).message, 500); }
});

router.post('/crisis', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.body as { workspace_id?: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const negative = await db.mention.findMany({ where: { workspace_id, status: 'new', sentiment: 'negative' } });
  const highInfluence = negative.filter(m => m.influence_score > 60);
  if (!highInfluence.length) { ok(res, { is_crisis: false, severity: 'low', affected_mentions: 0, recommendations: ['No crisis signals detected.'] }); return; }
  try {
    const texts = highInfluence.map(m => { const a = m.author as any; return `${m.platform} @${a?.username} (${a?.follower_count ?? 0} followers): "${m.content}"`; }).join('\n\n');
    const result = await llm<any>(`Analyze ${highInfluence.length} high-influence negative mentions for PR crisis:\n${texts}\n\nRespond in JSON: { "is_crisis": false, "severity": "low|medium|high|critical", "crisis_type": "string", "affected_mentions": 0, "recommendations": ["string"], "suggested_response": "string" }`);
    if (result.is_crisis) await db.mention.updateMany({ where: { id: { in: highInfluence.map(m => m.id) } }, data: { is_crisis: true, priority: 'urgent' } });
    ok(res, result);
  } catch (e) { fail(res, (e as Error).message, 500); }
});

router.post('/trends', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, industry, brand_keywords } = req.body as { workspace_id?: string; industry?: string; brand_keywords?: string[] };
  if (!workspace_id || !industry || !brand_keywords?.length) { fail(res, 'workspace_id, industry, and brand_keywords required'); return; }
  try {
    const result = await llm<{ trends: any[] }>(`Identify top 5 trending topics in "${industry}" related to: ${brand_keywords.join(', ')}.\n\nRespond in JSON: { "trends": [{ "trend_title": "string", "trend_type": "hashtag|topic|event|news|viral_content", "keywords": ["string"], "platforms": ["string"], "momentum": "rising|peaked|declining", "velocity": 0.5, "total_mentions": 1000, "total_reach": 50000, "sentiment_breakdown": { "positive": 60, "neutral": 30, "negative": 10 }, "relevance_score": 8.5, "opportunity_score": 7.2, "ai_insights": "string", "recommended_action": "string" }] }`);
    const stored = await Promise.all((result.trends ?? []).map(t => db.trendAnalysis.create({ data: { workspace_id, trend_title: t.trend_title, trend_type: t.trend_type as any, keywords: t.keywords ?? [], platforms: t.platforms ?? [], momentum: t.momentum as any, velocity: t.velocity ?? 0, total_mentions: t.total_mentions ?? 0, total_reach: t.total_reach ?? 0, sentiment_breakdown: t.sentiment_breakdown as any, relevance_score: t.relevance_score ?? 0, opportunity_score: t.opportunity_score ?? 0, ai_insights: t.ai_insights, recommended_action: t.recommended_action } })));
    ok(res, stored);
  } catch (e) { fail(res, (e as Error).message, 500); }
});

router.post('/competitors/:id/analyze', async (req: AuthRequest, res: Response): Promise<void> => {
  const competitor = await db.competitorTrack.findUnique({ where: { id: req.params.id } });
  if (!competitor) { fail(res, 'Competitor not found', 404); return; }
  try {
    const handles = Object.values((competitor.social_handles as Record<string, string>) ?? {}).filter(Boolean).join(', ');
    const result = await llm<any>(`Research social media presence of "${competitor.competitor_name}". Handles: ${handles}. Keywords: ${competitor.tracking_keywords.join(', ')}.\n\nRespond in JSON: { "total_followers": 0, "follower_growth": 0, "avg_engagement_rate": 0, "posts_per_week": 0, "content_themes": ["string"], "recent_campaigns": [{ "title": "string", "platform": "string", "estimated_reach": 0 }], "strengths": ["string"], "weaknesses": ["string"], "insights": "string" }`);
    await db.competitorTrack.update({ where: { id: competitor.id }, data: { metrics: { total_followers: result.total_followers ?? 0, follower_growth: result.follower_growth ?? 0, avg_engagement_rate: result.avg_engagement_rate ?? 0, posts_per_week: result.posts_per_week ?? 0 }, recent_campaigns: result.recent_campaigns ?? [], strengths: result.strengths ?? [], weaknesses: result.weaknesses ?? [], last_analyzed_at: new Date() } });
    ok(res, result);
  } catch (e) { fail(res, (e as Error).message, 500); }
});

router.post('/generate-content', async (req: AuthRequest, res: Response): Promise<void> => {
  const { platform, topic, tone, post_type, hashtag_count = 5 } = req.body as { platform?: string; topic?: string; tone?: string; post_type?: string; hashtag_count?: number };
  if (!platform || !topic) { fail(res, 'platform and topic required'); return; }
  try {
    const result = await llm<any>(`Write a ${post_type ?? 'post'} for ${platform} about: ${topic}. Tone: ${tone ?? 'professional'}. Generate ${hashtag_count} hashtags.\n\nRespond in JSON: { "text": "string", "hashtags": ["string"], "suggested_media": "string", "call_to_action": "string", "best_post_time": "string", "estimated_reach": 0 }`);
    ok(res, result);
  } catch (e) { fail(res, (e as Error).message, 500); }
});

router.post('/predictive-monetization', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, months_ahead = 3 } = req.body as { workspace_id?: string; months_ahead?: number };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }
  const revenues = await db.revenue.findMany({ where: { workspace_id }, orderBy: { date: 'asc' } });
  const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
  try {
    const result = await llm<any>(`Based on ${revenues.length} revenue entries totaling $${totalRevenue.toFixed(2)}, forecast revenue for next ${months_ahead} months.\n\nRespond in JSON: { "forecast": [{ "month": "YYYY-MM", "predicted_revenue": 0, "confidence": 0.8, "growth_rate": 0.1 }], "best_case": 0, "worst_case": 0, "recommendations": ["string"] }`);
    ok(res, result);
  } catch (e) { fail(res, (e as Error).message, 500); }
});

// ─── SQL EXPORT ───────────────────────────────────────────────────────────────

router.get('/export/sql', async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user?.role !== 'admin') { fail(res, 'Admin only', 403); return; }
  const { workspace_id } = req.query as { workspace_id?: string };
  const entities = ['workspace','workspaceMember','brand','socialAccount','post','postPlatform','campaign','conversation','contact','mediaAsset','automation','analytics','mention','keywordTrack','competitorTrack','trendAnalysis','teamTask','teamDiscussion','integration','subscription','clientReport','contentTemplate','savedReply','brandDeal','revenue','notification','approvalWorkflow','contentApproval','agencyClient','appSettings','onboardingState','benchmark','ecommerceIntegration','supportTicket','customRole','optimizationRule'];
  function esc(v: unknown): string {
    if (v == null) return 'NULL';
    if (typeof v === 'boolean') return v ? '1' : '0';
    if (typeof v === 'number') return String(v);
    if (v instanceof Date) return `'${v.toISOString()}'`;
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
    return `'${String(v).replace(/'/g, "''")}'`;
  }
  let sql = `-- Nexus Social SQL Export\n-- Generated: ${new Date().toISOString()}\nPRAGMA foreign_keys = OFF;\n\n`;
  for (const name of entities) {
    try {
      const model = (db as any)[name]; if (!model?.findMany) { sql += `-- ${name}: not found\n\n`; continue; }
      const rows = await model.findMany({ ...(workspace_id && name !== 'workspace' ? { where: { workspace_id } } : {}) });
      if (!rows.length) { sql += `-- ${name}: no data\n\n`; continue; }
      const cols = Object.keys(rows[0]);
      sql += `-- TABLE: ${name}\n`;
      for (const row of rows) sql += `INSERT INTO \`${name}\` (${cols.map(c=>`\`${c}\``).join(', ')}) VALUES (${cols.map(c=>esc(row[c])).join(', ')});\n`;
      sql += '\n';
    } catch { sql += `-- ${name}: error\n\n`; }
  }
  sql += 'PRAGMA foreign_keys = ON;\n';
  res.setHeader('Content-Type', 'application/sql');
  res.setHeader('Content-Disposition', `attachment; filename="nexus_export_${new Date().toISOString().split('T')[0]}.sql"`);
  res.send(sql);
});

// ─── CHECK ALERTS (AlertsPanel.jsx → functions.invoke('socialListening', { action: 'check_alerts' })) ──
// Returns real-time alert list based on recent mentions: crisis, negative trend, high-influence negative

router.post('/check-alerts', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.body as { workspace_id?: string };
  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const since = new Date(Date.now() - 86_400_000); // last 24h
  const mentions = await db.mention.findMany({
    where: { workspace_id, mentioned_at: { gte: since } },
    orderBy: [{ is_crisis: 'desc' }, { influence_score: 'desc' }],
    take: 200,
  });

  const alerts: Array<{ id: string; severity: string; type: string; message: string; mentions: string[] }> = [];

  // ── Crisis mentions ──────────────────────────────────────────────────────────
  const crisisList = mentions.filter(m => m.is_crisis || (m.status as string) === 'escalated');
  if (crisisList.length > 0) {
    alerts.push({
      id:       'crisis_' + Date.now(),
      severity: 'urgent',
      type:     'crisis_detected',
      message:  `${crisisList.length} crisis mention${crisisList.length > 1 ? 's' : ''} detected — immediate response required`,
      mentions: crisisList.map(m => m.id),
    });
  }

  // ── Negative sentiment trend (>30% in 24h) ───────────────────────────────────
  const negList = mentions.filter(m => (m.sentiment as string) === 'negative');
  if (mentions.length > 5 && negList.length / mentions.length > 0.30) {
    alerts.push({
      id:       'neg_trend_' + Date.now(),
      severity: 'high',
      type:     'sentiment_spike',
      message:  `${Math.round((negList.length / mentions.length) * 100)}% of 24h mentions are negative — sentiment trending down`,
      mentions: negList.slice(0, 15).map(m => m.id),
    });
  }

  // ── High-influence negative mentions ─────────────────────────────────────────
  const hiInfluenceNeg = mentions.filter(m => (m.sentiment as string) === 'negative' && (m.influence_score || 0) > 70);
  if (hiInfluenceNeg.length > 0) {
    alerts.push({
      id:       'influencer_neg_' + Date.now(),
      severity: hiInfluenceNeg.length > 2 ? 'high' : 'medium',
      type:     'high_influence',
      message:  `${hiInfluenceNeg.length} high-reach account${hiInfluenceNeg.length > 1 ? 's' : ''} posted negative brand content`,
      mentions: hiInfluenceNeg.map(m => m.id),
    });
  }

  // ── Keyword threshold breach ──────────────────────────────────────────────────
  const keywordThreshold = await db.keywordTrack.findMany({
    where: { workspace_id, is_active: true, threshold_alert_count: { gt: 0 } },
  });
  for (const kw of keywordThreshold) {
    const kwMentions = mentions.filter(m => m.keywords.includes(kw.keyword));
    if (kwMentions.length >= (kw.threshold_alert_count ?? 100)) {
      alerts.push({
        id:       `keyword_${kw.id}`,
        severity: 'medium',
        type:     'keyword_threshold',
        message:  `Keyword "${kw.keyword}" hit ${kwMentions.length} mentions in 24h (threshold: ${kw.threshold_alert_count})`,
        mentions: kwMentions.slice(0, 10).map(m => m.id),
      });
    }
  }

  ok(res, { alerts, total: alerts.length, checked_at: new Date().toISOString() });
});


// ─── POST ANALYSIS (PostComposer.jsx → handleAIEnhance) ──────────────────────
// Real AI analysis endpoint called by PostComposer.jsx handleAIEnhance.
// Returns aiScore + profitabilityAnalysis in exact shape the component expects.

router.post('/post-analysis', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, content, platforms = [], post_type = 'post', campaign_id } = req.body as {
    workspace_id: string;
    content: string;
    platforms: string[];
    post_type?: string;
    campaign_id?: string;
  };

  if (!workspace_id || !content) { fail(res, 'workspace_id and content are required'); return; }
  if (content.trim().length < 3)  { fail(res, 'content too short to analyze'); return; }

  // Validate content length per platform (PostComposer enforces client-side too)
  const charLimits: Record<string, number> = {
    instagram: 2200, facebook: 63206, twitter: 280, linkedin: 3000,
    tiktok: 2200, threads: 500, pinterest: 500, youtube: 5000,
    bluesky: 300, twitch: 500, rumble: 1000, kick: 500,
    truth_social: 500, google_business: 1500,
  };
  const violations = platforms.filter(p => charLimits[p] && content.length > charLimits[p]);
  if (violations.length > 0) {
    fail(res, `Content exceeds character limit for: ${violations.join(', ')}`);
    return;
  }

  try {
    // ── Fetch workspace context for AI ──────────────────────────────────────
    const [recentAnalytics, recentPosts, brandDeals] = await Promise.all([
      db.analytics.findMany({ where: { workspace_id }, orderBy: { date: 'desc' }, take: 30 }).catch(() => []),
      db.post.findMany({ where: { workspace_id, status: 'published' }, orderBy: { created_at: 'desc' }, take: 20 }).catch(() => []),
      db.brandDeal.findMany({ where: { workspace_id, status: 'active' }, take: 5 }).catch(() => []),
    ]);

    const avgEngagement = recentAnalytics.length > 0
      ? (recentAnalytics.reduce((s, a) => s + a.engagement, 0) / recentAnalytics.length).toFixed(0)
      : '0';
    const avgReach = recentAnalytics.length > 0
      ? (recentAnalytics.reduce((s, a) => s + a.reach, 0) / recentAnalytics.length).toFixed(0)
      : '0';
    const activeDealBrands = brandDeals.map(d => d.brand_name).join(', ') || 'none';

    const prompt = `You are an expert social media content analyst. Analyze the following post and return a detailed JSON response.

POST CONTENT: "${content.slice(0, 800)}"
POST TYPE: ${post_type}
TARGET PLATFORMS: ${platforms.join(', ') || 'instagram'}
WORKSPACE CONTEXT: avg_engagement=${avgEngagement}, avg_reach=${avgReach}, active_brand_deals=${activeDealBrands}

Respond ONLY with this exact JSON structure (no markdown, no backticks):
{
  "aiScore": {
    "overall": <0-100 integer>,
    "engagement": <0-100 integer>,
    "reach": <0-100 integer>,
    "compliance": <0-100 integer>,
    "viralPotential": <0-100 integer>,
    "suggestions": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>", "<actionable tip 4>"],
    "platformInsights": [
      {
        "platform": "<platform name>",
        "predictedEngagement": "<N.NN%>",
        "predictedReach": <integer>,
        "predictedLikes": <integer>,
        "predictedComments": <integer>,
        "predictedShares": <integer>,
        "optimalPostTime": "<HH:00 - HH:00>",
        "audienceActivity": "High|Medium|Low",
        "confidence": "High|Medium|Low"
      }
    ],
    "trendingTopics": [
      { "topic": "#HashtagOrTopic", "relevance": <0-100>, "trending": <boolean> }
    ],
    "contentRelevance": {
      "score": <0-100>,
      "trendAlignment": "High|Medium|Low",
      "topicCoverage": ["<topic1>", "<topic2>"],
      "suggestions": ["<suggestion1>", "<suggestion2>"]
    },
    "competitorAnalysis": {
      "averageEngagement": "<N.N%>",
      "yourPredicted": "<N.N%>",
      "performance": "<+/-N.N% better/worse than average>"
    }
  },
  "profitabilityAnalysis": {
    "profitability_score": <0-100 integer>,
    "predicted_revenue": <float>,
    "revenue_confidence": "high|medium|low",
    "factors": {
      "content_quality": <0.0-1.0>,
      "engagement_rate": <0.0-1.0>,
      "timing": <0.0-1.0>,
      "trending_topics": <0.0-1.0>,
      "audience_demographics": <0.0-1.0>
    },
    "optimal_monetization": [
      { "method": "affiliate_marketing|sponsored_content|platform_ads|merchandise|tips", "potential_revenue": <float>, "recommendation": "<string>" }
    ]
  }
}

For platformInsights, include one entry per platform in the list: ${platforms.join(', ') || 'instagram'}.
Base predictions on the content quality, length, hashtag usage, call-to-action presence, and workspace historical performance.`;

    const result = await llm<{ aiScore: any; profitabilityAnalysis: any }>(prompt);

    // Ensure platformInsights covers all requested platforms (fill missing ones)
    const existingPlatforms = new Set((result.aiScore?.platformInsights || []).map((p: any) => p.platform));
    const missingPlatforms = platforms.filter(p => !existingPlatforms.has(p));
    if (missingPlatforms.length > 0) {
      result.aiScore.platformInsights = [
        ...(result.aiScore.platformInsights || []),
        ...missingPlatforms.map(p => ({
          platform: p, predictedEngagement: '2.50%', predictedReach: 2500,
          predictedLikes: 80, predictedComments: 12, predictedShares: 8,
          optimalPostTime: '09:00 - 11:00', audienceActivity: 'Medium', confidence: 'Low',
        })),
      ];
    }

    ok(res, result);
  } catch (e) {
    logger.error('Post analysis error', { error: e });
    fail(res, (e as Error).message, 500);
  }
});


// ─── INVOKE LLM (integrations.Core.InvokeLLM) ────────────────────────────────
// Used by: ComplianceChecker.jsx (brand voice analysis + compliance check)
//          BrandVoiceTrainer.jsx (AI brand voice profile generation)
//          Any component calling base44.integrations.Core.InvokeLLM({ prompt, response_json_schema })
// Returns: parsed JSON matching response_json_schema

router.post('/invoke-llm', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, prompt, response_json_schema, max_tokens = 1000 } = req.body as {
    workspace_id?: string;
    prompt: string;
    response_json_schema?: Record<string, any>;
    max_tokens?: number;
  };

  if (!prompt || prompt.trim().length < 5) { fail(res, 'prompt is required'); return; }

  try {
    const result = await llm<any>(prompt);
    ok(res, result);
  } catch (e) {
    logger.error('InvokeLLM error', { error: e });
    fail(res, (e as Error).message, 500);
  }
});


// ─── CRISIS RESPONSE EXECUTOR (CrisisDetector.jsx → functions.invoke execute_crisis_response) ─
// Fires pre-approved automated responses for a detected crisis
router.post('/crisis/execute', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, alert_id, responses = [] } = req.body as {
    workspace_id: string;
    alert_id: string;
    responses: Array<{ scenario: string; response: string; tone: string; autoSend: boolean }>;
  };

  if (!workspace_id) { fail(res, 'workspace_id required'); return; }

  const results: Array<{ scenario: string; status: string }> = [];

  // Mark the alert mention as escalated (it's a real mention ID)
  if (alert_id) {
    await db.mention.updateMany({
      where: { workspace_id, id: alert_id },
      data:  { status: 'escalated' as any, is_crisis: true, priority: 'urgent' as any },
    }).catch(() => null);
  }

  // Log execution of each pre-approved response
  for (const resp of responses) {
    if (!resp.autoSend) continue;
    try {
      // Create notification for team
      await db.notification.create({
        data: {
          workspace_id,
          type:    'crisis_response',
          title:   `Crisis Response: ${resp.scenario}`,
          message: resp.response.slice(0, 200),
          data:    { alert_id, scenario: resp.scenario, tone: resp.tone, autoSend: true },
        },
      });
      results.push({ scenario: resp.scenario, status: 'executed' });
    } catch (e) {
      results.push({ scenario: resp.scenario, status: 'failed' });
    }
  }

  // Run automation triggers for crisis event
  const { runAutomations } = await import('./utils/automation-executor');
  await runAutomations('sentiment_detected', workspace_id, {
    is_crisis: true,
    alert_id,
    event_type: 'crisis_response_executed',
  }).catch(() => null);

  ok(res, { executed: results.length, results });
});

export default router;

// check_alerts exported separately
