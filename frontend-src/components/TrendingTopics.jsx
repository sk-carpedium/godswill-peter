import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap, AlertCircle, CheckCircle, Hash, Eye, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const trends = [
{ id: '1', title: '#SocialMediaMarketing2026', type: 'hashtag', momentum: 'rising', velocity: 450, total_mentions: 12500, total_reach: 4500000, relevance_score: 92, opportunity_score: 88, platforms: ['twitter', 'instagram', 'linkedin'], sentiment: { positive: 65, neutral: 28, negative: 7 }, ai_insights: 'High engagement potential. Strong alignment with your brand values. Consider joining the conversation with thought leadership content.' },
{ id: '2', title: 'AI-Powered Social Tools', type: 'topic', momentum: 'peaked', velocity: 380, total_mentions: 28900, total_reach: 8200000, relevance_score: 95, opportunity_score: 82, platforms: ['twitter', 'linkedin'], sentiment: { positive: 72, neutral: 22, negative: 6 }, ai_insights: 'This trend perfectly aligns with your product offering. Create case studies and demos to capitalize on the interest.' },
{ id: '3', title: 'Customer Service Crisis at CompetitorX', type: 'event', momentum: 'rising', velocity: 620, total_mentions: 8200, total_reach: 2100000, relevance_score: 78, opportunity_score: 91, platforms: ['twitter', 'facebook'], sentiment: { positive: 12, neutral: 25, negative: 63 }, ai_insights: 'Competitor weakness detected. Opportunity to highlight your superior customer service. Approach with empathy, not criticism.' }];


const momentumColors = {
  rising: 'text-green-600 bg-green-50',
  peaked: 'text-amber-600 bg-amber-50',
  declining: 'text-slate-600 bg-slate-50'
};

export default function TrendingTopics() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trending Topics</h3>
        <Badge variant="secondary" className="gap-1">
          <Zap className="w-3 h-3" />Live Updates
        </Badge>
      </div>

      <div className="space-y-4">
        {trends.map((trend) =>
        <Card key={trend.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-5 h-5 text-violet-600" />
                    <h4 className="font-semibold text-lg text-slate-900">{trend.title}</h4>
                    <Badge className={momentumColors[trend.momentum]}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {trend.momentum}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{trend.velocity} mentions/hr</span>
                    <span>•</span>
                    <span>{trend.total_mentions.toLocaleString()} total mentions</span>
                    <span>•</span>
                    <span>{(trend.total_reach / 1000000).toFixed(1)}M reach</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-violet-50 border border-violet-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-4 h-4 text-violet-600" />
                    <p className="text-xs font-medium text-violet-600">Relevance</p>
                  </div>
                  <p className="text-2xl font-bold text-violet-700">{trend.relevance_score}</p>
                </div>

                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-1 mb-1">
                    <Zap className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-medium text-green-600">Opportunity</p>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{trend.opportunity_score}</p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Sentiment</p>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="flex h-full">
                        <div className="bg-green-500" style={{ width: `${trend.sentiment.positive}%` }} />
                        <div className="bg-slate-400" style={{ width: `${trend.sentiment.neutral}%` }} />
                        <div className="bg-red-500" style={{ width: `${trend.sentiment.negative}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="text-green-600">{trend.sentiment.positive}%</span>
                    <span className="text-slate-500">{trend.sentiment.neutral}%</span>
                    <span className="text-red-600">{trend.sentiment.negative}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">Platforms</p>
                  <div className="flex flex-wrap gap-1">
                    {trend.platforms.map((p) =>
                  <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">AI Recommendation</p>
                    <p className="text-sm text-blue-800">{trend.ai_insights}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
                  <Eye className="w-4 h-4 mr-2" />Monitor This Trend
                </Button>
                <Button size="sm" variant="outline" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">Create Content</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>);

}