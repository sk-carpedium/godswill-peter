import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatValue = (value) => {
  if (typeof value === 'string') return value;
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
  return value.toLocaleString();
};

export default function OverviewMetricCard({ title, value, change, description, icon: Icon, accent = '#d4af37' }) {
  const isPositive = change > 0;
  const isNeutral = change === 0 || change == null;

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${accent}18` }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{formatValue(value)}</p>
      <div className="flex items-center gap-2">
        <span className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
          isNeutral ? 'bg-slate-100 text-slate-500' :
          isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
        )}>
          {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isNeutral ? 'No change' : `${isPositive ? '+' : ''}${Number(change).toFixed(1)}%`}
        </span>
        <span className="text-xs text-slate-400">vs prev period</span>
      </div>
      {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
    </Card>
  );
}