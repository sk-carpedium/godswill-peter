import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Target,
  CheckCircle2,
  Eye,
  Heart,
  MousePointerClick,
  ShoppingCart,
  Calendar,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DealPerformance({ deal }) {
  if (!deal) {
    return (
      <Card className="py-12">
        <div className="text-center text-slate-500">
          <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>Select a deal to view performance details</p>
        </div>
      </Card>
    );
  }

  const { performance = {}, deliverables = {}, payment_structure = {}, kpis = {} } = deal;

  const completionRate = (() => {
    const total = (deliverables.posts_required || 0) + 
                  (deliverables.stories_required || 0) + 
                  (deliverables.reels_required || 0);
    const completed = (deliverables.posts_completed || 0) + 
                      (deliverables.stories_completed || 0) + 
                      (deliverables.reels_completed || 0);
    return total > 0 ? (completed / total) * 100 : 0;
  })();

  const metrics = [
    {
      label: 'Total Reach',
      value: performance.total_reach || 0,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      format: (v) => `${(v / 1000).toFixed(0)}K`
    },
    {
      label: 'Engagement',
      value: performance.total_engagement || 0,
      icon: Heart,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      format: (v) => `${(v / 1000).toFixed(1)}K`
    },
    {
      label: 'Clicks',
      value: performance.total_clicks || 0,
      icon: MousePointerClick,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      format: (v) => v.toLocaleString()
    },
    {
      label: 'Conversions',
      value: performance.total_conversions || 0,
      icon: ShoppingCart,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      format: (v) => v.toLocaleString()
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-violet-100 text-violet-600 text-lg">
                {deal.brand_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{deal.brand_name}</CardTitle>
              <p className="text-sm text-slate-500 capitalize">
                {deal.deal_type?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Revenue Progress */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">Revenue Generated</span>
            </div>
            <Badge className="bg-emerald-600">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {((performance.revenue_generated / deal.contract_value) * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl font-bold text-emerald-900">
              ${performance.revenue_generated?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-emerald-700">
              / ${deal.contract_value?.toLocaleString()}
            </p>
          </div>
          <Progress 
            value={(performance.revenue_generated / deal.contract_value) * 100} 
            className="h-2 bg-emerald-200"
          />
        </div>

        {/* Deliverables */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-700">Deliverables</h4>
            <span className="text-sm text-slate-500">{Math.round(completionRate)}% complete</span>
          </div>
          <div className="space-y-3">
            {deliverables.posts_required > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">Posts</span>
                  <span className="font-medium">
                    {deliverables.posts_completed}/{deliverables.posts_required}
                  </span>
                </div>
                <Progress 
                  value={(deliverables.posts_completed / deliverables.posts_required) * 100} 
                  className="h-1.5"
                />
              </div>
            )}
            {deliverables.stories_required > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">Stories</span>
                  <span className="font-medium">
                    {deliverables.stories_completed}/{deliverables.stories_required}
                  </span>
                </div>
                <Progress 
                  value={(deliverables.stories_completed / deliverables.stories_required) * 100} 
                  className="h-1.5"
                />
              </div>
            )}
            {deliverables.reels_required > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">Reels</span>
                  <span className="font-medium">
                    {deliverables.reels_completed}/{deliverables.reels_required}
                  </span>
                </div>
                <Progress 
                  value={(deliverables.reels_completed / deliverables.reels_required) * 100} 
                  className="h-1.5"
                />
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3">Performance Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <div key={metric.label} className={cn("p-3 rounded-lg", metric.bg)}>
                <div className="flex items-center gap-2 mb-2">
                  <metric.icon className={cn("w-4 h-4", metric.color)} />
                  <span className="text-xs text-slate-600">{metric.label}</span>
                </div>
                <p className={cn("text-xl font-bold", metric.color)}>
                  {metric.format(metric.value)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Structure */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Payment Structure</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Type</span>
              <Badge variant="secondary" className="capitalize">
                {payment_structure.type?.replace(/_/g, ' ')}
              </Badge>
            </div>
            {payment_structure.base_amount && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Base Amount</span>
                <span className="font-medium">${payment_structure.base_amount.toLocaleString()}</span>
              </div>
            )}
            {payment_structure.commission_rate && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Commission Rate</span>
                <span className="font-medium">{payment_structure.commission_rate}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}