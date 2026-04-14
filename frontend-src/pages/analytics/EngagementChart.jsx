/**
 * EngagementChart.jsx — FIXED
 * Now: fetches real 7-day engagement data from GET /analytics?period=7d
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download } from 'lucide-react';
import { useEngagementData } from '@/hooks';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-slate-600 capitalize">{entry.name}</span>
            </div>
            <span className="text-sm font-medium">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function EngagementChart({ period = '7d' }) {
  const [chartType, setChartType] = useState('area');
  const [metric,    setMetric]    = useState('all');

  const { data = [], isLoading } = useEngagementData(period);

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
      </Card>
    );
  }

  const legend = [
    { key: 'likes',    color: '#8b5cf6', label: 'Likes'    },
    { key: 'comments', color: '#06b6d4', label: 'Comments' },
    { key: 'shares',   color: '#f59e0b', label: 'Shares'   },
    { key: 'saves',    color: '#10b981', label: 'Saves'    },
  ];

  const show = (key) => metric === 'all' || metric === key;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Engagement Breakdown</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={chartType} onValueChange={setChartType}>
              <TabsList className="h-8">
                <TabsTrigger value="area" className="text-xs">Area</TabsTrigger>
                <TabsTrigger value="bar"  className="text-xs">Bar</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {legend.map(item => (
            <button
              key={item.key}
              onClick={() => setMetric(metric === item.key ? 'all' : item.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all ${metric === item.key || metric === 'all' ? 'bg-slate-100' : 'opacity-50'}`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {legend.map(l => (
                    <linearGradient key={l.key} id={`color-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={l.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={l.color} stopOpacity={0}   />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                {legend.map(l => show(l.key) && (
                  <Area key={l.key} type="monotone" dataKey={l.key} stroke={l.color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${l.key})`} />
                ))}
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip />} />
                {legend.map(l => show(l.key) && (
                  <Bar key={l.key} dataKey={l.key} fill={l.color} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
