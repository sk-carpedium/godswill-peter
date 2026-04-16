import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';
import { toast } from 'sonner';

const SECTIONS = [
  { id: 'analytics',    label: 'Analytics Overview' },
  { id: 'posts',        label: 'Post Performance' },
  { id: 'engagement',   label: 'Engagement Metrics' },
  { id: 'revenue',      label: 'Revenue & Monetization' },
  { id: 'audience',     label: 'Audience Growth' },
  { id: 'competitors',  label: 'Competitor Benchmarks' },
];

export default function ReportBuilder({ onReportCreated }) {
  const { workspaceId } = useWorkspace();
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [sections, setSections] = useState(['analytics', 'posts', 'engagement']);

  const toggle = (id) => setSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const create = useMutation({
    mutationFn: () => api.entities.ClientReport.create({ workspace_id: workspaceId, report_name: name, client_email: email, metrics_included: sections, auto_send_enabled: !!email }),
    onSuccess: (r) => { toast.success('Report created!'); onReportCreated?.(r); setName(''); setEmail(''); },
    onError: e => toast.error(e.message),
  });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#d4af37]" />Build Report</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Report Name</Label><Input className="mt-1" placeholder="Monthly Performance" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label>Client Email (optional)</Label><Input className="mt-1" placeholder="client@example.com" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        </div>
        <div>
          <Label className="mb-2 block">Include Sections</Label>
          <div className="grid grid-cols-2 gap-2">
            {SECTIONS.map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <Checkbox id={s.id} checked={sections.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                <label htmlFor={s.id} className="text-sm text-slate-700 cursor-pointer">{s.label}</label>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={() => create.mutate()} disabled={!name || create.isPending} className="w-full bg-[#d4af37] text-slate-950">
          {create.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Report'}
        </Button>
      </CardContent>
    </Card>
  );
}
