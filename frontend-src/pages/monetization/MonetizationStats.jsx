import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MonetizationStats({ 
  title, 
  value, 
  change, 
  changeLabel = 'vs last period',
  icon: Icon,
  iconColor = 'text-emerald-600',
  iconBg = 'bg-emerald-50',
  prefix = '$',
  suffix = '',
  breakdown,
  className 
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0 || change === undefined;

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="text-sm font-medium text-slate-500">{title}</span>
          {Icon && (
            <div className={cn("p-2.5 rounded-xl", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-2xl font-bold text-slate-900">{prefix}</span>}
            <p className="text-3xl font-bold text-slate-900 tracking-tight">
              {formatValue(value)}
            </p>
            {suffix && <span className="text-lg font-medium text-slate-500">{suffix}</span>}
          </div>
          
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                isPositive && "bg-emerald-50 text-emerald-700",
                isNegative && "bg-red-50 text-red-700",
                isNeutral && "bg-slate-100 text-slate-600"
              )}>
                {isPositive && <ArrowUpRight className="w-3 h-3" />}
                {isNegative && <ArrowDownRight className="w-3 h-3" />}
                {isNeutral && <Minus className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{change}%</span>
              </div>
              <span className="text-xs text-slate-500">{changeLabel}</span>
            </div>
          )}

          {breakdown && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              {breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="font-medium">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}