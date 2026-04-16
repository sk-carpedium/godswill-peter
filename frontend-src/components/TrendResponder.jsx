import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp,
  Zap,
  Clock,
  CheckCircle2,
  Sparkles,
  Eye,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const _OLD_detectedTrends = [
  {
    id: '1',
    trend: '#SustainableFashion',
    velocity: 420,
    momentum: 'rising',
    relevance: 92,
    platforms: ['instagram', 'tiktok'],
    window: '6 hours',
    aiDraft: {
      caption: '🌿 Sustainability isn\'t just a trend - it\'s our commitment. Our new eco-collection uses 100% recycled materials without compromising style. Join the movement! #SustainableFashion #EcoStyle',
      hashtags: ['#SustainableFashion', '#EcoStyle', '#ConsciousFashion', '#GreenLiving'],
      platforms: ['instagram', 'tiktok'],
      optimalTime: 'Today at 6:30 PM',
      predictedReach: 35600,
      predictedEngagement: 2450
    },
    autoPublish: true,
    status: 'ready'
  },
  {
    id: '2',
    trend: 'AI-Generated Content Debate',
    velocity: 180,
    momentum: 'peaked',
    relevance: 78,
    platforms: ['linkedin', 'twitter'],
    window: '12 hours',
    aiDraft: {
      caption: 'The AI vs Human creativity debate is fascinating. At [Brand], we believe the magic happens when AI enhances human creativity, not replaces it. What\'s your take?',
      hashtags: ['#AIContent', '#CreativityDebate', '#FutureOfWork'],
      platforms: ['linkedin', 'twitter'],
      optimalTime: 'Tomorrow at 9:00 AM',
      predictedReach: 18400,
      predictedEngagement: 1280
    },
    autoPublish: false,
    status: 'draft'
  }
];

export default function TrendResponder({ autoMode = false }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['trends', workspaceId],
    queryFn: async () => { 
      const result = await api.functions.invoke('socialListening', { action: 'detect_trends', workspace_id: workspaceId }).catch(() => ({}));
      return result.trends || [];
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [trends, setTrends] = useState(detectedTrends);
  const [autoExecute, setAutoExecute] = useState(autoMode);

  const handlePublish = (trendId) => {
    setTrends(prev => prev.map(t => 
      t.id === trendId ? { ...t, status: 'published' } : t
    ));
  };

  const handleDismiss = (trendId) => {
    setTrends(prev => prev.filter(t => t.id !== trendId));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#d4af37]" />
            Real-Time Trend Responder
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Auto-Publish</Label>
              <Switch checked={autoExecute} onCheckedChange={setAutoExecute} />
            </div>
            <Badge className="bg-[#d4af37]/20 text-[#d4af37]">
              {trends.length} Active
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {trends.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No trending opportunities detected right now</p>
          </div>
        ) : (
          trends.map((trend) => (
            <div 
              key={trend.id}
              className={cn(
                "p-4 rounded-lg border-2 transition-all",
                trend.momentum === 'rising' ? "border-green-200 bg-green-50/50" :
                trend.momentum === 'peaked' ? "border-amber-200 bg-amber-50/50" :
                "border-slate-200"
              )}
            >
              {/* Trend Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{trend.trend}</h3>
                    <Badge className={cn(
                      trend.momentum === 'rising' ? "bg-green-100 text-green-700" :
                      trend.momentum === 'peaked' ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700"
                    )}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {trend.velocity}% velocity
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Detected {trend.detected}</span>
                    <span>•</span>
                    <span>{trend.relevance}% relevant to your brand</span>
                    <span>•</span>
                    <div className="flex items-center gap-1 text-amber-600 font-medium">
                      <Clock className="w-3 h-3" />
                      Act within {trend.window}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI-Generated Draft */}
              <div className="p-4 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  <p className="text-sm font-semibold text-slate-900">AI-Generated Draft</p>
                  <Badge className="bg-[#d4af37] text-slate-950 text-xs">Ready to Publish</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-3">{trend.aiDraft.caption}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-2 rounded bg-white">
                    <p className="text-xs text-slate-500 mb-1">Predicted Reach</p>
                    <p className="text-sm font-bold text-slate-900">{(trend.aiDraft.predictedReach / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="p-2 rounded bg-white">
                    <p className="text-xs text-slate-500 mb-1">Predicted Engagement</p>
                    <p className="text-sm font-bold text-slate-900">{(trend.aiDraft.predictedEngagement / 1000).toFixed(1)}K</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {trend.aiDraft.hashtags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {autoExecute && trend.autoPublish ? (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handlePublish(trend.id)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Auto-Publishing in {trend.window}
                  </Button>
                ) : (
                  <>
                    <Button 
                      className="flex-1 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                      onClick={() => handlePublish(trend.id)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publish Now
                    </Button>
                    <Button variant="outline" onClick={() => handleDismiss(trend.id)}>
                      Dismiss
                    </Button>
                  </>
                )}
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}