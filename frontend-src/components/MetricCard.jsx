import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function MetricCard({
  title,
  value,
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  iconColor = 'text-violet-600',
  iconBg = 'bg-violet-50',
  description,
  sparklineData,
  className
}) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0 || change === undefined;

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <Card className={cn("group hover:shadow-lg transition-all duration-300", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500">{title}</span>
            {description && (
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {Icon && (
            <div className={cn("p-2.5 rounded-xl transition-transform group-hover:scale-110", iconBg)}>
              <Icon className={cn("w-5 h-5", iconColor)} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-slate-900 tracking-tight">
            {formatValue(value)}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center gap-2">
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                isPositive && "bg-emerald-50 text-emerald-700",
                isNegative && "bg-red-50 text-red-700",
                isNeutral && "bg-slate-100 text-slate-600"
              )}>
                {isPositive && <TrendingUp className="w-3 h-3" />}
                {isNegative && <TrendingDown className="w-3 h-3" />}
                {isNeutral && <Minus className="w-3 h-3" />}
                <span>{isPositive ? '+' : ''}{change}%</span>
              </div>
              <span className="text-xs text-slate-500">{changeLabel}</span>
            </div>
          )}
        </div>

        {/* Mini Sparkline */}
        {sparklineData && (
          <div className="mt-4 h-12">
            <svg className="w-full h-full" viewBox="0 0 100 40">
              <defs>
                <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(212, 175, 55)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(212, 175, 55)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 ${40 - sparklineData[0]} ${sparklineData.map((d, i) => 
                  `L ${(i / (sparklineData.length - 1)) * 100} ${40 - d}`
                ).join(' ')} L 100 40 L 0 40 Z`}
                fill={`url(#gradient-${title})`}
              />
              <path
                d={`M 0 ${40 - sparklineData[0]} ${sparklineData.map((d, i) => 
                  `L ${(i / (sparklineData.length - 1)) * 100} ${40 - d}`
                ).join(' ')}`}
                fill="none"
                stroke="rgb(212, 175, 55)"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}
      </CardContent>
      </Card>
      );
      }