import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  DollarSign,
  Users,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const insights = [
  {
    type: 'opportunity',
    title: 'High-Value Audience Segment',
    description: 'Your followers aged 25-34 have 3.2x higher conversion rates. Focus sponsored content on this demographic.',
    impact: '+$1,240 potential monthly revenue',
    icon: Users,
    color: 'from-violet-500 to-purple-600',
    actionable: true
  },
  {
    type: 'trend',
    title: 'Video Content Outperforms',
    description: 'Reels and video posts generate 2.8x more revenue per view compared to static images.',
    impact: 'Current avg: $245/post → Potential: $686/post',
    icon: TrendingUp,
    color: 'from-emerald-500 to-teal-600',
    actionable: true
  },
  {
    type: 'timing',
    title: 'Optimal Posting Windows',
    description: 'Posts published Tuesday-Thursday 9-11 AM have 45% higher conversion rates.',
    impact: '+$890 weekly with better scheduling',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-600',
    actionable: true
  },
  {
    type: 'warning',
    title: 'Affiliate Link Performance',
    description: 'Your click-to-conversion rate for affiliate links dropped 12% this week. Consider A/B testing CTAs.',
    impact: '-$180 this week vs average',
    icon: TrendingDown,
    color: 'from-amber-500 to-orange-600',
    actionable: true
  }
];

export default function RevenueInsights() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <CardTitle className="text-lg">AI Revenue Insights</CardTitle>
        </div>
        <Badge variant="secondary" className="bg-violet-100 text-violet-700">
          4 insights
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="group p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg bg-gradient-to-br shrink-0",
                insight.color
              )}>
                <insight.icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-slate-600 mb-2">{insight.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "text-xs",
                      insight.type === 'opportunity' && "bg-emerald-50 text-emerald-700",
                      insight.type === 'trend' && "bg-blue-50 text-blue-700",
                      insight.type === 'timing' && "bg-violet-50 text-violet-700",
                      insight.type === 'warning' && "bg-amber-50 text-amber-700"
                    )}
                  >
                    <DollarSign className="w-3 h-3 mr-1" />
                    {insight.impact}
                  </Badge>
                  
                  {insight.actionable && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Take Action
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}