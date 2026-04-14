import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, TrendingUp, Activity, Zap, Eye, MessageSquare, Target, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import moment from 'moment';

const anomalies = [
  {
    id: '1',
    type: 'engagement_drop',
    severity: 'high',
    title: 'Sudden Engagement Drop',
    metric: 'Engagement Rate',
    current: 2.1,
    expected: 4.8,
    change: -56.2,
    detected_at: new Date(Date.now() - 1800000),
    platforms: ['instagram', 'facebook'],
    explanation: 'Engagement rate dropped 56% below normal levels. Analysis shows posts are being published during low-activity hours (3-5 AM local time) due to recent schedule changes.',
    recommended_actions: [
      'Revert to previous posting schedule (9 AM - 8 PM)',
      'Review recent scheduling automation changes',
      'Consider using AI optimal time feature'
    ],
    impact: 'Approximately 15K fewer interactions per post',
    confidence: 94
  },
  {
    id: '2',
    type: 'follower_spike',
    severity: 'medium',
    title: 'Unusual Follower Growth',
    metric: 'Follower Count',
    current: 2450,
    expected: 120,
    change: 1941.6,
    detected_at: new Date(Date.now() - 3600000),
    platforms: ['tiktok'],
    explanation: 'TikTok gained 2,450 followers in the last hour (20x normal rate). A recent video went viral, reaching 450K views. Follower quality analysis: 82% genuine accounts, 18% potential bots.',
    recommended_actions: [
      'Engage with new followers to maintain momentum',
      'Post follow-up content while trending',
      'Monitor bot accounts and remove if needed',
      'Capitalize on trend with similar content'
    ],
    impact: 'Estimated +180% reach increase for next 48 hours',
    confidence: 97
  },
  {
    id: '3',
    type: 'reach_anomaly',
    severity: 'low',
    title: 'Reach Below Baseline',
    metric: 'Reach',
    current: 12500,
    expected: 18200,
    change: -31.3,
    detected_at: new Date(Date.now() - 7200000),
    platforms: ['linkedin'],
    explanation: 'LinkedIn posts reaching 31% fewer people than usual. Recent algorithm update appears to favor video content and carousel posts over static images. Your recent image-only posts are underperforming.',
    recommended_actions: [
      'Increase video and carousel content ratio',
      'Add more text in post descriptions (algorithm favors 1200+ chars)',
      'Engage more with comments to boost visibility'
    ],
    impact: 'Missing ~5,700 impressions per post',
    confidence: 89
  }
];

export default function AnomalyDetector({ onActionClick }) {
  const [dismissed, setDismissed] = useState([]);

  const activeAnomalies = anomalies.filter(a => !dismissed.includes(a.id));

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'high':
        return {
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-100 text-red-700'
        };
      case 'medium':
        return {
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-700'
        };
      case 'low':
        return {
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-700'
        };
      default:
        return {
          color: 'text-slate-600',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          badge: 'bg-slate-100 text-slate-700'
        };
    }
  };

  const handleDismiss = (id) => {
    setDismissed([...dismissed, id]);
    toast.success('Anomaly dismissed');
  };

  if (activeAnomalies.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">All Systems Normal</h3>
          <p className="text-sm text-slate-500">No anomalies detected in your performance data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#d4af37]" />
          AI Anomaly Detection
        </h3>
        <Badge className="bg-[#d4af37]/20 text-[#d4af37]">
          {activeAnomalies.length} Active
        </Badge>
      </div>

      <div className="space-y-3">
        {activeAnomalies.map((anomaly) => {
          const config = getSeverityConfig(anomaly.severity);
          
          return (
            <Card key={anomaly.id} className={cn("border-2", config.border, config.bg)}>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={cn("w-5 h-5", config.color)} />
                        <h4 className="font-semibold text-slate-900">{anomaly.title}</h4>
                        <Badge className={config.badge}>{anomaly.severity}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="text-slate-600">{anomaly.metric}</span>
                        <span className="text-slate-400">•</span>
                        <span className={cn(
                          "font-semibold flex items-center gap-1",
                          anomaly.change > 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {anomaly.change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {Math.abs(anomaly.change).toFixed(1)}%
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{moment(anomaly.detected_at).fromNow()}</span>
                      </div>
                      <div className="flex gap-2 mb-3">
                        {anomaly.platforms.map(platform => (
                          <Badge key={platform} variant="secondary" className="text-xs capitalize">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDismiss(anomaly.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </Button>
                  </div>

                  {/* AI Explanation */}
                  <div className="p-3 bg-white/80 rounded-lg border border-slate-200">
                    <div className="flex items-start gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#d4af37] mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 mb-1">AI Analysis</p>
                        <p className="text-sm text-slate-700">{anomaly.explanation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-slate-500">Impact: </span>
                        <span className="font-medium text-slate-700">{anomaly.impact}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <Badge variant="secondary" className="text-xs">
                        {anomaly.confidence}% Confidence
                      </Badge>
                    </div>
                  </div>

                  {/* Recommended Actions */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">Recommended Actions:</p>
                    <div className="space-y-2">
                      {anomaly.recommended_actions.map((action, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-[#d4af37] mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    size="sm"
                    className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                    onClick={() => onActionClick?.(anomaly)}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Apply Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}