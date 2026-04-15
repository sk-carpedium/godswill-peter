import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  MessageSquare,
  Eye,
  Zap,
  CheckCircle2,
  Clock,
  Activity,
  Target,
  Users,
  ArrowUpRight,
  Shield,
  Brain,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
// import { useQuery } from '@tanstack/react-query';

import { useWorkspace } from '@/hooks';


const _OLD_crisisAlerts = [
  {
    id: '1',
    severity: 'critical',
    title: 'Negative Sentiment Surge',
    detected: '8 minutes ago',
    metrics: {
      negativeMentions: 28,
      growthRate: 420,
      reach: 15600
    },
    keywords: ['shipping delay', 'poor quality', 'disappointed'],
    platforms: ['twitter', 'instagram'],
    trend: [
      { time: '1h', count: 2, predicted: 3 },
      { time: '45m', count: 4, predicted: 6 },
      { time: '30m', count: 8, predicted: 12 },
      { time: '15m', count: 15, predicted: 22 },
      { time: 'Now', count: 28, predicted: 35 },
      { time: '+15m', count: null, predicted: 52 },
      { time: '+30m', count: null, predicted: 78 },
      { time: '+1h', count: null, predicted: 115 }
    ],
    prediction: {
      escalationProbability: 87,
      peakMentionsIn: '2-3 hours',
      estimatedPeakVolume: 150,
      viralityScore: 92,
      containmentWindow: '45 minutes'
    },
    keyInfluencers: [
      { username: '@TechReviewer_Pro', followers: 450000, sentiment: 'negative', reach: 8500 },
      { username: '@CustomerFirst', followers: 125000, sentiment: 'negative', reach: 3200 },
      { username: '@QualityMatters', followers: 89000, sentiment: 'negative', reach: 2100 }
    ],
    suggestedActions: [
      'Post immediate acknowledgment on Twitter',
      'Create public statement addressing concerns',
      'Direct message affected customers',
      'Escalate to customer service team'
    ],
    preApprovedResponses: [
      {
        scenario: 'shipping_delay',
        response: 'We sincerely apologize for the shipping delays. Our team is working around the clock to resolve this. We\'re offering [solution]. DM us your order # for immediate assistance.',
        tone: 'empathetic',
        autoSend: false
      },
      {
        scenario: 'quality_concern',
        response: 'We\'re sorry to hear about your experience. Quality is our top priority. Please reach out to our support team so we can make this right immediately.',
        tone: 'professional',
        autoSend: false
      }
    ],
    escalationLevel: 2,
    autoEscalate: true,
    status: 'active'
  },
  {
    id: '2',
    severity: 'warning',
    title: 'Engagement Drop Detected',
    detected: '2 hours ago',
    metrics: {
      engagementDrop: 42,
      postsAffected: 5,
      potentialReachLoss: 8400
    },
    keywords: ['algorithm change', 'low reach'],
    platforms: ['instagram'],
    prediction: {
      escalationProbability: 23,
      trend: 'stabilizing',
      actionRequired: 'monitor'
    },
    suggestedActions: [
      'Increase posting frequency',
      'Use trending audio in Reels',
      'Engage with followers more actively'
    ],
    status: 'monitoring'
  }
];

export default function CrisisDetector() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['crisis-alerts', workspaceId],
    queryFn: async () => { 
      const alerts = await base44.functions.invoke('socialListening', { action: 'check_alerts', workspace_id: workspaceId }).catch(() => ({ alerts: [] }));
      const mentions = await base44.entities.Mention.filter({ workspace_id: workspaceId, is_crisis: true, sort: '-mentioned_at', limit: 10 });
      return { alerts: alerts.alerts || [], mentions };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [activeAlerts, setActiveAlerts] = useState(crisisAlerts);
  const [selectedResponse, setSelectedResponse] = useState({});
  const [executingPlan, setExecutingPlan] = useState(null);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-700';
      case 'warning': return 'bg-amber-100 border-amber-300 text-amber-700';
      default: return 'bg-blue-100 border-blue-300 text-blue-700';
    }
  };

  const executeResponsePlan = async (alert) => {
    setExecutingPlan(alert.id);
    toast.loading('Executing crisis response plan...');
    
    try {
      // Execute pre-approved automated responses
      await base44.functions.invoke('aiSocialListening', {
        action: 'execute_crisis_response',
        alert_id: alert.id,
        responses: alert.preApprovedResponses.filter(r => r.autoSend)
      });

      // Send escalation alerts
      if (alert.autoEscalate) {
        await base44.integrations.Core.SendEmail({
          to: 'team@company.com',
          subject: `🚨 Crisis Alert: ${alert.title}`,
          body: `Critical situation detected. Escalation Level: ${alert.escalationLevel}. Predicted peak in ${alert.prediction.peakMentionsIn}. View dashboard for details.`
        });
      }

      toast.success('Crisis response plan executed');
    } catch (error) {
      toast.error('Failed to execute response plan');
    } finally {
      setExecutingPlan(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Crisis Detection
        </h3>
        <Badge className={cn(
          activeAlerts.some(a => a.severity === 'critical') 
            ? "bg-red-100 text-red-700" 
            : "bg-green-100 text-green-700"
        )}>
          <Activity className="w-3 h-3 mr-1" />
          {activeAlerts.length > 0 ? `${activeAlerts.length} Active Alerts` : 'All Clear'}
        </Badge>
      </div>

      {activeAlerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <p className="text-slate-600">No crisis detected. Your brand reputation is healthy!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <Card key={alert.id} className={cn("border-2", getSeverityColor(alert.severity))}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-base">{alert.title}</CardTitle>
                      <Badge className={cn(
                        alert.severity === 'critical' ? "bg-red-600 text-white" :
                        "bg-amber-600 text-white"
                      )}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Detected {alert.detected}
                    </p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    alert.status === 'active' ? "border-red-200 text-red-700" : "border-slate-200"
                  )}>
                    {alert.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Prediction Panel */}
                {alert.prediction && (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">AI Predictive Analysis</h4>
                      <Badge className="bg-purple-600 text-white ml-auto">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Predictive
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-purple-700 mb-1">Escalation Risk</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-bold text-purple-900">{alert.prediction.escalationProbability}%</p>
                          <Progress value={alert.prediction.escalationProbability} className="flex-1 h-2" />
                        </div>
                      </div>
                      {alert.prediction.peakMentionsIn && (
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Peak Expected</p>
                          <p className="text-sm font-bold text-purple-900">{alert.prediction.peakMentionsIn}</p>
                        </div>
                      )}
                      {alert.prediction.estimatedPeakVolume && (
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Peak Volume</p>
                          <p className="text-sm font-bold text-purple-900">{alert.prediction.estimatedPeakVolume} mentions</p>
                        </div>
                      )}
                      {alert.prediction.containmentWindow && (
                        <div>
                          <p className="text-xs text-purple-700 mb-1">Action Window</p>
                          <p className="text-sm font-bold text-red-700">⏰ {alert.prediction.containmentWindow}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-white border">
                  {Object.entries(alert.metrics).map(([key, value], i) => (
                    <div key={i}>
                      <p className="text-xs text-slate-500 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {typeof value === 'number' && value > 100 ? value.toLocaleString() : value}
                        {key.includes('Rate') || key.includes('Drop') ? '%' : ''}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Predictive Trend Chart */}
                {alert.trend && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      Actual vs Predicted Trajectory
                    </p>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={alert.trend}>
                        <defs>
                          <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="predicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#dc2626"
                          fillOpacity={1}
                          fill="url(#actual)"
                          strokeWidth={2}
                          name="Actual"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="#9333ea"
                          strokeDasharray="5 5"
                          fillOpacity={1}
                          fill="url(#predicted)"
                          strokeWidth={2}
                          name="Predicted"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Key Negative Influencers */}
                {alert.keyInfluencers && alert.keyInfluencers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-red-600" />
                      Key Negative Influencers
                    </p>
                    <div className="space-y-2">
                      {alert.keyInfluencers.map((influencer, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                              <Users className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{influencer.username}</p>
                              <p className="text-xs text-slate-500">{influencer.followers.toLocaleString()} followers</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-700">{influencer.reach.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">reach</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Keywords Detected</p>
                  <div className="flex flex-wrap gap-2">
                    {alert.keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Pre-Approved Response Strategies */}
                {alert.preApprovedResponses && alert.preApprovedResponses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      Pre-Approved Response Templates
                    </p>
                    <div className="space-y-2">
                      {alert.preApprovedResponses.map((response, i) => (
                        <div key={i} className="p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline" className="text-xs bg-white">
                              {response.scenario.replace('_', ' ')}
                            </Badge>
                            <Badge className={cn(
                              "text-xs",
                              response.autoSend ? "bg-green-600 text-white" : "bg-slate-200 text-slate-700"
                            )}>
                              {response.autoSend ? 'Auto-Send' : 'Manual'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700 italic">"{response.response}"</p>
                          <p className="text-xs text-slate-500 mt-2">Tone: {response.tone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Actions */}
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">AI-Suggested Actions</p>
                  <div className="space-y-2">
                    {alert.suggestedActions.map((action, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-slate-400" />
                        <p className="text-sm text-slate-600">{action}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escalation Status */}
                {alert.escalationLevel && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <AlertDescription className="text-sm text-orange-900">
                      <span className="font-semibold">Escalation Level {alert.escalationLevel}</span>
                      {alert.autoEscalate && ' • Auto-escalation enabled • Team will be notified immediately'}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
                    onClick={() => executeResponsePlan(alert)}
                    disabled={executingPlan === alert.id}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {executingPlan === alert.id ? 'Executing...' : 'Execute Crisis Response'}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    View All Mentions
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}