import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, Eye, Heart, TrendingUp, MessageCircle, Share2,
  RefreshCw, Globe, Zap, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OverviewMetricCard from '@/components/OverviewMetricCard';
import TrendChart from '@/components/TrendChart';
import PlatformShareChart from '@/components/PlatformShareChart';
import PlatformEngagementRow from '@/components/PlatformEngagementRow';

const ACCENT = '#d4af37';

export default function WorkspaceOverview() {
  const [dateRange, setDateRange] = useState('30d');

  // Load workspace
  const { data: workspace } = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const list = await base44.entities.Workspace.filter({ status: 'active' });
      return list[0] || null;
    }
  });

  const workspaceId = workspace?.id;

  const { data: socialAccounts = [] } = useQuery({
    queryKey: ['social-accounts-overview', workspaceId],
    queryFn: () => base44.entities.SocialAccount.filter({ workspace_id: workspaceId, status: 'active' }),
    enabled: !!workspaceId
  });

  const { data: analytics = [], refetch, isFetching } = useQuery({
    queryKey: ['analytics-overview', workspaceId, dateRange],
    queryFn: async () => {
      const records = await base44.entities.Analytics.filter({ workspace_id: workspaceId });
      return records.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 200);
    },
    enabled: !!workspaceId
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts-overview', workspaceId],
    queryFn: () => base44.entities.Post.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId
  });

  // ── Aggregate metrics ──────────────────────────────────────────────────────
  const periodDays = dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30;
  const cutoff = Date.now() - periodDays * 86400000;
  const recent = analytics.filter(a => new Date(a.date) >= cutoff);
  const prev = analytics.filter(a => {
    const d = new Date(a.date).getTime();
    return d < cutoff && d >= cutoff - periodDays * 86400000;
  });

  const sum = (arr, fn) => arr.reduce((s, a) => s + (fn(a) || 0), 0);
  const pctChange = (curr, old) => old > 0 ? ((curr - old) / old) * 100 : 0;

  const totalFollowers = socialAccounts.reduce((s, a) => s + (a.follower_count || 0), 0);
  const totalReach = sum(recent, a => a.metrics?.reach);
  const totalEngagement = sum(recent, a => a.metrics?.engagement);
  const totalImpressions = sum(recent, a => a.metrics?.impressions);
  const totalComments = sum(recent, a => a.metrics?.comments);
  const totalShares = sum(recent, a => a.metrics?.shares);
  const avgEngRate = recent.length
    ? (sum(recent, a => parseFloat(a.engagement_rate || 0)) / recent.length).toFixed(2)
    : '0.00';

  const prevReach = sum(prev, a => a.metrics?.reach);
  const prevEngagement = sum(prev, a => a.metrics?.engagement);
  const prevImpressions = sum(prev, a => a.metrics?.impressions);

  const publishedPosts = posts.filter(p => p.status === 'published').length;
  const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;

  const metrics = [
    { title: 'Total Followers', value: totalFollowers, change: 12.5, icon: Users, description: 'Across all connected accounts' },
    { title: 'Total Reach', value: totalReach, change: pctChange(totalReach, prevReach), icon: Eye, description: `Last ${periodDays} days` },
    { title: 'Total Engagement', value: totalEngagement, change: pctChange(totalEngagement, prevEngagement), icon: Heart, description: 'Likes, comments, shares, saves' },
    { title: 'Impressions', value: totalImpressions, change: pctChange(totalImpressions, prevImpressions), icon: Activity, description: 'Total content impressions' },
    { title: 'Avg. Engagement Rate', value: `${avgEngRate}%`, change: null, icon: TrendingUp, description: 'Average across all platforms' },
    { title: 'Published Posts', value: publishedPosts, change: null, icon: Zap, description: `${scheduledPosts} scheduled` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-5 h-5" style={{ color: ACCENT }} />
            <h1 className="text-2xl font-bold text-slate-900">Workspace Overview</h1>
          </div>
          <p className="text-slate-500 text-sm">
            Aggregated engagement across{' '}
            <span className="font-semibold text-slate-700">{socialAccounts.length}</span> connected platform{socialAccounts.length !== 1 ? 's' : ''}
            {workspace?.name && <span className="text-slate-400"> · {workspace.name}</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Tabs value={dateRange} onValueChange={setDateRange}>
            <TabsList>
              <TabsTrigger value="7d">7 days</TabsTrigger>
              <TabsTrigger value="30d">30 days</TabsTrigger>
              <TabsTrigger value="90d">90 days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isFetching && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick-stat summary bar */}
      <Card className="border-0 shadow-sm" style={{ background: `linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)` }}>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 divide-x divide-white/10">
            {[
              { label: 'Platforms', value: socialAccounts.length },
              { label: 'Comments', value: totalComments >= 1000 ? `${(totalComments / 1000).toFixed(1)}K` : totalComments },
              { label: 'Shares', value: totalShares >= 1000 ? `${(totalShares / 1000).toFixed(1)}K` : totalShares },
              { label: 'Posts Published', value: publishedPosts },
              { label: 'Scheduled', value: scheduledPosts },
              { label: 'Brands', value: socialAccounts.reduce((s, a) => a.brand_id ? s.add(a.brand_id) : s, new Set()).size },
            ].map(item => (
              <div key={item.label} className="text-center px-2">
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(m => <OverviewMetricCard key={m.title} {...m} accent={ACCENT} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrendChart analytics={analytics} />
        </div>
        <div>
          <PlatformShareChart accounts={socialAccounts} />
        </div>
      </div>

      {/* Per-platform engagement table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Platform-by-Platform Breakdown</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {socialAccounts.length} platforms
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {socialAccounts.length === 0 ? (
            <p className="text-sm text-slate-400 py-10 text-center">No connected social accounts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Platform</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Followers</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Reach</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Engagement</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Eng. Rate</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Health</th>
                  </tr>
                </thead>
                <tbody>
                  {socialAccounts.map(account => (
                    <PlatformEngagementRow
                      key={account.id}
                      account={account}
                      analytics={analytics.find(a => a.social_account_id === account.id)}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="py-3 px-4 text-xs font-bold text-slate-600 uppercase">Totals</td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-slate-800">
                      {totalFollowers >= 1000 ? `${(totalFollowers / 1000).toFixed(1)}K` : totalFollowers}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-slate-800">
                      {totalReach >= 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-bold text-slate-800">
                      {totalEngagement >= 1000 ? `${(totalEngagement / 1000).toFixed(1)}K` : totalEngagement}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-bold" style={{ color: ACCENT }}>
                      {avgEngRate}%
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}