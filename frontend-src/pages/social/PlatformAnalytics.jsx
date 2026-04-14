import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const data = Array.from({ length: 7 }, (_, i) => ({
  day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
  followers: 0, // real data via _apiData
  engagement: 0,
  reach: 0,
}));

export default function PlatformAnalytics({ platformName, platformColor = 'violet' }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['platform-analytics', workspaceId],
    queryFn: async () => { 
      const [accounts, analytics] = await Promise.all([
        base44.entities.SocialAccount.filter({ workspace_id: workspaceId, status: 'active' }),
        base44.entities.Analytics.filter({ workspace_id: workspaceId, period: '7d', sort: '-date' }),
      ]);
      return { accounts, analytics };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const stats = [
  { label: 'Followers', value: '45.2K', change: '+12.5%', icon: Users, trend: 'up' },
  { label: 'Reach', value: '128K', change: '+8.2%', icon: Eye, trend: 'up' },
  { label: 'Engagement', value: '9.8K', change: '-2.1%', icon: Heart, trend: 'down' },
  { label: 'Comments', value: '1.2K', change: '+15.3%', icon: MessageSquare, trend: 'up' }];


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) =>
        <Card key={i}>
            <CardContent className="p-2.5 rounded-xl transition-transform group-hover:scale-110 bg-[#d4af37]/10">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("w-5 h-5", `text-${platformColor}-600`)} />
                <div className={cn("flex items-center gap-1 text-sm", stat.trend === 'up' ? 'text-green-600' : 'text-red-600')}>
                  {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Follower Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="followers" stroke="#d4af37" fill="#d4af37" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="engagement" fill="#d4af37" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
            { title: 'Summer Collection Launch', engagement: '12.5K', reach: '45K', date: '2 days ago' },
            { title: 'Behind the Scenes', engagement: '8.2K', reach: '32K', date: '4 days ago' },
            { title: 'Customer Spotlight', engagement: '6.8K', reach: '28K', date: '1 week ago' }].
            map((post, i) =>
            <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{post.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{post.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{post.engagement} engagements</p>
                  <p className="text-xs text-slate-500">{post.reach} reach</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>);

}