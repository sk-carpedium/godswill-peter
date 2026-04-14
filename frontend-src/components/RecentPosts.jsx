import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle } from
'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const platformColors = {
  facebook: 'bg-blue-100 text-blue-700',
  instagram: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700',
  twitter: 'bg-sky-100 text-sky-700',
  linkedin: 'bg-blue-100 text-blue-800',
  youtube: 'bg-red-100 text-red-700',
  tiktok: 'bg-slate-100 text-slate-900'
};

const statusConfig = {
  published: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Published' },
  scheduled: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Scheduled' },
  draft: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Draft' },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' }
};

export default function RecentPosts({ posts = [] }) {
  const samplePosts = posts.length > 0 ? posts : [
  {
    id: '1',
    content: { text: "🚀 Excited to announce our new AI-powered features! Transform your social media strategy with intelligent insights..." },
    platforms: [{ platform: 'instagram', status: 'published' }, { platform: 'twitter', status: 'published' }],
    status: 'published',
    schedule: { scheduled_at: new Date().toISOString() },
    ai_analysis: { engagement_prediction: 4500, reach_prediction: 12000 }
  },
  {
    id: '2',
    content: { text: "Behind the scenes of our latest product shoot 📸 #BrandLife #ContentCreation" },
    platforms: [{ platform: 'facebook', status: 'scheduled' }],
    status: 'scheduled',
    schedule: { scheduled_at: new Date(Date.now() + 86400000).toISOString() }
  },
  {
    id: '3',
    content: { text: "5 Tips for Growing Your Social Media Presence in 2024 - Thread 🧵" },
    platforms: [{ platform: 'twitter', status: 'published' }, { platform: 'linkedin', status: 'published' }],
    status: 'published',
    schedule: { scheduled_at: new Date(Date.now() - 172800000).toISOString() },
    ai_analysis: { engagement_prediction: 8200, reach_prediction: 25000 }
  }];


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Posts</CardTitle>
        <Button variant="ghost" size="sm" className="bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {samplePosts.map((post) => {
          const statusInfo = statusConfig[post.status] || statusConfig.draft;
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={post.id}
              className="group p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all bg-white">

              <div className="flex gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", statusInfo.bg, statusInfo.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </div>
                    <div className="flex gap-1">
                      {post.platforms?.map((p, i) =>
                      <Badge key={i} variant="secondary" className={cn("text-xs", platformColors[p.platform])}>
                          {p.platform}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 line-clamp-2 mb-3">
                    {post.content?.text || 'No content'}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {post.ai_analysis &&
                      <>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {post.ai_analysis.engagement_prediction?.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {post.ai_analysis.reach_prediction?.toLocaleString()}
                          </span>
                        </>
                      }
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {moment(post.schedule?.scheduled_at).fromNow()}
                      </span>
                    </div>
                    
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {post.media?.[0]?.thumbnail_url &&
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                    src={post.media[0].thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover" />

                  </div>
                }
              </div>
            </div>);

        })}
      </CardContent>
    </Card>);

}