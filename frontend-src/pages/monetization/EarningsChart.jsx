import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line } from
'recharts';
import { TrendingUp, Download } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry, index) =>
        <div key={index} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }} />

              <span className="text-sm text-slate-600 capitalize">{entry.name}</span>
            </div>
            <span className="text-sm font-medium">${entry.value.toFixed(0)}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 pt-2 mt-2 border-t border-slate-200">
          <span className="text-sm font-semibold text-slate-900">Total</span>
          <span className="text-sm font-bold text-violet-600">${total.toFixed(0)}</span>
        </div>
      </div>);

  }
  return null;
};

export default function EarningsChart({ data, period = '7d' }) {
  const [chartType, setChartType] = React.useState('area');

  // Generate sample data if not provided
  const sampleData = data || [
  { date: 'Mon', sponsored: 450, affiliate: 120, ads: 85, tips: 30 },
  { date: 'Tue', sponsored: 380, affiliate: 145, ads: 92, tips: 25 },
  { date: 'Wed', sponsored: 520, affiliate: 168, ads: 78, tips: 40 },
  { date: 'Thu', sponsored: 610, affiliate: 192, ads: 105, tips: 55 },
  { date: 'Fri', sponsored: 480, affiliate: 156, ads: 88, tips: 35 },
  { date: 'Sat', sponsored: 720, affiliate: 210, ads: 118, tips: 65 },
  { date: 'Sun', sponsored: 580, affiliate: 175, ads: 95, tips: 45 }];


  const totalRevenue = sampleData.reduce((sum, day) =>
  sum + day.sponsored + day.affiliate + day.ads + day.tips, 0
  );

  const growthRate = 23.5; // Calculate based on previous period

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg">Revenue Breakdown</CardTitle>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{growthRate}%
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Tabs value={chartType} onValueChange={setChartType}>
              <TabsList className="h-8">
                <TabsTrigger value="area" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">Area</TabsTrigger>
                <TabsTrigger value="bar" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">Bar</TabsTrigger>
                <TabsTrigger value="composed" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">Mixed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="flex items-baseline gap-2 mt-2">
          <p className="text-3xl font-bold text-slate-900">
            ${totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-slate-500">total revenue</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {[
          { key: 'sponsored', color: '#8b5cf6', label: 'Sponsored Posts' },
          { key: 'affiliate', color: '#06b6d4', label: 'Affiliate Income' },
          { key: 'ads', color: '#f59e0b', label: 'Ad Revenue' },
          { key: 'tips', color: '#10b981', label: 'Tips & Donations' }].
          map((item) =>
          <div key={item.key} className="flex items-center gap-2">
              <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }} />

              <span className="text-sm text-slate-600">{item.label}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ?
            <AreaChart data={sampleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSponsored" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAffiliate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                tickFormatter={(value) => `$${value}`} />

                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="sponsored" stackId="1" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorSponsored)" />
                <Area type="monotone" dataKey="affiliate" stackId="1" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorAffiliate)" />
                <Area type="monotone" dataKey="ads" stackId="1" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorAds)" />
                <Area type="monotone" dataKey="tips" stackId="1" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTips)" />
              </AreaChart> :
            chartType === 'bar' ?
            <BarChart data={sampleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                tickFormatter={(value) => `$${value}`} />

                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sponsored" stackId="stack" fill="#8b5cf6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="affiliate" stackId="stack" fill="#06b6d4" radius={[0, 0, 0, 0]} />
                <Bar dataKey="ads" stackId="stack" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="tips" stackId="stack" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart> :

            <ComposedChart data={sampleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                tickFormatter={(value) => `$${value}`} />

                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sponsored" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="affiliate" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="ads" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tips" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            }
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>);

}