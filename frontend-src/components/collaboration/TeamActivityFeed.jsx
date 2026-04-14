import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';
import moment from 'moment';

export default function TeamActivityFeed() {
  const { workspaceId } = useWorkspace();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['team-activity', workspaceId],
    queryFn: () => base44.entities.Post.filter({ workspace_id: workspaceId, sort: '-created_at', limit: 20 }),
    enabled: !!workspaceId, staleTime: 30000,
  });

  const activities = posts.map(p => ({
    id: p.id, user: p.created_by || 'Team',
    action: p.status === 'published' ? 'published a post' : p.status === 'scheduled' ? 'scheduled a post' : 'created a post',
    time: p.created_at, platform: p.platforms?.[0]?.platform,
    content: p.content?.text?.slice(0, 60) || 'No content',
  }));

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="w-4 h-4 text-[#d4af37]" />Team Activity</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? [...Array(4)].map((_,i) => <Skeleton key={i} className="h-14 w-full" />) :
        activities.length === 0 ? <p className="text-center py-6 text-sm text-slate-500">No activity yet</p> :
        activities.map(a => (
          <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-xs shrink-0">
              {(a.user||'?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900"><span className="font-medium">{a.user}</span> {a.action}</p>
              <p className="text-xs text-slate-500 truncate">{a.content}</p>
              <div className="flex items-center gap-2 mt-1">
                {a.platform && <Badge variant="secondary" className="text-xs capitalize">{a.platform}</Badge>}
                <span className="text-xs text-slate-400">{moment(a.time).fromNow()}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
