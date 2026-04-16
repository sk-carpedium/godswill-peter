import React, { useState } from 'react';
import { api } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Target,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Zap,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CampaignStrategyBuilder({ workspaceId, brandId }) {
  const navigate = useNavigate();
  const [objective, setObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('30');
  const [industry, setIndustry] = useState('');
  const [strategy, setStrategy] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCampaignStrategy = async () => {
    if (!objective || !targetAudience) return;
    
    setIsGenerating(true);
    try {
      const [posts, analytics, competitors] = await Promise.all([
        api.entities.Post.filter({ workspace_id: workspaceId }),
        api.entities.Analytics.filter({ workspace_id: workspaceId }),
        api.entities.CompetitorTrack.filter({ workspace_id: workspaceId })
      ]);

      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive campaign strategy based on:

Objective: ${objective}
Target Audience: ${targetAudience}
Budget: ${budget || 'Not specified'}
Duration: ${duration} days
Industry: ${industry || 'Not specified'}

Historical Performance Data: ${JSON.stringify(posts.slice(-30))}
Analytics Data: ${JSON.stringify(analytics.slice(-50))}
Competitor Insights: ${JSON.stringify(competitors)}

Generate a complete campaign strategy including:

1. CAMPAIGN OVERVIEW
   - Campaign name and tagline
   - Core messaging themes
   - Success metrics and KPIs

2. PLATFORM STRATEGY
   - Which platforms to prioritize and why
   - Platform-specific content approaches
   - Expected performance by platform

3. CONTENT THEMES & PILLARS
   - 5-7 content themes aligned with objective
   - Content mix recommendations (% educational, entertaining, promotional, etc.)
   - Specific content ideas for each theme

4. POSTING SCHEDULE
   - Optimal posting frequency per platform
   - Best times to post
   - Content distribution timeline

5. BUDGET ALLOCATION
   - Recommended budget split across platforms
   - Paid vs organic strategy
   - Resource allocation (content creation, ads, influencers, tools)

6. CREATIVE GUIDELINES
   - Visual style recommendations
   - Tone of voice
   - Hashtag strategy
   - CTA recommendations

7. CONTENT VARIATIONS
   - Generate 10-15 specific post ideas with full copy
   - Include platform-specific adaptations
   - Hooks, captions, and hashtags for each

8. PERFORMANCE PREDICTIONS
   - Expected reach, engagement, and conversions
   - Timeline for seeing results
   - Success indicators

9. RISK MITIGATION
   - Potential challenges
   - Contingency plans
   - Crisis management considerations`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            campaign_overview: {
              type: "object",
              properties: {
                name: { type: "string" },
                tagline: { type: "string" },
                core_themes: { type: "array", items: { type: "string" } },
                kpis: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      metric: { type: "string" },
                      target: { type: "string" }
                    }
                  }
                }
              }
            },
            platform_strategy: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  priority: { type: "string" },
                  rationale: { type: "string" },
                  approach: { type: "string" },
                  expected_performance: { type: "string" }
                }
              }
            },
            content_themes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  description: { type: "string" },
                  content_ideas: { type: "array", items: { type: "string" } }
                }
              }
            },
            content_mix: {
              type: "object",
              properties: {
                educational: { type: "number" },
                entertaining: { type: "number" },
                promotional: { type: "number" },
                ugc: { type: "number" }
              }
            },
            posting_schedule: {
              type: "object",
              properties: {
                frequency_by_platform: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      posts_per_week: { type: "number" },
                      best_times: { type: "array", items: { type: "string" } }
                    }
                  }
                },
                timeline: { type: "string" }
              }
            },
            budget_allocation: {
              type: "object",
              properties: {
                platform_split: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      percentage: { type: "number" },
                      amount: { type: "string" }
                    }
                  }
                },
                category_split: {
                  type: "object",
                  properties: {
                    content_creation: { type: "number" },
                    paid_ads: { type: "number" },
                    influencers: { type: "number" },
                    tools: { type: "number" }
                  }
                }
              }
            },
            creative_guidelines: {
              type: "object",
              properties: {
                visual_style: { type: "string" },
                tone_of_voice: { type: "string" },
                hashtag_strategy: { type: "string" },
                primary_hashtags: { type: "array", items: { type: "string" } },
                cta_recommendations: { type: "array", items: { type: "string" } }
              }
            },
            content_variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string" },
                  format: { type: "string" },
                  hook: { type: "string" },
                  caption: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  cta: { type: "string" },
                  visual_concept: { type: "string" }
                }
              }
            },
            performance_predictions: {
              type: "object",
              properties: {
                expected_reach: { type: "string" },
                expected_engagement: { type: "string" },
                expected_conversions: { type: "string" },
                timeline_to_results: { type: "string" },
                success_indicators: { type: "array", items: { type: "string" } }
              }
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  risk: { type: "string" },
                  mitigation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setStrategy(response);
    } catch (error) {
      console.error('Failed to generate strategy:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const createCampaignFromStrategy = async () => {
    if (!strategy) return;

    try {
      const campaign = await api.entities.Campaign.create({
        workspace_id: workspaceId,
        brand_id: brandId,
        name: strategy.campaign_overview.name,
        description: strategy.campaign_overview.tagline,
        objective: objective,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        budget: {
          total: parseFloat(budget) || 0,
          spent: 0,
          currency: 'USD'
        },
        kpis: strategy.campaign_overview.kpis.reduce((acc, kpi) => {
          acc[`target_${kpi.metric.toLowerCase()}`] = parseFloat(kpi.target) || 0;
          return acc;
        }, {}),
        status: 'draft'
      });

      navigate(createPageUrl('CampaignDetails') + '?id=' + campaign.id);
    } catch (error) {
      console.error('Failed to create campaign:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#d4af37]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#d4af37]" />
            AI Campaign Strategy Builder
          </CardTitle>
          <CardDescription>
            Generate a comprehensive campaign strategy based on your goals, historical data, and market trends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="objective">Campaign Objective *</Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="engagement">Engagement & Community</SelectItem>
                  <SelectItem value="traffic">Website Traffic</SelectItem>
                  <SelectItem value="leads">Lead Generation</SelectItem>
                  <SelectItem value="sales">Sales & Conversions</SelectItem>
                  <SelectItem value="app_installs">App Installs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="duration">Campaign Duration (Days)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 Week</SelectItem>
                  <SelectItem value="14">2 Weeks</SelectItem>
                  <SelectItem value="30">1 Month</SelectItem>
                  <SelectItem value="60">2 Months</SelectItem>
                  <SelectItem value="90">3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Total Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 5000"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry/Niche</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Fashion, Tech, Food..."
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="audience">Target Audience *</Label>
            <Textarea
              id="audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="Describe your target audience (demographics, interests, behaviors, pain points...)"
              className="min-h-[100px] mt-2"
            />
          </div>

          <Button
            onClick={generateCampaignStrategy}
            disabled={isGenerating || !objective || !targetAudience}
            className="w-full bg-[#d4af37] hover:bg-[#c9a961] text-slate-950"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Strategy...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Generate AI Campaign Strategy
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {strategy && (
        <div className="space-y-6">
          {/* Campaign Overview */}
          <Card className="border-2 border-[#d4af37]/50 bg-gradient-to-br from-[#d4af37]/5 to-transparent">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{strategy.campaign_overview.name}</CardTitle>
                  <p className="text-lg text-slate-600 italic">{strategy.campaign_overview.tagline}</p>
                </div>
                <Button onClick={createCampaignFromStrategy} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Core Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {strategy.campaign_overview.core_themes?.map((theme, i) => (
                    <Badge key={i} className="bg-[#d4af37]/20 text-[#d4af37]">{theme}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Key Performance Indicators</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {strategy.campaign_overview.kpis?.map((kpi, i) => (
                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500">{kpi.metric}</p>
                      <p className="text-lg font-bold text-slate-900">{kpi.target}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Strategy */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Strategy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {strategy.platform_strategy?.map((platform, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{platform.platform}</h4>
                    <Badge className={
                      platform.priority === 'High' ? 'bg-green-600 text-white' :
                      platform.priority === 'Medium' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }>
                      {platform.priority} Priority
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{platform.rationale}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Approach</p>
                      <p className="text-sm">{platform.approach}</p>
                    </div>
                    <div className="p-2 bg-white rounded border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Expected Performance</p>
                      <p className="text-sm">{platform.expected_performance}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Content Themes */}
          <Card>
            <CardHeader>
              <CardTitle>Content Themes & Pillars</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {strategy.content_themes?.map((theme, i) => (
                <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">{theme.theme}</h4>
                  <p className="text-sm text-blue-800 mb-3">{theme.description}</p>
                  <div className="space-y-1">
                    {theme.content_ideas?.map((idea, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-blue-900">{idea}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {strategy.content_mix && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                    <p className="text-xs text-purple-600 mb-1">Educational</p>
                    <p className="text-2xl font-bold text-purple-900">{strategy.content_mix.educational}%</p>
                  </div>
                  <div className="p-3 bg-pink-50 rounded-lg text-center">
                    <p className="text-xs text-pink-600 mb-1">Entertaining</p>
                    <p className="text-2xl font-bold text-pink-900">{strategy.content_mix.entertaining}%</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg text-center">
                    <p className="text-xs text-orange-600 mb-1">Promotional</p>
                    <p className="text-2xl font-bold text-orange-900">{strategy.content_mix.promotional}%</p>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg text-center">
                    <p className="text-xs text-teal-600 mb-1">UGC</p>
                    <p className="text-2xl font-bold text-teal-900">{strategy.content_mix.ugc}%</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ready-to-Use Content */}
          <Card>
            <CardHeader>
              <CardTitle>Ready-to-Use Content Ideas</CardTitle>
              <CardDescription>Copy, customize, and post these AI-generated variations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {strategy.content_variations?.map((content, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-[#d4af37] transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{content.platform}</Badge>
                      <Badge className="bg-purple-100 text-purple-700">{content.format}</Badge>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-lg mb-2">{content.hook}</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{content.caption}</p>
                  
                  {content.visual_concept && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200 mb-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Visual Concept:</p>
                      <p className="text-xs text-blue-800">{content.visual_concept}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {content.hashtags?.map((tag, j) => (
                      <Badge key={j} variant="outline" className="text-xs">#{tag}</Badge>
                    ))}
                  </div>
                  
                  {content.cta && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      CTA: {content.cta}
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Budget & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Budget Allocation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {strategy.budget_allocation?.category_split && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Content Creation</p>
                      <p className="text-xl font-bold text-blue-700">
                        {strategy.budget_allocation.category_split.content_creation}%
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Paid Ads</p>
                      <p className="text-xl font-bold text-purple-700">
                        {strategy.budget_allocation.category_split.paid_ads}%
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Influencers</p>
                      <p className="text-xl font-bold text-orange-700">
                        {strategy.budget_allocation.category_split.influencers}%
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Tools</p>
                      <p className="text-xl font-bold text-green-700">
                        {strategy.budget_allocation.category_split.tools}%
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Performance Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Expected Reach</p>
                  <p className="text-lg font-bold">{strategy.performance_predictions?.expected_reach}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Expected Engagement</p>
                  <p className="text-lg font-bold">{strategy.performance_predictions?.expected_engagement}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Expected Conversions</p>
                  <p className="text-lg font-bold">{strategy.performance_predictions?.expected_conversions}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}