import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Bell, X, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


export default function SentimentAlerts({ mentions = [] }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['sentiment-alerts', workspaceId],
    queryFn: async () => { 
      const mentions = await base44.entities.Mention.filter({ workspace_id: workspaceId, sentiment: 'negative', status: 'new', sort: '-mentioned_at', limit: 20 });
      return mentions;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const queryClient = useQueryClient();

  // Detect sentiment shifts and crisis situations
  const alerts = React.useMemo(() => {
    const criticalMentions = mentions.filter(m => m.is_crisis || m.priority === 'urgent');
    const negativeTrend = mentions.filter(m => m.sentiment === 'negative').length > mentions.length * 0.3;
    const highInfluenceNegative = mentions.filter(m => 
      m.sentiment === 'negative' && m.influence_score > 70
    );

    const alertList = [];

    if (criticalMentions.length > 0) {
      alertList.push({
        id: 'crisis',
        type: 'crisis',
        severity: 'critical',
        title: `${criticalMentions.length} Crisis Mention${criticalMentions.length > 1 ? 's' : ''} Detected`,
        description: 'Urgent negative mentions from influential accounts require immediate attention',
        mentions: criticalMentions
      });
    }

    if (negativeTrend) {
      alertList.push({
        id: 'negative-trend',
        type: 'trend',
        severity: 'warning',
        title: 'Negative Sentiment Trend',
        description: `${Math.round((mentions.filter(m => m.sentiment === 'negative').length / mentions.length) * 100)}% of recent mentions are negative`,
        mentions: []
      });
    }

    if (highInfluenceNegative.length > 0) {
      alertList.push({
        id: 'influencer-negative',
        type: 'influencer',
        severity: 'high',
        title: `${highInfluenceNegative.length} Influential Negative Mention${highInfluenceNegative.length > 1 ? 's' : ''}`,
        description: 'High-reach accounts are posting negative content about your brand',
        mentions: highInfluenceNegative
      });
    }

    return alertList;
  }, [mentions]);

  const dismissAlert = useMutation({
    mutationFn: async (alert) => {
      // Mark mentions as reviewed
      for (const mention of alert.mentions || []) {
        await base44.entities.Mention.update(mention.id, { status: 'reviewed' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentions']);
      toast.success('Alert dismissed');
    }
  });

  if (alerts.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">All Clear</p>
              <p className="text-sm text-emerald-700">No critical alerts at this time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={cn(
            "border-2",
            alert.severity === 'critical' && "border-red-300 bg-red-50/50",
            alert.severity === 'high' && "border-orange-300 bg-orange-50/50",
            alert.severity === 'warning' && "border-amber-300 bg-amber-50/50"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  "p-2 rounded-lg",
                  alert.severity === 'critical' && "bg-red-100",
                  alert.severity === 'high' && "bg-orange-100",
                  alert.severity === 'warning' && "bg-amber-100"
                )}>
                  {alert.type === 'crisis' ? (
                    <AlertTriangle className={cn(
                      "w-5 h-5",
                      alert.severity === 'critical' && "text-red-600",
                      alert.severity === 'high' && "text-orange-600",
                      alert.severity === 'warning' && "text-amber-600"
                    )} />
                  ) : (
                    <TrendingDown className={cn(
                      "w-5 h-5",
                      alert.severity === 'critical' && "text-red-600",
                      alert.severity === 'high' && "text-orange-600",
                      alert.severity === 'warning' && "text-amber-600"
                    )} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{alert.title}</h4>
                    <Badge
                      variant="secondary"
                      className={cn(
                        alert.severity === 'critical' && "bg-red-100 text-red-700",
                        alert.severity === 'high' && "bg-orange-100 text-orange-700",
                        alert.severity === 'warning' && "bg-amber-100 text-amber-700"
                      )}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">{alert.description}</p>
                  {alert.mentions.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <Button size="sm" className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]">
                        <Bell className="w-3 h-3 mr-1" />
                        View {alert.mentions.length} Mention{alert.mentions.length > 1 ? 's' : ''}
                      </Button>
                      <Button size="sm" variant="outline">
                        Generate Response
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dismissAlert.mutate(alert)}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}