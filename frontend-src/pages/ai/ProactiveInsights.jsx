import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Target,
  RefreshCw,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const insights = [
  {
    id: '1',
    type: 'action',
    priority: 'urgent',
    title: 'Repost High Performer Now',
    message: 'Your "Summer Collection" post from 3 days ago is still trending. Repost now to reach 23% more of your audience.',
    action: 'Repost Content',
    impact: '+2.3K expected reach',
    timeWindow: '2 hours',
    autoExecutable: true
  },
  {
    id: '2',
    type: 'crisis',
    priority: 'critical',
    title: 'Negative Sentiment Spike Detected',
    message: 'Detected 15 negative mentions in the last hour about shipping delays. Immediate response recommended.',
    action: 'View Mentions',
    impact: 'Brand protection',
    timeWindow: 'Now',
    autoExecutable: false
  },
  {
    id: '3',
    type: 'trend',
    priority: 'high',
    title: 'Trending Topic Opportunity',
    message: '#SustainableFashion is trending +420% in your niche. Create content now to capitalize.',
    action: 'Generate Post',
    impact: '+40% reach potential',
    timeWindow: '6 hours',
    autoExecutable: true
  },
  {
    id: '4',
    type: 'optimization',
    priority: 'medium',
    title: 'Adjust Posting Schedule',
    message: 'Your audience is 30% more active at 7 PM vs your current 3 PM schedule.',
    action: 'Update Schedule',
    impact: '+18% engagement',
    timeWindow: 'Next post',
    autoExecutable: true
  },
  {
    id: '5',
    type: 'engagement',
    priority: 'medium',
    title: 'VIP Follower Inactive',
    message: '@influencer_maria (50K followers) hasn\'t engaged in 2 weeks. Send personalized content.',
    action: 'Create Message',
    impact: 'Relationship retention',
    timeWindow: '24 hours',
    autoExecutable: true
  }
];

export default function ProactiveInsights({ onAction, limitedMode = false }) {
  const [activeInsights, setActiveInsights] = useState(
    limitedMode ? insights.slice(0, 3) : insights
  );
  const [autoMode, setAutoMode] = useState(false);

  const handleAction = (insight) => {
    if (onAction) {
      onAction(insight);
    }
  };

  const handleAutoExecute = (insightId) => {
    setActiveInsights(prev => prev.filter(i => i.id !== insightId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Proactive AI Insights</h3>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#d4af37]/20 text-[#d4af37]">
            {activeInsights.length} Active
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setAutoMode(!autoMode)}
          >
            <Zap className={cn("w-4 h-4 mr-2", autoMode && "text-[#d4af37]")} />
            {autoMode ? 'Auto: ON' : 'Auto: OFF'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {activeInsights.map((insight) => (
          <Card 
            key={insight.id}
            className={cn(
              "border-2 transition-all",
              insight.priority === 'critical' ? "border-red-200 bg-red-50/50" :
              insight.priority === 'urgent' ? "border-amber-200 bg-amber-50/50" :
              insight.priority === 'high' ? "border-[#d4af37]/30 bg-[#d4af37]/5" :
              "border-slate-200"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  insight.priority === 'critical' ? "bg-red-100" :
                  insight.priority === 'urgent' ? "bg-amber-100" :
                  "bg-[#d4af37]/20"
                )}>
                  {insight.type === 'crisis' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                  {insight.type === 'action' && <Zap className="w-5 h-5 text-[#d4af37]" />}
                  {insight.type === 'trend' && <TrendingUp className="w-5 h-5 text-[#d4af37]" />}
                  {insight.type === 'optimization' && <Target className="w-5 h-5 text-blue-600" />}
                  {insight.type === 'engagement' && <RefreshCw className="w-5 h-5 text-purple-600" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-slate-900">{insight.title}</h4>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          insight.priority === 'critical' ? "border-red-200 text-red-700" :
                          insight.priority === 'urgent' ? "border-amber-200 text-amber-700" :
                          "border-[#d4af37]/30 text-[#d4af37]"
                        )}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 mb-2">{insight.message}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Act within {insight.timeWindow}</span>
                        </div>
                        {insight.impact && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">{insight.impact}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                      onClick={() => handleAction(insight)}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-2" />
                      {insight.action}
                    </Button>
                    {insight.autoExecutable && autoMode && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAutoExecute(insight.id)}
                      >
                        <Zap className="w-3 h-3 mr-2" />
                        Auto-Execute
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}