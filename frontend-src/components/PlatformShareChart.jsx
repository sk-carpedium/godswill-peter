import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const PLATFORM_COLORS = {
  instagram: '#E1306C', facebook: '#1877F2', twitter: '#1DA1F2',
  linkedin: '#0A66C2', tiktok: '#010101', youtube: '#FF0000',
  pinterest: '#E60023', threads: '#000000', bluesky: '#0085FF',
  google_business: '#4285F4', twitch: '#9146FF', kick: '#53FC18',
  rumble: '#85C742', truth_social: '#5448EE', shopify: '#96BF48',
  spotify: '#1DB954',
};

const fmt = (n) => {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-100 p-3 text-xs">
      <p className="font-semibold capitalize">{d.name}</p>
      <p className="text-slate-500">{fmt(d.followers)} followers</p>
      <p className="text-slate-500">{d.pct}% of total</p>
    </div>
  );
};

export default function PlatformShareChart({ accounts = [] }) {
  const total = accounts.reduce((s, a) => s + (a.follower_count || 0), 0);

  const data = accounts
    .filter(a => a.follower_count > 0)
    .map(a => ({
      name: a.platform,
      followers: a.follower_count,
      pct: total > 0 ? Math.round((a.follower_count / total) * 100) : 0,
      color: PLATFORM_COLORS[a.platform] || '#d4af37',
    }))
    .sort((a, b) => b.followers - a.followers);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Follower Share</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-slate-400 py-6 text-center">No connected accounts</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Follower Share by Platform</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={2} dataKey="followers">
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-bold text-slate-900">{fmt(total)}</p>
            <p className="text-xs text-slate-400">Total Followers</p>
          </div>
        </div>
        <div className="space-y-2">
          {data.slice(0, 6).map(d => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-slate-600 capitalize flex-1">{d.name}</span>
              <span className="text-xs font-medium text-slate-700">{fmt(d.followers)}</span>
              <span className="text-xs text-slate-400 w-8 text-right">{d.pct}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}