import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, TrendingUp, Users, Building2, Zap, Rocket, Crown, Target, Shield, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    icon: Rocket,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    buttonVariant: 'outline',
    features: [
      { category: 'Social Media', items: ['2 social accounts', 'Basic posting'] },
      { category: 'AI Features', items: ['Limited AI chat for general questions', 'AI caption generation', 'AI hashtag & hook suggestions', 'Best-time-to-post (global model)'] },
      { category: 'Analytics', items: ['Basic dashboard'] }
    ]
  },
  {
    name: 'Starter',
    price: '$19.99',
    period: '/month',
    description: 'Essential tools for growing creators',
    icon: Target,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    buttonVariant: 'default',
    popular: false,
    features: [
      { category: 'Everything in Free, plus:', items: [] },
      { category: 'Social Media', items: ['Up to 5 social accounts', 'Unlimited scheduling', 'Basic content calendar'] },
      { category: 'AI Features', items: ['Full AI chat', 'Limited Proactive Insights', 'Basic Trend Responder', 'AI-suggested replies (limited)', 'AI daily summary ("What changed?")'] },
      { category: 'Analytics', items: ['Detailed analytics', 'Basic historical reports'] },
      { category: 'Team', items: ['Up to 3 members'] },
      { category: 'Social Listening', items: ['Limited keyword tracking'] }
    ]
  },
  {
    name: 'Growth',
    price: '$49.99',
    period: '/month',
    description: 'Advanced features for serious brands',
    icon: Star,
    color: 'text-[#d4af37]',
    bgColor: 'bg-[#d4af37]/10',
    buttonVariant: 'default',
    popular: true,
    features: [
      { category: 'Everything in Starter, plus:', items: [] },
      { category: 'Social Media', items: ['Up to 15 social accounts', 'Advanced content calendar', 'Brand management'] },
      { category: 'AI Features', items: ['Revenue Optimizer', 'Full Proactive Insights', 'Full Trend Responder', 'AI Workload Balancer', 'Unlimited AI-suggested replies', 'Brand voice presets', 'Platform-specific best-time-to-post', 'Predictive performance scoring (advanced)', 'AI content variations (A/B ready)'] },
      { category: 'Analytics', items: ['Advanced Analytics', 'Benchmarking', 'Full historical reports'] },
      { category: 'Team', items: ['Up to 10 members', 'Team tasks', 'Team discussions'] },
      { category: 'Social Listening', items: ['Unlimited keyword/competitor tracking', 'Crisis detection'] },
      { category: 'Monetization', items: ['Basic revenue tracking', 'Brand deal management'] },
      { category: 'Media', items: ['Full media library'] }
    ]
  },
  {
    name: 'Professional',
    price: '$99.99',
    period: '/month',
    description: 'For brands that care about ROI, not vanity metrics',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    buttonVariant: 'default',
    features: [
      { category: 'Everything in Growth, plus:', items: [] },
      { category: 'Social Media', items: ['25 social profiles', '10 brands', '20 team members', 'Role-based access control'] },
      { category: 'Automation', items: ['Visual no-code automation builder', 'Auto-moderation', 'Keyword & sentiment triggers', 'Auto-report delivery'] },
      { category: 'AI Systems', items: ['Brand voice training (per brand)', 'AI customer service assistant (FAQs, DMs)', 'AI content profitability score (pre-publish)', 'AI anomaly detection & explanations'] },
      { category: 'Analytics & BI', items: ['Conversion & UTM tracking', 'Campaign ROI attribution', 'Social listening & keyword tracking', 'Competitor benchmarking'] },
      { category: 'Compliance', items: ['Platform policy checks', 'FTC disclosure detection', 'Copyright & trademark alerts'] }
    ]
  },
  {
    name: 'Agency',
    price: '$199.99',
    period: '/month',
    description: 'Agency features competitors hide behind Enterprise',
    icon: Crown,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    buttonVariant: 'default',
    features: [
      { category: 'Everything in Professional, plus:', items: [] },
      { category: 'Agency Mode', items: ['50 social profiles', '20 brands', 'Unlimited client workspaces', 'Client isolation', 'Client approval portals'] },
      { category: 'White-Label Lite', items: ['Custom logo', 'Custom domain (dashboard)', 'Client-facing reports'] },
      { category: 'Advanced Automation', items: ['Cross-client automation rules', 'SLA timers & escalations', 'Bulk actions at scale'] },
      { category: 'CRM & Engagement', items: ['Priority inbox (VIPs)', 'Team assignments', 'Full conversation timelines'] },
      { category: 'Monetization Intelligence', items: ['Multi-client ROI dashboards', 'Sponsorship & brand deal tracking', 'Exportable earnings reports'] }
    ]
  }
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, price }) => {
      const user = await base44.auth.me();
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const periodEnd = new Date();
      if (billingCycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const usageLimits = getUsageLimits(planId);

      return await base44.entities.Subscription.create({
        user_email: user.email,
        workspace_id: workspaces[0]?.id,
        plan_id: planId,
        billing_cycle: billingCycle,
        price: price,
        status: 'trialing',
        trial_ends_at: trialEnd.toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd.toISOString(),
        usage_limits: usageLimits,
        current_usage: {
          social_accounts: 0,
          posts_this_month: 0,
          team_members: 1,
          ai_requests_this_month: 0,
          storage_used_gb: 0
        }
      });
    },
    onSuccess: () => {
      toast.success('Subscription activated! Enjoy your 14-day free trial.');
      navigate(createPageUrl('Dashboard'));
    },
    onError: (error) => {
      toast.error('Failed to activate subscription: ' + error.message);
    }
  });

  const getUsageLimits = (planId) => {
    // Import from centralized config
    const limits = {
      free: { social_accounts: 2, posts_per_month: 10, team_members: 1, ai_requests_per_month: 50, storage_gb: 1, brands: 1, workspaces: 1 },
      starter: { social_accounts: 5, posts_per_month: 100, team_members: 3, ai_requests_per_month: 500, storage_gb: 5, brands: 1, workspaces: 1 },
      growth: { social_accounts: 15, posts_per_month: 500, team_members: 10, ai_requests_per_month: 2000, storage_gb: 20, brands: 3, workspaces: 1 },
      professional: { social_accounts: 25, posts_per_month: 2000, team_members: 20, ai_requests_per_month: 5000, storage_gb: 50, brands: 10, workspaces: 1 },
      agency: { social_accounts: 50, posts_per_month: 10000, team_members: 50, ai_requests_per_month: 20000, storage_gb: 200, brands: 20, workspaces: 999999 }
    };
    return limits[planId] || limits.free;
  };

  const handleSubscribe = async (plan) => {
    if (plan.name === 'Free') {
      // Ensure free tier users get a subscription record
      try {
        const user = await base44.auth.me();
        const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
        
        const existingSubscription = await base44.entities.Subscription.filter({
          user_email: user.email,
          workspace_id: workspaces[0]?.id
        });

        if (existingSubscription.length === 0 && workspaces[0]) {
          await base44.entities.Subscription.create({
            user_email: user.email,
            workspace_id: workspaces[0].id,
            plan_id: 'free',
            billing_cycle: 'monthly',
            price: 0,
            status: 'active',
            current_period_start: new Date().toISOString(),
            usage_limits: getUsageLimits('free'),
            current_usage: {
              social_accounts: 0,
              posts_this_month: 0,
              team_members: 1,
              ai_requests_this_month: 0,
              storage_used_gb: 0
            }
          });
        }
      } catch (error) {
        console.error('Error setting up free plan:', error);
      }
      
      navigate(createPageUrl('Dashboard'));
      return;
    }

    const monthlyPrice = parseFloat(plan.price.slice(1));
    const price = billingCycle === 'yearly' ? monthlyPrice * 12 * 0.8 : monthlyPrice;

    subscribeMutation.mutate({
      planId: plan.name.toLowerCase(),
      price: price
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Choose the perfect plan for your social media needs
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === 'monthly'
                  ? "bg-[#d4af37] text-slate-950"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === 'yearly'
                  ? "bg-[#d4af37] text-slate-950"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Yearly
              <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {pricingPlans.map((plan, index) => (
            <Card
              key={plan.name}
              className={cn(
                "relative flex flex-col",
                plan.popular && "border-[#d4af37] border-2 shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#d4af37] text-slate-950 px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader>
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", plan.bgColor)}>
                  <plan.icon className={cn("w-6 h-6", plan.color)} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
                <div className="mt-4">
                   {(() => {
                     if (plan.name === 'Free') {
                       return (
                         <>
                           <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                           <span className="text-slate-600">{plan.period}</span>
                         </>
                       );
                     }
                     const monthlyPrice = parseFloat(plan.price.slice(1));
                     const yearlyPrice = (monthlyPrice * 12 * 0.8).toFixed(2);
                     const displayPrice = billingCycle === 'yearly' ? `$${yearlyPrice}` : plan.price;
                     const displayPeriod = billingCycle === 'yearly' ? '/year' : plan.period;
                     return (
                       <>
                         <span className="text-4xl font-bold text-slate-900">{displayPrice}</span>
                         <span className="text-slate-600">{displayPeriod}</span>
                       </>
                     );
                   })()}
                 </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-4">
                  {plan.features.map((featureGroup, idx) => (
                    <div key={idx}>
                      {featureGroup.category && (
                        <p className={cn(
                          "font-semibold text-sm mb-2",
                          featureGroup.items.length === 0 ? "text-[#d4af37]" : "text-slate-700"
                        )}>
                          {featureGroup.category}
                        </p>
                      )}
                      <ul className="space-y-2">
                        {featureGroup.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    plan.popular && "bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                  )}
                  variant={plan.buttonVariant}
                  onClick={() => handleSubscribe(plan)}
                  disabled={subscribeMutation.isPending}
                >
                  {plan.name === 'Free' ? 'Get Started' : 'Start Free Trial'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Enterprise CTA */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Need a Custom Enterprise Solution?</h2>
            <p className="text-slate-300 text-lg mb-6 max-w-2xl mx-auto">
              Custom integrations, dedicated support, advanced security, and tailored pricing for large organizations
            </p>
            <Button size="lg" className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
              Contact Sales
            </Button>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">All paid plans come with a 14-day free trial. No credit card required to start.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">We accept all major credit cards, PayPal, and can arrange invoicing for annual plans.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer refunds?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}