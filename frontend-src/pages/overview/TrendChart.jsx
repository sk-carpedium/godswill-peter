import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import moment from 'moment';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-500 capitalize">{p.name}</span>
          </div>
          <span className="font-medium text-slate-800">{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

const METRICS = [
  { key: 'reach', label: 'Reach', color: '#d4af37' },
  { key: 'engagement', label: 'Engagement', color: '#8b5cf6' },
  { key: 'followers', label: 'Followers', color: '#10b981' },
];

export default function TrendChart({ analytics = [] }) {
  const [activeMetric, setActiveMetric] = useState('reach');

  // Build 30-day chart data from analytics records
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const date = moment().subtract(29 - i, 'days');
    const dateStr = date.format('YYYY-MM-DD');
    const dayRecords = analytics.filter(a => a.date?.startsWith(dateStr));
    return {
      date: date.format('MMM D'),
      reach: dayRecords.reduce((s, a) => s + (a.metrics?.reach || 0), 0),
      engagement: dayRecords.reduce((s, a) => s + (a.metrics?.engagement || 0), 0),
      followers: dayRecords.reduce((s, a) => s + (a.audience?.total_followers || 0), 0),
    };
  });

  const metric = METRICS.find(m => m.key === activeMetric);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold">30-Day Trend</CardTitle>
          <Tabs value={activeMetric} onValueChange={setActiveMetric}>
            <TabsList className="h-8">
              {METRICS.map(m => (
                <TabsTrigger key={m.key} value={m.key} className="text-xs px-3">{m.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                interval={4}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metric.color}
                strokeWidth={2}
                fill="url(#trendGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}