import React, { useState } from 'react';
import { api } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Loader2,
  Sparkles,
  BarChart3,
  Eye,
  Heart,
  MessageCircle
} from 'lucide-react';

export default function StrategicInsights({ workspaceId, brandId }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runStrategicAnalysis = async () => {
    setIsLoading(true);
    try {
      const [posts, campaigns, analytics, socialAccounts] = await Promise.all([
        api.entities.Post.filter({ workspace_id: workspaceId }),
        api.entities.Campaign.filter({ workspace_id: workspaceId }),
        api.entities.Analytics.filter({ workspace_id: workspaceId }),
        api.entities.SocialAccount.filter({ workspace_id: workspaceId })
      ]);

      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Analyze the following social media data and provide comprehensive strategic insights:

Posts: ${JSON.stringify(posts.slice(-50))}
Campaigns: ${JSON.stringify(campaigns)}
Analytics: ${JSON.stringify(analytics.slice(-100))}
Social Accounts: ${JSON.stringify(socialAccounts)}

Provide a strategic analysis including:

1. MARKET TRENDS ANALYSIS:
   - Current industry trends relevant to this brand
   - Emerging content formats and platforms
   - Seasonal opportunities in the next 3 months
   - Viral content patterns in the industry

2. COMPETITOR INTELLIGENCE:
   - Content strategies working for competitors
   - Gaps in competitor coverage (opportunities)
   - Emerging competitors to watch
   - Benchmark performance comparisons

3. BRAND PERFORMANCE ANALYSIS:
   - Top-performing content themes and formats
   - Underperforming areas needing improvement
   - Audience engagement patterns
   - Platform-specific performance insights
   - ROI analysis by content type

4. CONTENT PERFORMANCE PREDICTIONS:
   - Which content types will likely perform best
   - Optimal posting times by platform
   - Hashtag and keyword opportunities
   - Predicted engagement rates

5. STRATEGIC RECOMMENDATIONS:
   - Immediate action items (next 7 days)
   - Medium-term strategy (next 30 days)
   - Long-term opportunities (next 90 days)
   - Resource allocation suggestions
   - Budget optimization recommendations`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            market_trends: {
              type: "object",
              properties: {
                current_trends: { type: "array", items: { type: "string" } },
                emerging_formats: { type: "array", items: { type: "string" } },
                seasonal_opportunities: { type: "array", items: { 
                  type: "object",
                  properties: {
                    opportunity: { type: "string" },
                    timeframe: { type: "string" },
                    potential_impact: { type: "string" }
                  }
                }},
                viral_patterns: { type: "string" }
              }
            },
            competitor_intelligence: {
              type: "object",
              properties: {
                working_strategies: { type: "array", items: { type: "string" } },
                opportunity_gaps: { type: "array", items: { type: "string" } },
                emerging_competitors: { type: "array", items: { type: "string" } },
                performance_benchmark: {
                  type: "object",
                  properties: {
                    industry_avg_engagement: { type: "number" },
                    your_engagement: { type: "number" },
                    gap_analysis: { type: "string" }
                  }
                }
              }
            },
            brand_performance: {
              type: "object",
              properties: {
                top_performing: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      content_type: { type: "string" },
                      avg_engagement: { type: "number" },
                      roi: { type: "number" }
                    }
                  }
                },
                underperforming: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      area: { type: "string" },
                      issue: { type: "string" },
                      fix: { type: "string" }
                    }
                  }
                },
                audience_insights: {
                  type: "object",
                  properties: {
                    peak_engagement_times: { type: "array", items: { type: "string" } },
                    preferred_content: { type: "array", items: { type: "string" } },
                    demographic_shift: { type: "string" }
                  }
                }
              }
            },
            predictions: {
              type: "object",
              properties: {
                high_potential_content: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      format: { type: "string" },
                      predicted_engagement: { type: "number" },
                      confidence: { type: "string" }
                    }
                  }
                },
                optimal_times: { type: "array", items: { type: "string" } },
                trending_keywords: { type: "array", items: { type: "string" } }
              }
            },
            strategic_recommendations: {
              type: "object",
              properties: {
                immediate: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      priority: { type: "string" },
                      expected_impact: { type: "string" }
                    }
                  }
                },
                medium_term: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      strategy: { type: "string" },
                      timeline: { type: "string" },
                      resources_needed: { type: "string" }
                    }
                  }
                },
                long_term: { type: "array", items: { type: "string" } },
                budget_allocation: {
                  type: "object",
                  properties: {
                    content_creation: { type: "number" },
                    paid_promotion: { type: "number" },
                    tools_software: { type: "number" },
                    influencer_partnerships: { type: "number" }
                  }
                }
              }
            },
            executive_summary: { type: "string" }
          }
        }
      });

      setAnalysis(response);
    } catch (error) {
      console.error('Failed to run strategic analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#d4af37]/20 bg-gradient-to-br from-[#d4af37]/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-6 h-6 text-[#d4af37]" />
                AI Strategic Intelligence
              </CardTitle>
              <CardDescription className="mt-1">
                Comprehensive market analysis, competitor insights, and data-driven recommendations
              </CardDescription>
            </div>
            <Button 
              onClick={runStrategicAnalysis}
              disabled={isLoading}
              className="bg-[#d4af37] hover:bg-[#c9a961] text-slate-950"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {analysis && (
          <CardContent className="space-y-6">
            {/* Executive Summary */}
            {analysis.executive_summary && (
              <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-[#d4af37] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
                    <p className="text-slate-700 leading-relaxed">{analysis.executive_summary}</p>
                  </div>
                </div>
              </div>
            )}

            <Tabs defaultValue="trends" className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="trends">Market Trends</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
                <TabsTrigger value="recommendations">Strategy</TabsTrigger>
              </TabsList>

              {/* Market Trends */}
              <TabsContent value="trends" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      Current Industry Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.market_trends?.current_trends?.map((trend, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <ArrowUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-700">{trend}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Emerging Content Formats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.market_trends?.emerging_formats?.map((format, i) => (
                        <Badge key={i} className="bg-purple-100 text-purple-700">{format}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Seasonal Opportunities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.market_trends?.seasonal_opportunities?.map((opp, i) => (
                      <div key={i} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-orange-900">{opp.opportunity}</h4>
                          <Badge variant="outline" className="border-orange-300 text-orange-700">
                            {opp.timeframe}
                          </Badge>
                        </div>
                        <p className="text-sm text-orange-800">{opp.potential_impact}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Competitor Intelligence */}
              <TabsContent value="competitors" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Performance Benchmark</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Industry Average</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {analysis.competitor_intelligence?.performance_benchmark?.industry_avg_engagement?.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-4 bg-[#d4af37]/10 rounded-lg">
                        <p className="text-sm text-slate-500 mb-1">Your Performance</p>
                        <p className="text-2xl font-bold text-[#d4af37]">
                          {analysis.competitor_intelligence?.performance_benchmark?.your_engagement?.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 p-3 bg-blue-50 rounded-lg">
                      {analysis.competitor_intelligence?.performance_benchmark?.gap_analysis}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-green-700">Opportunity Gaps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.competitor_intelligence?.opportunity_gaps?.map((gap, i) => (
                        <li key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                          <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-green-800">{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Working Competitor Strategies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.competitor_intelligence?.working_strategies?.map((strategy, i) => (
                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                          <Eye className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Brand Performance */}
              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-green-700">Top Performing Content</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.brand_performance?.top_performing?.map((content, i) => (
                      <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-900">{content.content_type}</h4>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Heart className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-700">
                                {content.avg_engagement?.toFixed(1)}%
                              </span>
                            </div>
                            <Badge className="bg-green-600 text-white">
                              ROI: {content.roi?.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-red-700">Underperforming Areas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.brand_performance?.underperforming?.map((item, i) => (
                      <div key={i} className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-red-900 mb-1">{item.area}</h4>
                            <p className="text-sm text-red-700 mb-2">{item.issue}</p>
                            <div className="p-2 bg-white rounded border border-red-200">
                              <p className="text-xs text-red-800">
                                <strong>Fix:</strong> {item.fix}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Audience Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Peak Engagement Times</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.brand_performance?.audience_insights?.peak_engagement_times?.map((time, i) => (
                          <Badge key={i} className="bg-blue-100 text-blue-700">{time}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Preferred Content Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.brand_performance?.audience_insights?.preferred_content?.map((type, i) => (
                          <Badge key={i} variant="secondary">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Predictions */}
              <TabsContent value="predictions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">High-Potential Content Formats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.predictions?.high_potential_content?.map((content, i) => (
                      <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-purple-900">{content.format}</h4>
                          <div className="flex items-center gap-2">
                            <Progress value={content.predicted_engagement} className="w-24 h-2" />
                            <span className="text-sm font-medium text-purple-700">
                              {content.predicted_engagement}%
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          Confidence: {content.confidence}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Trending Keywords & Hashtags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysis.predictions?.trending_keywords?.map((keyword, i) => (
                        <Badge key={i} className="bg-[#d4af37]/20 text-[#d4af37]">
                          #{keyword}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Strategic Recommendations */}
              <TabsContent value="recommendations" className="space-y-4">
                <Card className="border-2 border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-base text-red-900 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Immediate Actions (Next 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.strategic_recommendations?.immediate?.map((action, i) => (
                      <div key={i} className="p-4 bg-white rounded-lg border border-red-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{action.action}</h4>
                          <Badge className={
                            action.priority === 'High' ? 'bg-red-600 text-white' :
                            action.priority === 'Medium' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }>
                            {action.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{action.expected_impact}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">30-Day Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.strategic_recommendations?.medium_term?.map((strategy, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-2">{strategy.strategy}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Timeline:</span>
                            <span className="ml-2 font-medium">{strategy.timeline}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Resources:</span>
                            <span className="ml-2 font-medium">{strategy.resources_needed}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      Recommended Budget Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analysis.strategic_recommendations?.budget_allocation && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-slate-500 mb-1">Content Creation</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {analysis.strategic_recommendations.budget_allocation.content_creation}%
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-slate-500 mb-1">Paid Promotion</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {analysis.strategic_recommendations.budget_allocation.paid_promotion}%
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-slate-500 mb-1">Tools & Software</p>
                          <p className="text-2xl font-bold text-green-700">
                            {analysis.strategic_recommendations.budget_allocation.tools_software}%
                          </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-slate-500 mb-1">Influencer Partnerships</p>
                          <p className="text-2xl font-bold text-orange-700">
                            {analysis.strategic_recommendations.budget_allocation.influencer_partnerships}%
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">90-Day Vision</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.strategic_recommendations?.long_term?.map((vision, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <Lightbulb className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                          {vision}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}