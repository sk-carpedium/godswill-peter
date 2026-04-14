import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-violet-600',
  iconBg = 'bg-violet-50',
  className
}) {
  const getTrendIcon = () => {
    if (!change) return <Minus className="w-3 h-3" />;
    return change > 0 ?
    <TrendingUp className="w-3 h-3" /> :
    <TrendingDown className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-slate-500 bg-slate-50';
    return change > 0 ?
    'text-emerald-600 bg-emerald-50' :
    'text-red-600 bg-red-50';
  };

  return (
    <Card className={cn("p-6 hover:shadow-lg transition-shadow", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {(change !== undefined || changeLabel) &&
          <div className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            getTrendColor()
          )}>
              {getTrendIcon()}
              <span>{change !== undefined && change > 0 ? '+' : ''}{change}%</span>
              {changeLabel && <span className="text-slate-500 ml-1">{changeLabel}</span>}
            </div>
          }
        </div>
        {Icon &&
        <div className="bg-transparent hover:bg-[#d4af37] p-3 rounded-xl transition-colors group">
            <Icon className="text-[#d4af37] group-hover:text-[#1a1a1a] lucide lucide-users w-6 h-6 transition-colors" />
          </div>
        }
      </div>
    </Card>);

}