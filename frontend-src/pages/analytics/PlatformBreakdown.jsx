/**
 * PlatformBreakdown.jsx — FIXED
 * Now: reads follower_growth from SocialAccount (set by analytics sync cron)
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { usePlatformAnalytics } from '@/hooks';

const PLATFORM_COLORS = {
  instagram:'#E1306C',facebook:'#1877F2',twitter:'#1DA1F2',
  linkedin:'#0A66C2',tiktok:'#000000',youtube:'#FF0000',
  pinterest:'#E60023',threads:'#000000',bluesky:'#0085FF',
  twitch:'#9146FF',spotify:'#1DB954',shopify:'#96bf48',
  google_business:'#4285F4',kick:'#53FC18',rumble:'#85C742',truth_social:'#5448EE',
};

const fmt = n => n >= 1e6 ? (n/1e6).toFixed(1)+'M' : n >= 1e3 ? (n/1e3).toFixed(1)+'K' : String(n||0);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3">
      <p className="font-semibold capitalize">{d.name}</p>
      <p className="text-sm text-slate-600">{fmt(d.followers)} followers</p>
      <p className="text-sm text-slate-600">{d.value}% of total reach</p>
    </div>
  );
};

export default function PlatformBreakdown() {
  const { data: accounts = [], isLoading } = usePlatformAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
        <CardContent><Skeleton className="h-[250px] w-full" /></CardContent>
      </Card>
    );
  }

  if (!accounts.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Platform Breakdown</CardTitle></CardHeader>
        <CardContent><p className="text-center py-8 text-slate-500">No connected accounts</p></CardContent>
      </Card>
    );
  }

  const total = accounts.reduce((s, a) => s + (a.follower_count || 0), 0);
  const chartData = accounts.map(a => ({
    name:      a.platform,
    value:     total > 0 ? Math.round((a.follower_count / total) * 100) : 0,
    followers: a.follower_count || 0,
    color:     PLATFORM_COLORS[a.platform] || '#d4af37',
    // follower_growth is populated by the backend analytics sync cron — real value, not Math.random
    growth:    typeof a.follower_growth === 'number' ? a.follower_growth : null,
  }));

  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Platform Breakdown</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{fmt(total)}</p>
                <p className="text-sm text-slate-500">Total Followers</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {chartData.map(p => (
              <div key={p.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="font-medium text-sm capitalize">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">{fmt(p.followers)}</span>
                    {p.growth !== null && (
                      <Badge variant="secondary" className={cn("text-xs", p.growth >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700")}>
                        {p.growth >= 0 ? '+' : ''}{p.growth.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress value={p.value} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
