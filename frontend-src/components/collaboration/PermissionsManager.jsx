import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';
import { toast } from 'sonner';

const PERMISSIONS = [
  { key: 'can_publish',      label: 'Publish Posts' },
  { key: 'can_approve',      label: 'Approve Posts' },
  { key: 'can_delete',       label: 'Delete Posts' },
  { key: 'can_manage_team',  label: 'Manage Team' },
];

export default function PermissionsManager() {
  const { workspaceId } = useWorkspace();
  const qc = useQueryClient();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => api.entities.WorkspaceMember.list({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
  });

  const update = useMutation({
    mutationFn: ({ id, permissions }) => api.entities.WorkspaceMember.update(id, { permissions }),
    onSuccess: () => { toast.success('Permissions updated'); qc.invalidateQueries({ queryKey: ['workspace-members'] }); },
    onError: e => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Shield className="w-4 h-4 text-[#d4af37]" />Permissions</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-48 w-full" /> : (
          <div className="space-y-4">
            {members.filter(m => m.role !== 'owner' && m.role !== 'admin').map(member => {
              const perms = member.permissions || {};
              return (
                <div key={member.id} className="p-4 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm text-slate-900">{member.user_email}</p>
                    <Badge variant="secondary" className="capitalize">{member.role}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {PERMISSIONS.map(p => (
                      <div key={p.key} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">{p.label}</span>
                        <Switch
                          checked={!!perms[p.key]}
                          onCheckedChange={val => update.mutate({ id: member.id, permissions: { ...perms, [p.key]: val } })}
                          disabled={update.isPending}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {members.filter(m => m.role !== 'owner' && m.role !== 'admin').length === 0 && (
              <p className="text-center text-sm text-slate-500 py-6">No members to configure permissions for</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
