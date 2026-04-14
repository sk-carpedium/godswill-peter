import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointer, 
  Heart,
  MessageCircle,
  Share2,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value.toLocaleString()}</p>
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 mt-2",
              trend === 'up' ? 'text-emerald-600' : 'text-red-600'
            )}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{Math.abs(change)}%</span>
              <span className="text-xs text-slate-500">vs last period</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-violet-100 rounded-lg">
          <Icon className="w-6 h-6 text-violet-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ClientAnalyticsDashboard({ analyticsData }) {
  const {
    total_reach = 0,
    total_engagement = 0,
    total_impressions = 0,
    total_clicks = 0,
    engagement_rate = 0,
    follower_growth = 0,
    platform_breakdown = {},
    top_posts = []
  } = analyticsData || {};

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Reach"
          value={total_reach}
          change={15.3}
          trend="up"
          icon={Users}
        />
        <MetricCard
          title="Engagement"
          value={total_engagement}
          change={8.7}
          trend="up"
          icon={Heart}
        />
        <MetricCard
          title="Impressions"
          value={total_impressions}
          change={12.1}
          trend="up"
          icon={Eye}
        />
        <MetricCard
          title="Clicks"
          value={total_clicks}
          change={-2.4}
          trend="down"
          icon={MousePointer}
        />
      </div>

      {/* Engagement Rate & Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-600">{engagement_rate}%</div>
            <p className="text-sm text-slate-600 mt-2">Above industry average of 3.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">+{follower_growth.toLocaleString()}</div>
            <p className="text-sm text-slate-600 mt-2">New followers this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(platform_breakdown).map(([platform, data]) => (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{platform}</span>
                    <span className="text-sm text-slate-600">{data.engagement_rate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
                      style={{ width: `${data.engagement_rate * 10}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top_posts.map((post, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.comments?.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Share2 className="w-3 h-3" />
                      {post.shares?.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Badge variant="secondary">#{index + 1}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}