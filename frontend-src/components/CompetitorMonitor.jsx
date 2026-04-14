import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Users, BarChart3, Target, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const competitors = [
  { id: '1', name: 'Competitor A', total_followers: 125000, follower_growth: 12.5, avg_engagement_rate: 4.8, posts_per_week: 14, sentiment_score: 0.6, strengths: ['Strong visual content', 'High engagement'], weaknesses: ['Slow response time'] },
  { id: '2', name: 'Competitor B', total_followers: 89000, follower_growth: -2.3, avg_engagement_rate: 3.2, posts_per_week: 7, sentiment_score: 0.4, strengths: ['Consistent posting'], weaknesses: ['Low engagement', 'Limited platforms'] },
  { id: '3', name: 'Competitor C', total_followers: 156000, follower_growth: 18.7, avg_engagement_rate: 5.9, posts_per_week: 21, sentiment_score: 0.7, strengths: ['Excellent customer service', 'Video content'], weaknesses: ['Expensive products'] },
];

export default function CompetitorMonitor() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Competitor Activity</h3>
        <Button><Plus className="w-4 h-4 mr-2" />Add Competitor</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {competitors.map((comp) => (
          <Card key={comp.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-slate-200 text-slate-700">{comp.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{comp.name}</CardTitle>
                    <p className="text-xs text-slate-500">Last updated 2h ago</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                    <Users className="w-3 h-3" />Followers
                  </div>
                  <p className="text-lg font-bold">{(comp.total_followers / 1000).toFixed(1)}K</p>
                  <div className={cn("flex items-center gap-1 text-xs mt-1", comp.follower_growth > 0 ? "text-green-600" : "text-red-600")}>
                    {comp.follower_growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{Math.abs(comp.follower_growth)}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                    <BarChart3 className="w-3 h-3" />Engagement
                  </div>
                  <p className="text-lg font-bold">{comp.avg_engagement_rate}%</p>
                  <p className="text-xs text-slate-500 mt-1">{comp.posts_per_week} posts/week</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Sentiment</span>
                  <Badge className={cn(comp.sentiment_score > 0.5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                    {(comp.sentiment_score * 100).toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {comp.strengths.map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-green-50 text-green-700">{s}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-1">Weaknesses</p>
                  <div className="flex flex-wrap gap-1">
                    {comp.weaknesses.map((w, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-orange-50 text-orange-700">{w}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" size="sm">
                <Target className="w-3 h-3 mr-2" />View Full Analysis
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}