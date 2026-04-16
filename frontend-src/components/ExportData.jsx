import { useState } from 'react';
import { api } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

const ENTITIES = [
  'Workspace', 'WorkspaceMember', 'Brand', 'SocialAccount', 'Post',
  'Campaign', 'Conversation', 'Contact', 'MediaAsset', 'Automation',
  'Analytics', 'SavedReply', 'BrandDeal', 'Revenue', 'Mention',
  'KeywordTrack', 'CompetitorTrack', 'TrendAnalysis', 'TeamTask',
  'TeamDiscussion', 'Integration', 'Subscription', 'ClientReport', 'ContentTemplate'
];

const toCSV = (data) => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};

const downloadCSV = (name, csv) => {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function ExportData() {
  const [sqlLoading, setSqlLoading] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const updateStatus = (name, status) =>
    setStatuses(prev => ({ ...prev, [name]: status }));

  const exportSQL = async () => {
    setSqlLoading(true);
    const response = await api.functions.invoke('exportToSQL', {});
    const blob = new Blob([response.data], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_social_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
    URL.revokeObjectURL(url);
    setSqlLoading(false);
  };

  const exportAll = async () => {
    setRunning(true);
    setDone(false);
    setStatuses({});

    for (const name of ENTITIES) {
      updateStatus(name, 'loading');
      try {
        const data = await api.entities[name].list();
        if (data && data.length > 0) {
          downloadCSV(name, toCSV(data));
          updateStatus(name, 'done');
        } else {
          updateStatus(name, 'empty');
        }
      } catch {
        updateStatus(name, 'error');
      }
      await new Promise(r => setTimeout(r, 300));
    }

    setRunning(false);
    setDone(true);
  };

  const completed = Object.values(statuses).filter(s => s === 'done' || s === 'empty').length;
  const progress = Math.round((completed / ENTITIES.length) * 100);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Export All Data</h1>
        <p className="text-slate-500 text-sm">تمام tables CSV format میں download ہو جائیں گے۔</p>
      </div>

      <Button
        onClick={exportAll}
        disabled={running}
        className="mb-4 gap-2"
        style={{ backgroundColor: '#d4af37', color: '#1a1a1a' }}
      >
        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {running ? 'Exporting...' : 'Export All Tables'}
      </Button>

      <Button
        onClick={exportSQL}
        disabled={sqlLoading}
        variant="outline"
        className="mb-6 gap-2"
      >
        {sqlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
        {sqlLoading ? 'Generating SQL...' : 'Export as SQL File'}
      </Button>

      {running && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>{completed} / {ENTITIES.length} tables</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {done && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
          ✅ Export مکمل ہو گیا! تمام files download ہو گئی ہیں۔
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {ENTITIES.map(name => {
          const s = statuses[name];
          return (
            <div key={name} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm text-slate-700 font-medium">{name}</span>
              {s === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              {s === 'done' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {s === 'empty' && <Badge variant="secondary" className="text-[10px]">Empty</Badge>}
              {s === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}