import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';
import moment from 'moment';

export default function TeamNotifications() {
  const { workspaceId } = useWorkspace();
  const qc = useQueryClient();

  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ['notifications', workspaceId],
    queryFn: () => base44.entities.Mention.filter({ workspace_id: workspaceId, status: 'new', sort: '-mentioned_at', limit: 20 }),
    enabled: !!workspaceId, refetchInterval: 30000,
  });

  const markAll = useMutation({
    mutationFn: () => Promise.all(notifs.map(n => base44.entities.Mention.update(n.id, { status: 'reviewed' }))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="w-4 h-4 text-[#d4af37]" />Notifications {notifs.length > 0 && <Badge className="bg-red-500 text-white">{notifs.length}</Badge>}</CardTitle>
          {notifs.length > 0 && <Button size="sm" variant="ghost" onClick={() => markAll.mutate()}><CheckCheck className="w-3 h-3 mr-1" />Mark all read</Button>}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? [...Array(3)].map((_,i) => <Skeleton key={i} className="h-12 w-full" />) :
        notifs.length === 0 ? <p className="text-center py-6 text-sm text-slate-500">All caught up!</p> :
        notifs.slice(0, 10).map(n => (
          <div key={n.id} className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-blue-50/50">
            <Badge className={'text-xs ' + (n.sentiment==='negative'?'bg-red-100 text-red-700':n.sentiment==='positive'?'bg-green-100 text-green-700':'bg-slate-100 text-slate-700')}>{n.sentiment||'neutral'}</Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 truncate">{n.content}</p>
              <span className="text-xs text-slate-400">{moment(n.mentioned_at).fromNow()} · {n.platform}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
