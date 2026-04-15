import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MentionsFeed from '@/components/MentionsFeed';
import SentimentChart from '@/components/SentimentChart';
import KeywordTracker from '@/components/KeywordTracker';
import CompetitorMonitor from '@/components/CompetitorMonitor';
import TrendingTopics from '@/components/TrendingTopics';
import AlertsPanel from '@/components/AlertsPanel';
import SentimentAlerts from '@/components/SentimentAlerts';
import RealTimeDashboard from '@/components/RealTimeDashboard';
import { ContextualHelp, FeatureTooltip } from '@/components/FeatureTooltip';
import { Radio, MessageSquare, TrendingUp, Hash, Users, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function SocialListening() {
  const [activeTab, setActiveTab] = useState('mentions');
  const [workspaceId, setWorkspaceId] = useState(null);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    try {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length > 0) {
        setWorkspaceId(workspaces[0].id);
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
    }
  };

  const { data: mentions = [] } = useQuery({
    queryKey: ['mentions', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return await base44.entities.Mention.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId
  });

  const { data: keywords = [] } = useQuery({
    queryKey: ['keywords', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return await base44.entities.KeywordTrack.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId
  });

  const calculateStats = () => {
    const totalMentions = mentions.length;
    const avgSentiment = mentions.length > 0 
      ? (mentions.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / mentions.length * 100).toFixed(1)
      : 0;
    const crisisAlerts = mentions.filter(m => m.is_crisis || m.priority === 'urgent').length;
    
    return [
      { label: 'Total Mentions', value: totalMentions.toString(), change: '+12%', icon: MessageSquare, color: 'text-violet-600' },
      { label: 'Avg Sentiment', value: `${avgSentiment}%`, change: '+5%', icon: TrendingUp, color: 'text-green-600' },
      { label: 'Tracked Keywords', value: keywords.length.toString(), change: `+${keywords.filter(k => k.status === 'active').length}`, icon: Hash, color: 'text-blue-600' },
      { label: 'Crisis Alerts', value: crisisAlerts.toString(), change: crisisAlerts > 0 ? '⚠️' : '✓', icon: AlertTriangle, color: 'text-red-600' }
    ];
  };

  const stats = calculateStats();

  const startMonitoring = async () => {
    if (!workspaceId) {
      toast.error('No workspace found');
      return;
    }

    setMonitoring(true);
    toast.loading('Starting social listening...');

    try {
      // Get tracked keywords
      const keywords = await base44.entities.KeywordTrack.filter({
        workspace_id: workspaceId,
        status: 'active'
      });

      if (keywords.length === 0) {
        toast.error('Please add keywords to track first');
        setMonitoring(false);
        return;
      }

      // Monitor mentions with AI
      await base44.functions.invoke('aiSocialListening', {
        action: 'monitor_mentions',
        workspace_id: workspaceId,
        keywords
      });

      // AI Sentiment Analysis
      await base44.functions.invoke('aiSocialListening', {
        action: 'analyze_sentiment',
        workspace_id: workspaceId
      });

      // AI Crisis Detection
      await base44.functions.invoke('aiSocialListening', {
        action: 'detect_crisis',
        workspace_id: workspaceId
      });

      // Detect trends
      const brandKeywords = keywords.filter((k) => k.category === 'brand').map((k) => k.keyword);
      await base44.functions.invoke('socialListening', {
        action: 'detect_trends',
        workspace_id: workspaceId,
        industry: 'social media management',
        brand_keywords: brandKeywords
      });

      // Track competitors
      const competitors = await base44.entities.CompetitorTrack.filter({
        workspace_id: workspaceId,
        status: 'active'
      });

      if (competitors.length > 0) {
        for (const competitor of competitors) {
          await base44.functions.invoke('aiSocialListening', {
            action: 'track_competitor',
            workspace_id: workspaceId,
            competitor_id: competitor.id
          });
        }
      }

      toast.success('Social listening scan completed!');

      // Refresh data
      window.location.reload();
    } catch (error) {
      console.error('Monitoring error:', error);
      toast.error('Failed to complete monitoring scan');
    } finally {
      setMonitoring(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Social Listening</h1>
            <p className="text-slate-500">Monitor brand mentions, sentiment, and industry trends</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ContextualHelp
            title="Understanding Crisis Alerts"
            steps={[
              'Crisis alerts trigger when negative mentions come from high-influence accounts',
              'Sentiment shifts are detected when negative mentions exceed 30% of total',
              'Each alert includes recommended actions and response templates',
              'Click "View Mentions" to see the specific posts causing the alert',
              'Mark alerts as reviewed to dismiss them from the dashboard'
            ]}
          />
          <Button
            onClick={startMonitoring}
            disabled={monitoring}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${monitoring ? 'animate-spin' : ''}`} />
            {monitoring ? 'Scanning...' : 'Scan Now'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) =>
        <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <Badge variant="secondary" className="text-xs">{stat.change}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {workspaceId && (
        <>
          <SentimentAlerts mentions={mentions} />
          <AlertsPanel workspaceId={workspaceId} />
        </>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full max-w-4xl">
          <TabsTrigger value="dashboard">
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="mentions">
            <MessageSquare className="w-4 h-4 mr-2" />
            Mentions
          </TabsTrigger>
          <TabsTrigger value="sentiment">
            <TrendingUp className="w-4 h-4 mr-2" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="keywords">
            <Hash className="w-4 h-4 mr-2" />
            Keywords
          </TabsTrigger>
          <TabsTrigger value="competitors">
            <Users className="w-4 h-4 mr-2" />
            Competitors
          </TabsTrigger>
          <TabsTrigger value="trends">
            <Radio className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <RealTimeDashboard mentions={mentions} keywords={keywords} />
        </TabsContent>

        <TabsContent value="mentions" className="mt-6">
          <MentionsFeed mentions={mentions} workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="sentiment" className="mt-6">
          <SentimentChart mentions={mentions} workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="keywords" className="mt-6">
          <KeywordTracker />
        </TabsContent>

        <TabsContent value="competitors" className="mt-6">
          <CompetitorMonitor />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendingTopics />
        </TabsContent>
      </Tabs>
    </div>);

}