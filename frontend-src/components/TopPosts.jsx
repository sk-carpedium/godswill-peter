/**
 * TopPosts.jsx — FIXED
 * Was: hardcoded samplePosts with thumbnail URLs from Unsplash
 * Now: fetches real top-performing posts from GET /posts?sort=-engagement_rate
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageCircle, Share2, Eye, TrendingUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useTopPosts } from '@/hooks';

const PLATFORM_COLORS = {
  instagram:'from-purple-500 to-pink-500', facebook:'from-blue-500 to-blue-600',
  twitter:'from-slate-700 to-slate-900',   linkedin:'from-blue-600 to-blue-800',
  youtube:'from-red-500 to-red-600',        tiktok:'from-slate-800 to-slate-900',
};

const fmt = n => { if (!n) return '0'; return n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':String(n); };

export default function TopPosts({ limit = 5 }) {
  const { data: posts = [], isLoading } = useTopPosts(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!posts.length) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-lg">Top Performing Posts</CardTitle></CardHeader>
        <CardContent><p className="text-center py-8 text-slate-500 text-sm">No published posts yet</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Top Performing Posts</CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post, index) => {
          const platform = post.platforms?.[0]?.platform || 'instagram';
          const metrics  = post.metrics || {};
          const engRate  = post.engagement_rate || post.ai_analysis?.engagement_prediction || 0;

          return (
            <div key={post.id} className="group p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex gap-4">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                  index===0?"bg-amber-100 text-amber-700":index===1?"bg-slate-200 text-slate-700":"bg-orange-100 text-orange-700")}>
                  #{index+1}
                </div>
                {post.thumbnail_url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className={cn("w-16 h-16 rounded-lg bg-gradient-to-br flex items-center justify-center text-white font-bold shrink-0", PLATFORM_COLORS[platform])}>
                    {platform[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm text-slate-700 line-clamp-2">{post.content?.text || post.title || 'No content'}</p>
                    <Button variant="ghost" size="icon" className="w-8 h-8 shrink-0 opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{fmt(metrics.likes)}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{fmt(metrics.comments)}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-4 h-4" />{fmt(metrics.shares)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{fmt(metrics.reach)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {engRate > 0 && (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                        <TrendingUp className="w-3 h-3 mr-1" />{typeof engRate === 'number' ? engRate.toFixed(1) : engRate}% engagement
                      </Badge>
                    )}
                    <span className="text-xs text-slate-400">{moment(post.created_at || post.schedule?.scheduled_at).fromNow()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
