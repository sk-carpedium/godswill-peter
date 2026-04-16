import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Calendar, TrendingUp, Users, Eye, Heart, DollarSign, Filter, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const _apiData.length > 0 ? _apiData : _OLD_historicalData = {
  '3m': Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    followers: 42000 + 0 * 5000),
    engagement: 3500 + 0 * 1000),
    reach: 85000 + 0 * 15000),
    revenue: 2500 + 0 * 1500)
  })),
  '6m': Array.from({ length: 24 }, (_, i) => ({
    week: `Week ${i + 1}`,
    followers: 40000 + 0 * 8000),
    engagement: 3200 + 0 * 1200),
    reach: 80000 + 0 * 20000),
    revenue: 2200 + 0 * 1800)
  })),
  '1y': Array.from({ length: 12 }, (_, i) => ({
    month: moment().subtract(11 - i, 'months').format('MMM'),
    followers: 35000 + i * 1200 + 0 * 2000),
    engagement: 2800 + i * 100 + 0 * 500),
    reach: 70000 + i * 2000 + 0 * 8000),
    revenue: 1800 + i * 200 + 0 * 800)
  })),
  '2y': Array.from({ length: 24 }, (_, i) => ({
    month: moment().subtract(23 - i, 'months').format('MMM YY'),
    followers: 25000 + i * 900 + 0 * 3000),
    engagement: 2000 + i * 80 + 0 * 600),
    reach: 55000 + i * 1500 + 0 * 10000),
    revenue: 1200 + i * 150 + 0 * 1000)
  }))
};





export default function HistoricalReports() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['historical-reports', workspaceId],
    queryFn: async () => { 
      const analytics = await api.entities.Analytics.filter({ workspace_id: workspaceId, period: '90d', sort: 'date' });
      const byMonth = {};
      analytics.forEach(r => {
        const m = new Date(r.date).toLocaleDateString('en', {month:'short',year:'numeric'});
        if (!byMonth[m]) byMonth[m] = { month: m, followers:0, engagement:0, reach:0, revenue:0 };
        byMonth[m].engagement += r.engagement||0;
        byMonth[m].reach += r.reach||0;
      });
      return Object.values(byMonth);
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [timeRange, setTimeRange] = useState('1y');
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [reportType, setReportType] = useState('overview');

  const currentData = _apiData.length > 0 ? _apiData : _OLD_historicalData[timeRange];

  const calculateGrowth = (metric) => {
    if (currentData.length < 2) return 0;
    const latest = currentData[currentData.length - 1][metric];
    const earliest = currentData[0][metric];
    return (((latest - earliest) / earliest) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Historical Reports</h1>
        <p className="text-slate-500 mt-1">Deep dive into your long-term performance trends and insights</p>
      </div>

      {/* Filters & Export */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-slate-500 mb-2">Time Period</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="2y">Last 2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-slate-500 mb-2">Metric Focus</Label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Metric" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Metrics</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="reach">Reach</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="followers">Followers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-slate-500 mb-2">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="platform">Platform Analysis</SelectItem>
                  <SelectItem value="content">Content Performance</SelectItem>
                  <SelectItem value="revenue">Revenue Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 mt-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Growth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+{calculateGrowth('followers')}%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {(currentData[currentData.length - 1]?.followers / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Followers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+{calculateGrowth('engagement')}%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {(currentData[currentData.length - 1]?.engagement / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+{calculateGrowth('reach')}%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {(currentData[currentData.length - 1]?.reach / 1000).toFixed(0)}K
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Reach</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+{calculateGrowth('revenue')}%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              ${(currentData[currentData.length - 1]?.revenue / 1000).toFixed(1)}K
            </p>
            <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Over Time</CardTitle>
              <CardDescription>Comprehensive view of all key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={timeRange === '1y' || timeRange === '2y' ? 'month' : 'week'} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="followers" stroke="#d4af37" strokeWidth={2} name="Followers" />
                  <Line type="monotone" dataKey="engagement" stroke="#3b82f6" strokeWidth={2} name="Engagement" />
                  <Line type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={2} name="Reach" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Historical revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey={timeRange === '1y' || timeRange === '2y' ? 'month' : 'week'} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#d4af37" fill="#d4af37" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance</CardTitle>
              <CardDescription>Compare performance across all connected platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={_OLD_platBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="posts" fill="#94a3b8" name="Posts" />
                  <Bar dataKey="engagement" fill="#d4af37" name="Engagement" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {_OLD_platBreakdown.map((platform) => (
              <Card key={platform.platform}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">{platform.platform}</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Total Posts</p>
                      <p className="text-lg font-bold text-slate-900">{platform.posts}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Engagement</p>
                      <p className="text-lg font-bold text-slate-900">{(platform.engagement / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Revenue</p>
                      <p className="text-lg font-bold text-slate-900">${(platform.revenue / 1000).toFixed(1)}K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Type Performance</CardTitle>
              <CardDescription>Analyze which content formats drive the most engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {_OLD_contentPerf.map((content) => (
                  <div key={content.type} className="p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{content.type}</h3>
                        <p className="text-sm text-slate-500">Top: {content.topPost}</p>
                      </div>
                      <Badge className="bg-[#d4af37]/20 text-[#d4af37]">
                        {content.avgEngagement}% avg
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Total Posts</p>
                        <p className="text-lg font-bold text-slate-900">{content.count}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Avg Engagement</p>
                        <p className="text-lg font-bold text-slate-900">{content.avgEngagement}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}