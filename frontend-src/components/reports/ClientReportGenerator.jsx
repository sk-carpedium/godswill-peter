import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2 } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';
import { toast } from 'sonner';
import moment from 'moment';

export default function ClientReportGenerator({ workspace, isClientView = false }) {
  const { workspaceId } = useWorkspace();
  const wid = workspace?.id || workspaceId;
  const [period, setPeriod] = useState('30d');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['client-reports', wid],
    queryFn: () => base44.entities.ClientReport.filter({ workspace_id: wid, sort: '-created_at', limit: 10 }),
    enabled: !!wid,
  });

  const generate = useMutation({
    mutationFn: () => base44.entities.ClientReport.generateAdhoc({ workspace_id: wid, period, include_analytics: true, include_posts: true }),
    onSuccess: () => { toast.success('Report generated!'); },
    onError: e => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base"><FileText className="w-4 h-4 text-[#d4af37]" />Reports</CardTitle>
          {!isClientView && (
            <div className="flex items-center gap-2">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-24 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="90d">90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" onClick={() => generate.mutate()} disabled={generate.isPending} className="bg-[#d4af37] text-slate-950 h-8">
                {generate.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                Generate
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? <p className="text-sm text-slate-500">Loading reports...</p> :
        reports.length === 0 ? <p className="text-center text-sm text-slate-500 py-6">No reports yet</p> :
        <div className="space-y-2">
          {reports.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-900">{r.report_name || 'Analytics Report'}</p>
                <p className="text-xs text-slate-500">{moment(r.created_at).format('MMM D, YYYY')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs capitalize">{r.status || 'ready'}</Badge>
                {r.file_url && <Button size="sm" variant="ghost" onClick={() => window.open(r.file_url)}><Download className="w-3 h-3" /></Button>}
              </div>
            </div>
          ))}
        </div>}
      </CardContent>
    </Card>
  );
}
