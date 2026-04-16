import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';

export default function TaskAssignment() {
  const { workspaceId } = useWorkspace();
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => api.entities.WorkspaceMember.list({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });
  const { data: posts = [] } = useQuery({
    queryKey: ['pending-posts', workspaceId],
    queryFn: () => api.entities.Post.filter({ workspace_id: workspaceId, status: 'pending_approval', sort: '-created_at', limit: 10 }),
    enabled: !!workspaceId,
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="w-4 h-4 text-[#d4af37]" />Team Assignments</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-32 w-full" /> : (
          <div className="space-y-3">
            <div className="text-sm text-slate-600 mb-4">
              <span className="font-medium">{posts.length}</span> posts pending review
              <span className="mx-2">·</span>
              <span className="font-medium">{members.length}</span> team members
            </div>
            {members.slice(0, 6).map(m => {
              const memberPosts = posts.filter(p => p.assigned_to === m.user_id || p.created_by === m.user_email);
              return (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 flex items-center justify-center text-[#d4af37] font-bold text-xs">
                      {(m.user_email||'?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{m.user_email}</p>
                      <Badge variant="secondary" className="text-xs capitalize">{m.role}</Badge>
                    </div>
                  </div>
                  <Badge variant={memberPosts.length > 0 ? 'default' : 'secondary'} className={memberPosts.length > 0 ? 'bg-amber-100 text-amber-700' : ''}>
                    {memberPosts.length} pending
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
