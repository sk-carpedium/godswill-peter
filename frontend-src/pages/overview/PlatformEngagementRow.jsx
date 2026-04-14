import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const PLATFORM_COLORS = {
  instagram: '#E1306C', facebook: '#1877F2', twitter: '#1DA1F2',
  linkedin: '#0A66C2', tiktok: '#010101', youtube: '#FF0000',
  pinterest: '#E60023', threads: '#000000', bluesky: '#0085FF',
  google_business: '#4285F4', twitch: '#9146FF', kick: '#53FC18',
  rumble: '#85C742', truth_social: '#5448EE', shopify: '#96BF48',
  spotify: '#1DB954',
};

const formatNum = (n) => {
  if (!n) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
};

export default function PlatformEngagementRow({ account, analytics }) {
  const color = PLATFORM_COLORS[account.platform] || '#d4af37';
  const reach = analytics?.metrics?.reach || 0;
  const engagement = analytics?.metrics?.engagement || 0;
  const engRate = analytics?.engagement_rate;
  const health = account.health_status || 'healthy';

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <div>
            <p className="text-sm font-semibold text-slate-800 capitalize">{account.platform}</p>
            <p className="text-xs text-slate-400">{account.account_name}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 text-right text-sm font-medium text-slate-700">
        {formatNum(account.follower_count)}
      </td>
      <td className="py-3.5 px-4 text-right text-sm text-slate-600">{formatNum(reach)}</td>
      <td className="py-3.5 px-4 text-right text-sm text-slate-600">{formatNum(engagement)}</td>
      <td className="py-3.5 px-4 text-right">
        <span className="text-sm font-semibold" style={{ color: '#d4af37' }}>
          {engRate ? `${engRate}%` : '—'}
        </span>
      </td>
      <td className="py-3.5 px-4 text-right">
        <Badge variant="secondary" className={cn(
          'text-xs',
          health === 'healthy' && 'bg-emerald-50 text-emerald-700',
          health === 'warning' && 'bg-amber-50 text-amber-700',
          health === 'error' && 'bg-red-50 text-red-600',
          health === 'disconnected' && 'bg-slate-100 text-slate-500',
        )}>
          {health}
        </Badge>
      </td>
    </tr>
  );
}