import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Briefcase,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  negotiating: 'bg-blue-100 text-blue-700',
  proposed: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-700',
};

const dealTypeLabels = {
  sponsored_post: 'Sponsored Post',
  affiliate: 'Affiliate',
  brand_ambassador: 'Brand Ambassador',
  product_placement: 'Product Placement',
};

export default function ActiveDeals({ deals = [] }) {
  const sampleDeals = deals.length > 0 ? deals : [
    {
      id: '1',
      brand_name: 'TechCorp',
      brand_logo_url: null,
      deal_type: 'brand_ambassador',
      status: 'active',
      contract_value: 15000,
      start_date: '2024-07-01',
      end_date: '2024-09-30',
      deliverables: { posts_required: 12, posts_completed: 7, stories_required: 20, stories_completed: 14 },
      performance: { revenue_generated: 8500, total_reach: 450000, total_engagement: 28000 }
    },
    {
      id: '2',
      brand_name: 'Fashion Brand',
      brand_logo_url: null,
      deal_type: 'sponsored_post',
      status: 'active',
      contract_value: 5000,
      start_date: '2024-07-15',
      end_date: '2024-08-15',
      deliverables: { posts_required: 4, posts_completed: 2, reels_required: 2, reels_completed: 1 },
      performance: { revenue_generated: 2500, total_reach: 180000, total_engagement: 12000 }
    },
    {
      id: '3',
      brand_name: 'Wellness Co',
      brand_logo_url: null,
      deal_type: 'affiliate',
      status: 'negotiating',
      contract_value: 8000,
      start_date: '2024-08-01',
      end_date: '2024-10-31',
      deliverables: { posts_required: 8, posts_completed: 0 }
    }
  ];

  const getCompletionPercentage = (deal) => {
    const { deliverables } = deal;
    const total = (deliverables.posts_required || 0) + 
                  (deliverables.stories_required || 0) + 
                  (deliverables.reels_required || 0);
    const completed = (deliverables.posts_completed || 0) + 
                      (deliverables.stories_completed || 0) + 
                      (deliverables.reels_completed || 0);
    return total > 0 ? (completed / total) * 100 : 0;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Active Brand Deals</CardTitle>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {sampleDeals.map((deal) => {
          const completion = getCompletionPercentage(deal);
          const daysRemaining = moment(deal.end_date).diff(moment(), 'days');
          
          return (
            <div 
              key={deal.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={deal.brand_logo_url} />
                    <AvatarFallback className="bg-violet-100 text-violet-600">
                      {deal.brand_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900">{deal.brand_name}</h4>
                      <Badge variant="secondary" className={statusColors[deal.status]}>
                        {deal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {dealTypeLabels[deal.deal_type] || deal.deal_type}
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Milestone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Contract Value & Progress */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xs">Contract Value</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    ${deal.contract_value.toLocaleString()}
                  </p>
                  {deal.performance?.revenue_generated > 0 && (
                    <p className="text-xs text-emerald-600 mt-1">
                      ${deal.performance.revenue_generated.toLocaleString()} earned
                    </p>
                  )}
                </div>
                
                <div className="p-3 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">Time Remaining</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {daysRemaining > 0 ? `${daysRemaining} days` : 'Ended'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Until {moment(deal.end_date).format('MMM D')}
                  </p>
                </div>
              </div>

              {/* Deliverables Progress */}
              {deal.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Deliverables Progress</span>
                    <span className="font-medium">{Math.round(completion)}%</span>
                  </div>
                  <Progress value={completion} className="h-2" />
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                    {deal.deliverables.posts_required > 0 && (
                      <span>
                        {deal.deliverables.posts_completed}/{deal.deliverables.posts_required} posts
                      </span>
                    )}
                    {deal.deliverables.stories_required > 0 && (
                      <span>
                        {deal.deliverables.stories_completed}/{deal.deliverables.stories_required} stories
                      </span>
                    )}
                    {deal.deliverables.reels_required > 0 && (
                      <span>
                        {deal.deliverables.reels_completed}/{deal.deliverables.reels_required} reels
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Metrics */}
              {deal.performance && deal.status === 'active' && (
                <div className="flex items-center gap-4 pt-3 mt-3 border-t border-slate-200 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>{(deal.performance.total_reach / 1000).toFixed(0)}K reach</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>{(deal.performance.total_engagement / 1000).toFixed(1)}K engagements</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}