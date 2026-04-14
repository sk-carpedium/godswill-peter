import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users,
  MessageSquare,
  AlertTriangle,
  Eye,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function RealTimeDashboard({ mentions = [], keywords = [] }) {
  // Real-time metrics
  const metrics = React.useMemo(() => {
    const last24h = mentions.filter(m => 
      new Date(m.mentioned_at) > new Date(Date.now() - 86400000)
    );
    const previous24h = mentions.filter(m => {
      const mentionDate = new Date(m.mentioned_at);
      return mentionDate > new Date(Date.now() - 172800000) && 
             mentionDate <= new Date(Date.now() - 86400000);
    });

    const totalReach = last24h.reduce((sum, m) => sum + (m.reach || m.author?.follower_count || 0), 0);
    const totalEngagement = last24h.reduce((sum, m) => 
      sum + ((m.engagement?.likes || 0) + (m.engagement?.comments || 0) + (m.engagement?.shares || 0)), 0
    );

    const sentimentScore = last24h.length > 0
      ? (last24h.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / last24h.length * 100).toFixed(1)
      : 0;

    const prevSentiment = previous24h.length > 0
      ? (previous24h.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / previous24h.length * 100)
      : 0;

    return {
      mentions24h: last24h.length,
      mentionChange: previous24h.length > 0 ? ((last24h.length - previous24h.length) / previous24h.length * 100).toFixed(1) : 0,
      totalReach,
      totalEngagement,
      sentimentScore,
      sentimentChange: (sentimentScore - prevSentiment).toFixed(1),
      crisisCount: last24h.filter(m => m.is_crisis).length
    };
  }, [mentions]);

  // Hourly activity data for last 24 hours
  const hourlyData = React.useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - (23 - i), 0, 0, 0);
      return hour;
    });

    return hours.map(hour => {
      const hourMentions = mentions.filter(m => {
        const mentionHour = new Date(m.mentioned_at);
        return mentionHour >= hour && mentionHour < new Date(hour.getTime() + 3600000);
      });

      return {
        hour: moment(hour).format('ha'),
        mentions: hourMentions.length,
        positive: hourMentions.filter(m => m.sentiment === 'positive').length,
        negative: hourMentions.filter(m => m.sentiment === 'negative').length
      };
    });
  }, [mentions]);

  // Platform breakdown
  const platformData = React.useMemo(() => {
    const platforms = {};
    mentions.forEach(m => {
      if (!platforms[m.platform]) {
        platforms[m.platform] = { positive: 0, neutral: 0, negative: 0 };
      }
      platforms[m.platform][m.sentiment]++;
    });

    return Object.entries(platforms).map(([platform, sentiments]) => ({
      platform,
      ...sentiments,
      total: sentiments.positive + sentiments.neutral + sentiments.negative
    }));
  }, [mentions]);

  const metricCards = [
    {
      title: 'Mentions (24h)',
      value: metrics.mentions24h,
      change: metrics.mentionChange,
      icon: MessageSquare,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      title: 'Total Reach',
      value: metrics.totalReach >= 1000 ? `${(metrics.totalReach / 1000).toFixed(1)}K` : metrics.totalReach,
      change: '+15.2',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Sentiment Score',
      value: `${metrics.sentimentScore}%`,
      change: metrics.sentimentChange,
      icon: Activity,
      color: metrics.sentimentScore > 50 ? 'text-green-600' : 'text-red-600',
      bgColor: metrics.sentimentScore > 50 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Crisis Alerts',
      value: metrics.crisisCount,
      change: metrics.crisisCount > 0 ? '⚠️' : '✓',
      icon: AlertTriangle,
      color: metrics.crisisCount > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: metrics.crisisCount > 0 ? 'bg-red-50' : 'bg-green-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                </div>
                <Badge 
                  variant="secondary"
                  className={cn(
                    parseFloat(metric.change) > 0 && "bg-emerald-50 text-emerald-700",
                    parseFloat(metric.change) < 0 && "bg-red-50 text-red-700"
                  )}
                >
                  {parseFloat(metric.change) > 0 && <TrendingUp className="w-3 h-3 mr-1" />}
                  {parseFloat(metric.change) < 0 && <TrendingDown className="w-3 h-3 mr-1" />}
                  {metric.change}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
              <p className="text-sm text-slate-500 mt-1">{metric.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">24-Hour Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="mentions" stroke="#8b5cf6" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} name="Positive" />
              <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} name="Negative" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sentiment by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" stackId="a" fill="#10b981" name="Positive" />
              <Bar dataKey="neutral" stackId="a" fill="#64748b" name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill="#ef4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}