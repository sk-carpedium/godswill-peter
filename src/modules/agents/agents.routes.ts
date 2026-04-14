import { Router, Request, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import db from '../../config/database';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, created, fail, notFound, paginated, parsePage } from '../../utils';
import { logger } from '../../config/logger';

const router = Router();

// ─── AI CLIENT ────────────────────────────────────────────────────────────────

function ai() {
  if (!env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

// SSE clients for real-time conversation streaming
const convSSEClients = new Map<string, Set<Response>>();

function pushToConversation(conversationId: string, data: object) {
  const clients = convSSEClients.get(conversationId);
  if (!clients?.size) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => { try { client.write(payload); } catch { clients.delete(client); } });
}

// ─── AGENT SYSTEM PROMPTS ─────────────────────────────────────────────────────

const AGENT_PROMPTS: Record<string, string> = {
  assistant: `You are Nexus AI, an expert social media management assistant. You help users with:
- Content strategy and post ideas
- Analytics insights and performance optimization
- Campaign planning and execution
- Platform-specific best practices (Instagram, TikTok, YouTube, LinkedIn, etc.)
- Monetization strategies and brand deal negotiation
- Social listening and competitor analysis
- Team collaboration and workflow optimization
Always provide actionable, data-driven advice. Be concise and professional.`,

  customer_support: `You are a helpful customer support agent for Nexus Social, a social media management platform. You help users with:
- How to connect social media accounts
- How to schedule and publish posts
- How to read analytics and reports
- How to invite team members
- How to set up automations
- Billing and subscription questions
- Technical troubleshooting
Be friendly, empathetic and solution-focused. If unsure, suggest contacting the team.`,

  analytics: `You are an analytics expert specializing in social media performance analysis. You analyze data to:
- Identify engagement trends and patterns
- Recommend optimal posting times
- Explain performance drops or spikes
- Suggest content improvements based on metrics
- Provide ROI analysis and revenue attribution
Always cite specific numbers when available. Be precise and data-driven.`,

  content: `You are a creative social media content strategist. You help with:
- Writing compelling post captions and hooks
- Generating hashtag strategies
- Creating content calendars
- Adapting content for different platforms
- A/B testing suggestions for captions
- Trending topic integration
Be creative, engaging, and platform-aware.`,
};

// ─── LIST CONVERSATIONS ───────────────────────────────────────────────────────
// AIAssistant.jsx: agents.listConversations({ agent_name: 'customer_support' })

router.get('/conversations', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { agent_name, workspace_id } = req.query as Record<string, string>;
  const { page, limit, skip } = parsePage(req.query);

  const where: any = {
    user_id:   req.user!.userId,
    is_active: true,
    ...(agent_name    && { agent_name }),
    ...(workspace_id  && { workspace_id }),
  };

  const [total, convs] = await Promise.all([
    db.aIConversation.count({ where }),
    db.aIConversation.findMany({
      where,
      select: { id: true, agent_name: true, title: true, metadata: true, created_at: true, updated_at: true, token_count: true,
        messages: true },  // returns full messages array for list
      orderBy: { updated_at: 'desc' },
      skip, take: limit,
    }),
  ]);

  paginated(res, convs, total, page, limit);
});

// ─── GET ONE CONVERSATION ─────────────────────────────────────────────────────

router.get('/conversations/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const conv = await db.aIConversation.findUnique({ where: { id: req.params.id } });
  if (!conv || conv.user_id !== req.user!.userId) { notFound(res, 'Conversation'); return; }
  ok(res, conv);
});

// ─── CREATE CONVERSATION ──────────────────────────────────────────────────────
// AIAssistant.jsx: agents.createConversation({ agent_name: 'customer_support', metadata: {...} })

router.post('/conversations', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { agent_name = 'assistant', workspace_id, metadata, title } = req.body as {
    agent_name?: string; workspace_id?: string; metadata?: Record<string, unknown>; title?: string;
  };

  const conv = await db.aIConversation.create({
    data: {
      user_id:      req.user!.userId,
      workspace_id: workspace_id ?? null,
      agent_name:   agent_name in AGENT_PROMPTS ? agent_name : 'assistant',
      title:        title ?? metadata?.name as string ?? `${agent_name} Chat`,
      messages:     [],
      metadata:     metadata as any ?? null,
    },
  });

  created(res, conv);
});

// ─── ADD MESSAGE + GET AI RESPONSE ───────────────────────────────────────────
// AIAssistant.jsx: agents.addMessage(conversation, { role: 'user', content: userMessage })
// This is the core: saves user message, calls OpenAI, saves response, pushes to SSE

router.post('/conversations/:id/messages', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { role = 'user', content } = req.body as { role?: string; content?: string };
  if (!content?.trim()) { fail(res, 'content required'); return; }

  const conv = await db.aIConversation.findUnique({ where: { id: req.params.id } });
  if (!conv || conv.user_id !== req.user!.userId) { notFound(res, 'Conversation'); return; }

  const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
  const updatedMessages = [...(conv.messages as any[]), userMsg];

  // Save user message immediately
  await db.aIConversation.update({
    where: { id: conv.id },
    data: { messages: updatedMessages, updated_at: new Date() },
  });

  // Push user message to SSE subscribers
  pushToConversation(conv.id, { type: 'user_message', message: userMsg });

  // Get AI response
  let assistantContent = '';
  let tokensUsed = 0;

  if (env.OPENAI_API_KEY) {
    try {
      const systemPrompt = AGENT_PROMPTS[conv.agent_name] ?? AGENT_PROMPTS.assistant;

      // Build chat history (last 20 messages for context window efficiency)
      const history = (updatedMessages.slice(-20) as any[]).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // Add workspace context if available
      let contextNote = '';
      if (conv.workspace_id) {
        const [posts, analytics] = await Promise.all([
          db.post.count({ where: { workspace_id: conv.workspace_id } }),
          db.analytics.count({ where: { workspace_id: conv.workspace_id } }),
        ]);
        contextNote = `\n\n[Workspace context: ${posts} posts, ${analytics} analytics records]`;
      }

      const completion = await ai().chat.completions.create({
        model:       'gpt-4o',
        messages:    [{ role: 'system', content: systemPrompt + contextNote }, ...history],
        max_tokens:  1500,
        temperature: 0.7,
      });

      assistantContent = completion.choices[0]?.message?.content ?? 'I apologize, I could not generate a response. Please try again.';
      tokensUsed = completion.usage?.total_tokens ?? 0;
    } catch (e) {
      logger.error('OpenAI error in agents', { error: e });
      assistantContent = 'I apologize, but I encountered an error. Please try again.';
    }
  } else {
    assistantContent = 'AI is not configured. Please set OPENAI_API_KEY in your environment.';
  }

  const assistantMsg = { role: 'assistant', content: assistantContent, timestamp: new Date().toISOString() };
  const finalMessages = [...updatedMessages, assistantMsg];

  // Save assistant message
  const finalConv = await db.aIConversation.update({
    where: { id: conv.id },
    data: {
      messages:    finalMessages,
      token_count: { increment: tokensUsed },
      updated_at:  new Date(),
    },
  });

  // Push assistant response to SSE subscribers
  pushToConversation(conv.id, { type: 'assistant_message', message: assistantMsg, messages: finalMessages });

  ok(res, finalConv);
});

// ─── SSE STREAM ───────────────────────────────────────────────────────────────
// AIAssistant.jsx: agents.subscribeToConversation(id, callback)

router.get('/conversations/:id/stream', authenticate, (req: AuthRequest, res: Response): void => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial connection event
  res.write(`data: ${JSON.stringify({ type: 'connected', conversation_id: id })}\n\n`);

  const ping = setInterval(() => { try { res.write(': ping\n\n'); } catch { clearInterval(ping); } }, 20_000);

  if (!convSSEClients.has(id)) convSSEClients.set(id, new Set());
  convSSEClients.get(id)!.add(res);

  req.on('close', () => {
    clearInterval(ping);
    convSSEClients.get(id)?.delete(res);
  });
});

// ─── DELETE CONVERSATION ──────────────────────────────────────────────────────

router.delete('/conversations/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const conv = await db.aIConversation.findUnique({ where: { id: req.params.id }, select: { user_id: true } });
  if (!conv || conv.user_id !== req.user!.userId) { notFound(res, 'Conversation'); return; }
  await db.aIConversation.update({ where: { id: req.params.id }, data: { is_active: false } });
  ok(res, { deleted: true });
});

// ─── WHATSAPP CONNECT URL ─────────────────────────────────────────────────────
// CustomerSupport.jsx: base44.agents.getWhatsAppConnectURL('customer_support')

router.get('/whatsapp-url/:agentName', authenticate, (req: AuthRequest, res: Response): void => {
  const { agentName } = req.params;
  const phone = process.env.WHATSAPP_SUPPORT_NUMBER ?? '+1234567890';
  const message = encodeURIComponent(
    agentName === 'customer_support'
      ? 'Hi! I need help with Nexus Social.'
      : `Hi! I have a question about ${agentName}.`
  );
  ok(res, { url: `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}` });
});

// ─── AI EXTRACT DATA FROM FILE ────────────────────────────────────────────────
// AIAssistant.jsx: integrations.Core.ExtractDataFromUploadedFile({ file_url, extraction_prompt })

router.post('/extract', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { file_url, extraction_prompt, file_type } = req.body as {
    file_url?: string; extraction_prompt?: string; file_type?: string;
  };

  if (!file_url) { fail(res, 'file_url required'); return; }
  if (!env.OPENAI_API_KEY) { fail(res, 'OPENAI_API_KEY not configured', 503); return; }

  try {
    const prompt = extraction_prompt ?? 'Extract and summarize all relevant data from this file as structured JSON.';

    // For images, use vision; for text/docs, fetch and summarize
    let messages: any[];

    if (file_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file_url)) {
      messages = [{
        role: 'user',
        content: [
          { type: 'text',      text: prompt },
          { type: 'image_url', image_url: { url: file_url } },
        ],
      }];
    } else {
      messages = [{
        role: 'user',
        content: `${prompt}\n\nFile URL: ${file_url}\n\nPlease analyze the file at this URL and extract relevant structured data as JSON.`,
      }];
    }

    const completion = await ai().chat.completions.create({
      model:           'gpt-4o',
      messages:        [{ role: 'system', content: 'You are a data extraction specialist. Always respond with valid JSON only. No markdown, no explanation.' }, ...messages],
      response_format: { type: 'json_object' },
      max_tokens:      2000,
    });

    const extracted = JSON.parse(completion.choices[0]?.message?.content ?? '{}');
    ok(res, { extracted_data: extracted, file_url, tokens_used: completion.usage?.total_tokens ?? 0 });
  } catch (e) {
    logger.error('Extract data error', { error: e });
    fail(res, (e as Error).message, 500);
  }
});

// ─── CONVERSATION STATS ───────────────────────────────────────────────────────

router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id } = req.query as { workspace_id?: string };

  const where: any = {
    user_id:   req.user!.userId,
    is_active: true,
    ...(workspace_id && { workspace_id }),
  };

  const [total, byAgent, tokensAgg] = await Promise.all([
    db.aIConversation.count({ where }),
    db.aIConversation.groupBy({ by: ['agent_name'], where, _count: { id: true } }),
    db.aIConversation.aggregate({ where, _sum: { token_count: true } }),
  ]);

  ok(res, {
    total_conversations: total,
    by_agent:    byAgent.reduce((a, g) => ({ ...a, [g.agent_name]: g._count.id }), {}),
    total_tokens: tokensAgg._sum.token_count ?? 0,
  });
});

export default router;
