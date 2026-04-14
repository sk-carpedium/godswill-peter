import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Eye, Heart, Users, MessageSquare, DollarSign, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function DailySummary({ showFullVersion = false }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const summary = {
    date: moment().format('MMMM D, YYYY'),
    headline: "Strong engagement day with significant reach growth",
    keyChanges: [
      { metric: 'Followers', value: '+247', change: 12.5, icon: Users, positive: true },
      { metric: 'Engagement', value: '+18.3%', change: 18.3, icon: Heart, positive: true },
      { metric: 'Reach', value: '+32K', change: 25.1, icon: Eye, positive: true },
      { metric: 'Comments', value: '-8', change: -5.2, icon: MessageSquare, positive: false }
    ],
    highlights: [
      { title: 'Top Post', description: 'Summer Collection Reel reached 45K views (+230% avg)', type: 'success' },
      { title: 'Best Platform', description: 'Instagram Stories had 3.2x higher engagement', type: 'info' },
      { title: 'Trending Content', description: 'Video content outperformed images by 65%', type: 'insight' }
    ],
    actions: [
      { title: 'Create More Reels', priority: 'high', reason: 'Video engagement is trending up' },
      { title: 'Post at 7-9 PM', priority: 'medium', reason: 'Peak audience activity detected' }
    ],
    revenue: showFullVersion ? { today: 284, change: 22.5 } : null
  };

  return (
    <Card className="border-2 border-[#d4af37]/20 bg-gradient-to-br from-[#d4af37]/5 to-white">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              <CardTitle className="text-lg">Daily AI Summary</CardTitle>
              <Badge variant="secondary" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Updated 5 min ago
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{summary.date}</p>
          </div>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Details' : 'Expand'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Headline */}
        <div className="p-3 bg-[#d4af37]/10 rounded-lg">
          <p className="text-sm font-medium text-slate-900">{summary.headline}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {summary.keyChanges.map((change, index) => (
            <div key={index} className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-1">
                <change.icon className="w-4 h-4 text-slate-400" />
                <p className="text-xs text-slate-500">{change.metric}</p>
              </div>
              <p className="text-lg font-bold text-slate-900">{change.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {change.positive ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  change.positive ? "text-green-600" : "text-red-600"
                )}>
                  {change.positive ? '+' : ''}{change.change}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {isExpanded && (
          <>
            {/* Highlights */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">Today's Highlights</h4>
              {summary.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-1.5",
                    highlight.type === 'success' ? "bg-green-500" :
                    highlight.type === 'info' ? "bg-blue-500" :
                    "bg-[#d4af37]"
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{highlight.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommended Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900">AI Recommendations</h4>
              {summary.actions.map((action, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Badge variant={action.priority === 'high' ? 'default' : 'secondary'} className="mt-0.5">
                    {action.priority}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{action.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{action.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue (if available) */}
            {summary.revenue && (
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <div>
                      <p className="text-xs text-emerald-700 font-medium">Revenue Today</p>
                      <p className="text-2xl font-bold text-emerald-900">${summary.revenue.today}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-100 text-emerald-700">
                      +{summary.revenue.change}%
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}