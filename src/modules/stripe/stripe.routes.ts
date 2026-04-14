// ─── STRIPE ───────────────────────────────────────────────────────────────────
import { Router as R1, Request, Response } from 'express';
import Stripe from 'stripe';
import db from '../../config/database';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import { AuthRequest } from '../../types';
import { ok, fail } from '../../utils';
import { logger } from '../../config/logger';

export const stripeRouter = R1();

// Real pricing from Pricing.jsx — these are the prices users see
const PLANS = {
  free:         { name:'Free',         price:0,      price_display:'$0',      period:'/month', popular:false, color:'text-slate-600',  features:['2 social accounts','Basic posting','Limited AI chat','Basic dashboard'], limits:{social_accounts:2,posts_per_month:10,team_members:1,ai_requests_per_month:50,storage_gb:1,brands:1,workspaces:1} },
  starter:      { name:'Starter',      price:19.99,  price_display:'$19.99',  period:'/month', popular:false, color:'text-blue-600',   features:['5 social accounts','Unlimited scheduling','Full AI chat','3 team members','Detailed analytics','Limited keyword tracking'], limits:{social_accounts:5,posts_per_month:100,team_members:3,ai_requests_per_month:500,storage_gb:5,brands:1,workspaces:1} },
  growth:       { name:'Growth',       price:49.99,  price_display:'$49.99',  period:'/month', popular:true,  color:'text-[#d4af37]',  features:['15 social accounts','Advanced calendar','Revenue Optimizer','Full Proactive Insights','10 members','Crisis detection','Brand deals','Full media library'], limits:{social_accounts:15,posts_per_month:500,team_members:10,ai_requests_per_month:2000,storage_gb:20,brands:3,workspaces:1} },
  professional: { name:'Professional', price:99.99,  price_display:'$99.99',  period:'/month', popular:false, color:'text-purple-600', features:['25 social profiles','10 brands','20 team members','RBAC','Full predictive analytics','AI Workload Balancer','White-label reports'], limits:{social_accounts:25,posts_per_month:2000,team_members:20,ai_requests_per_month:5000,storage_gb:50,brands:10,workspaces:1} },
  agency:       { name:'Agency',       price:199.99, price_display:'$199.99', period:'/month', popular:false, color:'text-emerald-600',features:['50 social profiles','20 brands','50 team members','Unlimited workspaces','Client portal','Agency dashboard','Priority support'], limits:{social_accounts:50,posts_per_month:10000,team_members:50,ai_requests_per_month:20000,storage_gb:200,brands:20,workspaces:999999} },
};

function stripe() { if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not configured'); return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' }); }

stripeRouter.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) { res.status(400).json({ error: 'Missing signature' }); return; }
  let event: Stripe.Event;
  try { event = stripe().webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET); }
  catch (e) { res.status(400).json({ error: `Webhook error: ${(e as Error).message}` }); return; }
  logger.info(`Stripe: ${event.type}`);
  try {
    switch (event.type) {
      case 'checkout.session.completed': { const s = event.data.object as Stripe.Checkout.Session; const wid = s.metadata?.workspace_id; if (wid) await db.subscription.upsert({ where: { workspace_id: wid }, create: { workspace_id: wid, plan: (s.metadata?.plan as any) ?? 'starter', status: 'active', stripe_customer_id: s.customer as string, stripe_subscription_id: s.subscription as string }, update: { plan: (s.metadata?.plan as any) ?? 'starter', status: 'active', stripe_customer_id: s.customer as string, stripe_subscription_id: s.subscription as string } }); break; }
      case 'customer.subscription.updated': case 'customer.subscription.created': { const sub = event.data.object as Stripe.Subscription; const wid = sub.metadata?.workspace_id; if (wid) { const plan = Object.entries({ starter: env.STRIPE_PRICE_STARTER, professional: env.STRIPE_PRICE_PROFESSIONAL, enterprise: env.STRIPE_PRICE_ENTERPRISE, agency: env.STRIPE_PRICE_AGENCY }).find(([,pid]) => pid === sub.items.data[0]?.price.id)?.[0] ?? 'starter'; const status = ({active:'active',trialing:'trialing',past_due:'past_due',unpaid:'past_due'} as any)[sub.status] ?? 'cancelled'; await db.subscription.updateMany({ where: { workspace_id: wid }, data: { status, plan: plan as any, current_period_start: new Date(sub.current_period_start*1000), current_period_end: new Date(sub.current_period_end*1000) } }); } break; }
      case 'customer.subscription.deleted': { const sub = event.data.object as Stripe.Subscription; if (sub.metadata?.workspace_id) await db.subscription.updateMany({ where: { workspace_id: sub.metadata.workspace_id }, data: { status: 'cancelled' } }); break; }
    }
  } catch (e) { logger.error('Webhook handler error', { error: e }); }
  res.json({ received: true });
});

stripeRouter.use(authenticate);

stripeRouter.get('/plans', (_req: Request, res: Response): void => { ok(res, Object.entries(PLANS).map(([id, p]) => ({ id, ...p, currency: 'USD', interval: 'month', popular: id === 'professional', stripe_price_id: (env as any)[`STRIPE_PRICE_${id.toUpperCase()}`] }))); });

stripeRouter.get('/subscription/:workspaceId', async (req: AuthRequest, res: Response): Promise<void> => {
  const sub = await db.subscription.findUnique({ where: { workspace_id: req.params.workspaceId } });
  ok(res, sub ?? { workspace_id: req.params.workspaceId, plan: 'free', status: 'active' });
});

stripeRouter.post('/checkout', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, plan, success_url, cancel_url, seats } = req.body;
  if (!workspace_id || !plan || !success_url || !cancel_url) { fail(res, 'workspace_id, plan, success_url, cancel_url required'); return; }
  const priceKey = `STRIPE_PRICE_${plan.toUpperCase()}`;
  const priceId = (env as any)[priceKey];
  if (!priceId) { fail(res, `No Stripe price for plan: ${plan}`); return; }
  try {
    const sub = await db.subscription.findUnique({ where: { workspace_id } });
    let customerId = sub?.stripe_customer_id ?? null;
    if (!customerId) { const ws = await db.workspace.findUnique({ where: { id: workspace_id } }); const c = await stripe().customers.create({ description: ws?.name ?? workspace_id, metadata: { workspace_id, user_id: req.user!.userId } }); customerId = c.id; }
    const session = await stripe().checkout.sessions.create({ mode: 'subscription', customer: customerId, line_items: [{ price: priceId, quantity: seats ?? 1 }], success_url, cancel_url, subscription_data: { metadata: { workspace_id }, trial_period_days: 14 }, metadata: { workspace_id, plan }, allow_promotion_codes: true });
    ok(res, { url: session.url, session_id: session.id });
  } catch (e) { fail(res, (e as Error).message, 500); }
});

stripeRouter.post('/portal', async (req: AuthRequest, res: Response): Promise<void> => {
  const { workspace_id, return_url } = req.body;
  if (!workspace_id || !return_url) { fail(res, 'workspace_id and return_url required'); return; }
  const sub = await db.subscription.findUnique({ where: { workspace_id } });
  if (!sub?.stripe_customer_id) { fail(res, 'No Stripe customer found', 404); return; }
  try { const session = await stripe().billingPortal.sessions.create({ customer: sub.stripe_customer_id, return_url }); ok(res, { url: session.url }); }
  catch (e) { fail(res, (e as Error).message, 500); }
});
