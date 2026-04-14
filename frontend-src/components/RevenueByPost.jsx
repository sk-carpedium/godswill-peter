import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const platformColors = {
  instagram: 'from-purple-500 to-pink-500',
  facebook: 'from-blue-500 to-blue-600',
  twitter: 'from-slate-700 to-slate-900',
  linkedin: 'from-blue-600 to-blue-800',
  youtube: 'from-red-500 to-red-600',
  tiktok: 'from-slate-800 to-slate-900',
};

export default function RevenueByPost({ posts = [] }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['revenue-by-post', workspaceId],
    queryFn: async () => { 
      const [revenues, posts] = await Promise.all([
        base44.entities.Revenue.filter({ workspace_id: workspaceId, period: '30d' }),
        base44.entities.Post.filter({ workspace_id: workspaceId, status: 'published', sort: '-created_at', limit: 50 }),
      ]);
      return posts.map(p => ({
        ...p,
        revenue: revenues.filter(r => r.post_id===p.id).reduce((s,r)=>s+(r.amount||0),0),
      })).filter(p => p.revenue > 0).sort((a,b) => b.revenue - a.revenue);
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const samplePosts = posts.length > 0 ? posts : [
    {
      id: '1',
      title: 'Product Review - Tech Gadget',
      platform: 'instagram',
      published_at: '2024-07-18',
      monetization: { actual_revenue: 450, revenue_source: 'Sponsored Post' },
      metrics: { reach: 45000, engagement: 3200, clicks: 890 },
      profitability_analysis: { profitability_score: 92 },
      roi: 225
    },
    {
      id: '2',
      title: 'Summer Fashion Haul',
      platform: 'youtube',
      published_at: '2024-07-17',
      monetization: { actual_revenue: 380, revenue_source: 'Affiliate + Ads' },
      metrics: { reach: 28000, engagement: 2100, clicks: 560 },
      profitability_analysis: { profitability_score: 88 },
      roi: 190
    },
    {
      id: '3',
      title: 'Productivity Tips Thread',
      platform: 'twitter',
      published_at: '2024-07-16',
      monetization: { actual_revenue: 125, revenue_source: 'Affiliate Links' },
      metrics: { reach: 18000, engagement: 1450, clicks: 320 },
      profitability_analysis: { profitability_score: 76 },
      roi: 160
    },
    {
      id: '4',
      title: 'Workout Routine Video',
      platform: 'tiktok',
      published_at: '2024-07-15',
      monetization: { actual_revenue: 95, revenue_source: 'Platform Creator Fund' },
      metrics: { reach: 62000, engagement: 5200, clicks: 450 },
      profitability_analysis: { profitability_score: 71 },
      roi: 95
    },
  ];

  // Sort by revenue
  const sortedPosts = [...samplePosts].sort((a, b) => 
    (b.monetization?.actual_revenue || 0) - (a.monetization?.actual_revenue || 0)
  );

  const totalRevenue = sortedPosts.reduce((sum, post) => 
    sum + (post.monetization?.actual_revenue || 0), 0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Top Earning Posts</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            ${totalRevenue.toFixed(0)} total revenue from {sortedPosts.length} posts
          </p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedPosts.map((post, index) => {
            const revenue = post.monetization?.actual_revenue || 0;
            const profitScore = post.profitability_analysis?.profitability_score || 0;
            const roi = post.roi || 0;
            
            return (
              <div
                key={post.id}
                className="group p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  {/* Rank & Platform */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 ? "bg-amber-100 text-amber-700" :
                      index === 1 ? "bg-slate-200 text-slate-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-slate-100 text-slate-600"
                    )}>
                      #{index + 1}
                    </div>
                    <Avatar className={cn(
                      "h-8 w-8 bg-gradient-to-br",
                      platformColors[post.platform]
                    )}>
                      <AvatarFallback className="bg-transparent text-white text-xs font-bold">
                        {post.platform.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 line-clamp-1">
                          {post.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {moment(post.published_at).format('MMM D, YYYY')} • {post.monetization?.revenue_source}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Revenue & ROI */}
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">
                          ${revenue.toFixed(0)}
                        </p>
                        <p className="text-xs text-slate-500">Revenue</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {roi > 0 ? (
                          <>
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-600">
                              {roi}% ROI
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-600">
                              {Math.abs(roi)}% Loss
                            </span>
                          </>
                        )}
                      </div>
                      <Badge variant="secondary" className={cn(
                        profitScore >= 80 ? "bg-emerald-100 text-emerald-700" :
                        profitScore >= 60 ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        Score: {profitScore}
                      </Badge>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {(post.metrics?.reach / 1000).toFixed(0)}K
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {(post.metrics?.engagement / 1000).toFixed(1)}K
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        {post.metrics?.clicks || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}