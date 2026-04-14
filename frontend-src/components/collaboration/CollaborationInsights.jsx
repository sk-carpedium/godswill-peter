import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, TrendingUp, Users, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';

export default function CollaborationInsights() {
  const { workspaceId } = useWorkspace();
  const { data, isLoading } = useQuery({
    queryKey: ['collab-insights', workspaceId],
    queryFn: async () => {
      const [posts, members, analytics] = await Promise.all([
        base44.entities.Post.filter({ workspace_id: workspaceId, status: 'published', sort: '-created_at', limit: 20 }),
        base44.entities.WorkspaceMember.list({ workspace_id: workspaceId }),
        base44.entities.Analytics.filter({ workspace_id: workspaceId, period: '7d' }),
      ]);
      const totalEng = analytics.reduce((s,r) => s+(r.engagement||0), 0);
      const avgEng = analytics.length > 0 ? (totalEng / analytics.length) : 0;
      return { postsThisWeek: posts.filter(p => new Date(p.created_at) > new Date(Date.now()-7*864e5)).length, memberCount: members.length, avgEngagement: avgEng.toFixed(0), totalPosts: posts.length };
    },
    enabled: !!workspaceId, staleTime: 5*60*1000,
  });

  const insights = data ? [
    { icon: Calendar, label: 'Posts this week', value: data.postsThisWeek, color: 'text-blue-600' },
    { icon: Users, label: 'Team members', value: data.memberCount, color: 'text-purple-600' },
    { icon: TrendingUp, label: 'Avg engagement', value: data.avgEngagement, color: 'text-green-600' },
    { icon: Lightbulb, label: 'Total published', value: data.totalPosts, color: 'text-[#d4af37]' },
  ] : [];

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lightbulb className="w-4 h-4 text-[#d4af37]" />Team Insights</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-32 w-full" /> : (
          <div className="grid grid-cols-2 gap-4">
            {insights.map((ins, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <ins.icon className={'w-5 h-5 mb-2 ' + ins.color} />
                <p className="text-2xl font-bold text-slate-900">{ins.value}</p>
                <p className="text-xs text-slate-500 mt-1">{ins.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
