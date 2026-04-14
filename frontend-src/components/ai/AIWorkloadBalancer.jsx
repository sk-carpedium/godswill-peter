import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';

export default function AIWorkloadBalancer() {
  const { workspaceId } = useWorkspace();
  const { data, isLoading } = useQuery({
    queryKey: ['ai-workload', workspaceId],
    queryFn: async () => {
      const [automations, pending] = await Promise.all([
        base44.entities.Automation.filter({ workspace_id: workspaceId, status: 'active' }),
        base44.entities.Post.filter({ workspace_id: workspaceId, status: 'pending_approval', limit: 50 }),
      ]);
      return { automations, pendingCount: pending.length, aiLoad: Math.min(100, (automations.length * 15) + (pending.length * 5)) };
    },
    enabled: !!workspaceId, staleTime: 60000,
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bot className="w-4 h-4 text-[#d4af37]" />AI Workload</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-24 w-full" /> : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">AI Utilisation</span>
                <span className="font-medium">{data?.aiLoad || 0}%</span>
              </div>
              <Progress value={data?.aiLoad || 0} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xl font-bold text-slate-900">{data?.automations?.length || 0}</p>
                <p className="text-xs text-slate-500">Active Automations</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-center">
                <p className="text-xl font-bold text-amber-700">{data?.pendingCount || 0}</p>
                <p className="text-xs text-slate-500">Pending Review</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 p-2 rounded">
              <Zap className="w-3 h-3 text-blue-500" />
              AI is managing {data?.automations?.length || 0} active workflows
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
