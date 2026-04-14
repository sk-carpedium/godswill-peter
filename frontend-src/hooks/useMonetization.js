/**
 * useMonetization.js — Revenue, brand deals, and affiliate data hooks
 * Replaces: hardcoded salesData/linkedPosts in SalesTracker, hardcoded deals in ActiveDeals
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

/** Revenue data for EarningsChart, ExportableEarnings, SalesTracker */
export function useRevenue(filters = {}) {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['revenue', workspaceId, filters],
    queryFn: () => base44.entities.Revenue.filter({
      workspace_id: workspaceId, ...filters,
    }),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  });
}

/** Active brand deals for ActiveDeals.jsx */
export function useBrandDeals(status = 'active') {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['brand-deals', workspaceId, status],
    queryFn: () => base44.entities.BrandDeal.filter({
      workspace_id: workspaceId, ...(status && { status }),
    }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

/** SalesTracker — revenue with post attribution */
export function useSalesData(period = '7d') {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['sales-data', workspaceId, period],
    queryFn: async () => {
      const [revenues, posts] = await Promise.all([
        base44.entities.Revenue.filter({ workspace_id: workspaceId, period }),
        base44.entities.Post.filter({ workspace_id: workspaceId, status: 'published', sort: '-created_at', limit: 20 }),
      ]);

      // Build daily chart data grouped by date
      const byDate = {};
      revenues.forEach(r => {
        const d = new Date(r.transaction_date || r.date).toISOString().split('T')[0];
        if (!byDate[d]) byDate[d] = { date: d, sales: 0, orders: 0 };
        byDate[d].sales  += r.amount || 0;
        byDate[d].orders += 1;
      });

      // Posts with revenue attribution
      const linkedPosts = posts
        .filter(p => revenues.some(r => r.post_id === p.id))
        .map(p => {
          const postRevs = revenues.filter(r => r.post_id === p.id);
          return {
            ...p,
            post_title:      p.title || p.content?.text?.slice(0, 40) || 'Post',
            revenue:         postRevs.reduce((s, r) => s + (r.amount || 0), 0),
            orders:          postRevs.length,
            product_clicks:  p.metrics?.clicks || 0,
            conversion_rate: p.metrics?.reach > 0
              ? parseFloat(((postRevs.length / p.metrics.reach) * 100).toFixed(1))
              : 0,
          };
        })
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      return {
        chartData:    Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date)),
        linkedPosts,
        totalRevenue: revenues.reduce((s, r) => s + (r.amount || 0), 0),
        totalOrders:  revenues.length,
      };
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

/** EarningsChart — revenue broken down by source type */
export function useEarningsBreakdown(period = '7d') {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['earnings-breakdown', workspaceId, period],
    queryFn: async () => {
      const revenues = await base44.entities.Revenue.filter({
        workspace_id: workspaceId, period,
      });
      // Group by date + source for stacked chart
      const byDate = {};
      revenues.forEach(r => {
        const d = new Date(r.transaction_date || r.date).toLocaleDateString('en', { weekday: 'short' });
        if (!byDate[d]) byDate[d] = { date: d, sponsored: 0, affiliate: 0, ads: 0, tips: 0 };
        const src = r.source || 'ads';
        const key = src.includes('sponsor') ? 'sponsored' : src.includes('affiliate') ? 'affiliate' : src === 'tips' ? 'tips' : 'ads';
        byDate[d][key] += r.amount || 0;
      });
      return Object.values(byDate);
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBrandDealMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['brand-deals'] });

  return {
    update: useMutation({
      mutationFn: ({ id, data }) => base44.entities.BrandDeal.update(id, data),
      onSuccess: () => { toast.success('Deal updated'); invalidate(); },
      onError: (e) => toast.error(e.message),
    }),
  };
}
