import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/** Fallback when the parent does not pass `data` (e.g. loading or empty API). */
const sampleData = [
  { date: 'Mon', engagement: 2400, reach: 4000, impressions: 6000 },
  { date: 'Tue', engagement: 1398, reach: 3000, impressions: 4800 },
  { date: 'Wed', engagement: 9800, reach: 12000, impressions: 15000 },
  { date: 'Thu', engagement: 3908, reach: 5000, impressions: 7200 },
  { date: 'Fri', engagement: 4800, reach: 6200, impressions: 8500 },
  { date: 'Sat', engagement: 3800, reach: 4800, impressions: 6100 },
  { date: 'Sun', engagement: 4300, reach: 5500, impressions: 7800 },
];

export default function PerformanceChart({ data = sampleData, title = "Performance Overview" }) {
  const [metric, setMetric] = React.useState('engagement');

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {payload.map((entry, index) =>
          <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          )}
        </div>);

    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <Tabs value={metric} onValueChange={setMetric}>
          <TabsList className="h-8">
            <TabsTrigger value="engagement" className="hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">Engagement</TabsTrigger>
            <TabsTrigger value="reach" className="hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">Reach</TabsTrigger>
            <TabsTrigger value="impressions" className="hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">Impressions</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} className="bg-slate-50 recharts-surface">
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }} />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />

              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#d4af37"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorMetric)" />

            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);

}