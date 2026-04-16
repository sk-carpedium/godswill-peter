import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Kanban, Clock, CheckCircle2, Circle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';

const COLS = [
  { id: 'pending_approval', label: 'To Review', icon: Circle, color: 'bg-amber-100 text-amber-700' },
  { id: 'scheduled',        label: 'Scheduled', icon: Clock,   color: 'bg-blue-100 text-blue-700' },
  { id: 'published',        label: 'Published', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
];

export default function TaskBoard() {
  const { workspaceId } = useWorkspace();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['task-board', workspaceId],
    queryFn: () => api.entities.Post.filter({ workspace_id: workspaceId, sort: '-created_at', limit: 30 }),
    enabled: !!workspaceId, staleTime: 30000,
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Kanban className="w-4 h-4 text-[#d4af37]" />Content Board</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-48 w-full" /> : (
          <div className="grid grid-cols-3 gap-4">
            {COLS.map(col => {
              const Icon = col.icon;
              const colPosts = posts.filter(p => p.status === col.id);
              return (
                <div key={col.id} className="space-y-2">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{col.label}</span>
                    <Badge className={'text-xs ' + col.color}>{colPosts.length}</Badge>
                  </div>
                  {colPosts.slice(0, 5).map(p => (
                    <div key={p.id} className="p-2 bg-white rounded border border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-700 line-clamp-2">{p.content?.text || 'No content'}</p>
                      {p.platforms?.[0] && <Badge variant="secondary" className="mt-1 text-xs capitalize">{p.platforms[0].platform}</Badge>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
