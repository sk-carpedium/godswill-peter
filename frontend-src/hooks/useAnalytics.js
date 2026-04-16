/**
 * useAnalytics.js — Analytics data hooks
 * Replaces: hardcoded random data in EngagementChart, AdvancedAnalytics, HistoricalReports
 *
 * All hooks use React Query for caching, loading states, and background refresh.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from './useWorkspace';

/** 7-day engagement data for EngagementChart.jsx */
export function useEngagementData(period = '7d') {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['analytics-engagement', workspaceId, period],
    queryFn: async () => {
      const rows = await api.entities.Analytics.filter({
        workspace_id: workspaceId,
        period,
        sort: 'date',
      });
      // Transform to EngagementChart data shape: { date, likes, comments, shares, saves }
      return rows.map(r => ({
        date:     new Date(r.date).toLocaleDateString('en', { weekday: 'short' }),
        likes:    r.likes    || 0,
        comments: r.comments || 0,
        shares:   r.shares   || 0,
        saves:    r.saves    || 0,
      }));
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Hourly engagement heatmap for AudienceEngagement.jsx */
export function useHourlyEngagement() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['analytics-hourly', workspaceId],
    queryFn:  () => api.entities.Analytics.filter({
      workspace_id: workspaceId,
      period:       '30d',
      group_by:     'hour',
    }),
    enabled: !!workspaceId,
    staleTime: 30 * 60 * 1000,
  });
}

/** Top-line metrics for StatsCard/MetricCard/DailySummary */
export function useDashboardMetrics(period = '30d') {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['analytics-metrics', workspaceId, period],
    queryFn: async () => {
      const [analytics, prevAnalytics] = await Promise.all([
        api.entities.Analytics.filter({ workspace_id: workspaceId, period }),
        api.entities.Analytics.filter({ workspace_id: workspaceId, period: '60d', sort: 'date' }),
      ]);

      const sum = (arr, key) => arr.reduce((s, r) => s + (r[key] || 0), 0);
      const current  = analytics;
      const previous = prevAnalytics.slice(0, Math.floor(prevAnalytics.length / 2));

      const pct = (curr, prev) => prev > 0 ? parseFloat(((curr - prev) / prev * 100).toFixed(1)) : 0;

      const reach      = sum(current, 'reach');
      const engagement = sum(current, 'engagement');
      const followers  = current[current.length - 1]?.total_followers || 0;
      const prevReach  = sum(previous, 'reach');
      const prevEng    = sum(previous, 'engagement');

      return {
        reach:           { value: reach,      change: pct(reach, prevReach) },
        engagement:      { value: engagement,  change: pct(engagement, prevEng) },
        total_followers: { value: followers,   change: 0 },
        impressions:     { value: sum(current, 'impressions'), change: 0 },
        clicks:          { value: sum(current, 'clicks'),      change: 0 },
        conversions:     { value: sum(current, 'conversions'), change: 0 },
      };
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Historical reports data — replaces hardcoded mock data in HistoricalReports.jsx */
export function useHistoricalAnalytics(period = '90d') {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['analytics-historical', workspaceId, period],
    queryFn:  () => api.entities.Analytics.filter({
      workspace_id: workspaceId,
      period,
      sort: 'date',
    }),
    enabled: !!workspaceId,
    staleTime: 30 * 60 * 1000,
  });
}

/** Platform breakdown — replaces hardcoded growth values in PlatformBreakdown.jsx */
export function usePlatformAnalytics() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['social-accounts-analytics', workspaceId],
    queryFn: async () => {
      const accounts = await api.entities.SocialAccount.filter({
        workspace_id: workspaceId,
        status: 'active',
      });
      // follower_growth is populated by the analytics sync cron (real %, not hardcoded)
      return accounts;
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}
