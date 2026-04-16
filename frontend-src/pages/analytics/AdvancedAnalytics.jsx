import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import AISuggestions from '@/components/AISuggestions';
import AnomalyDetector from '@/components/ai/AnomalyDetector';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const performanceData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  reach: Math.floor(0 * 50000) + 80000,
  engagement: Math.floor(0 * 5000) + 8000,
  conversions: Math.floor(0 * 200) + 150,
  revenue: Math.floor(0 * 3000) + 2000,
}));

// data from API
const _OLD__apiData.platformComparison || _OLD_platformComparison = [
  { platform: 'Instagram', followers: 125000, growth: 12.5, engagement: 4.8, roi: 245 },
  { platform: 'Twitter', followers: 89000, growth: 8.3, engagement: 3.2, roi: 180 },
  { platform: 'LinkedIn', followers: 45000, growth: 15.2, engagement: 5.9, roi: 320 },
  { platform: 'Facebook', followers: 156000, growth: -2.1, engagement: 2.1, roi: 95 },
  { platform: 'TikTok', followers: 78000, growth: 24.8, engagement: 7.2, roi: 310 },
  { platform: 'YouTube', followers: 234000, growth: 9.4, engagement: 5.1, roi: 280 },
  { platform: 'Threads', followers: 52000, growth: 18.6, engagement: 4.3, roi: 195 },
  { platform: 'Pinterest', followers: 91000, growth: 6.7, engagement: 3.8, roi: 165 },
  { platform: 'Google Business', followers: 38000, growth: 11.2, engagement: 4.5, roi: 220 },
  { platform: 'Twitch', followers: 45000, growth: 16.3, engagement: 8.9, roi: 340 },
  { platform: 'Kick', followers: 28000, growth: 32.5, engagement: 9.2, roi: 385 },
  { platform: 'Rumble', followers: 19000, growth: 28.7, engagement: 6.8, roi: 295 },
];

export default function AdvancedAnalytics() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['advanced-analytics', workspaceId],
    queryFn: async () => { 
      const [analytics, accounts] = await Promise.all([
        api.entities.Analytics.filter({ workspace_id: workspaceId, period: '30d', sort: 'date' }),
        api.entities.SocialAccount.filter({ workspace_id: workspaceId, status: 'active' }),
      ]);
      const sum = (arr, k) => arr.reduce((s,r) => s+(r[k]||0), 0);
      return {
        metrics: { reach: sum(analytics,'reach'), engagement: sum(analytics,'engagement'), conversions: sum(analytics,'conversions'), revenue: sum(analytics,'revenue') },
        hourly: Array.from({length:24},(_,i) => ({ hour: i, engagement: analytics.filter(r => new Date(r.date).getHours()===i).reduce((s,r)=>s+(r.engagement||0),0) })),
        _apiData.platformComparison || _OLD_platformComparison: accounts.map(a => ({ platform: a.platform, followers: a.follower_count||0, engagement_rate: a.engagement_rate||0, growth: a.follower_growth||0 })),
      };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advanced Analytics</h1>
          <p className="text-slate-500">Deep insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reach', value: '2.4M', change: '+18.2%', icon: Eye, color: 'text-[#d4af37]' },
          { label: 'Engagement Rate', value: '5.8%', change: '+12.5%', icon: Target, color: 'text-[#d4af37]' },
          { label: 'Total Revenue', value: '$87.5K', change: '+24.3%', icon: DollarSign, color: 'text-[#d4af37]' },
          { label: 'Avg ROI', value: '285%', change: '+15.8%', icon: TrendingUp, color: 'text-[#d4af37]' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
                <Badge className="bg-green-100 text-green-700">{stat.change}</Badge>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="platforms">Platform Comparison</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="reach" stroke="#d4af37" fill="#d4af37" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="engagement" stroke="#4a4a4a" fill="#4a4a4a" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={Array.from({ length: 24 }, (_, i) => ({ hour: i, engagement: 0 * 100 }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="engagement" fill="#d4af37" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { stage: 'Impressions', value: 245000, percentage: 100 },
                  { stage: 'Clicks', value: 18500, percentage: 7.5 },
                  { stage: 'Engagements', value: 9800, percentage: 4 },
                  { stage: 'Conversions', value: 1850, percentage: 0.75 },
                ].map((stage, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{stage.stage}</span>
                      <span className="text-slate-600">{stage.value.toLocaleString()} ({stage.percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div className="bg-[#d4af37] h-3 rounded-full" style={{ width: `${stage.percentage * 13.33}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {_apiData.platformComparison || _OLD_platformComparison.map((platform, i) => (
                  <div key={i} className="p-4 rounded-lg border-2 border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-900">{platform.platform}</h4>
                      <Badge className={cn(platform.growth > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {platform.growth > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(platform.growth)}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Followers</p>
                        <p className="font-semibold text-slate-900">{(platform.followers / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Growth</p>
                        <p className="font-semibold text-slate-900">{platform.growth}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Engagement</p>
                        <p className="font-semibold text-slate-900">{platform.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">ROI</p>
                        <p className="font-semibold text-slate-900">{platform.roi}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Investment</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="conversions" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="mt-6">
          <div className="space-y-6">
            <AnomalyDetector onActionClick={(anomaly) => console.log('Fix anomaly:', anomaly)} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Predictions</CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { metric: 'Follower Growth', current: '125K', predicted: '148K', confidence: 92, trend: 'up' },
                  { metric: 'Engagement Rate', current: '5.8%', predicted: '6.4%', confidence: 88, trend: 'up' },
                  { metric: 'Revenue', current: '$87.5K', predicted: '$102K', confidence: 85, trend: 'up' },
                ].map((pred, i) => (
                  <div key={i} className="p-4 rounded-lg bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-slate-900">{pred.metric}</h4>
                      <Badge className="bg-violet-100 text-violet-700">Confidence: {pred.confidence}%</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500">Current</p>
                        <p className="text-lg font-bold text-slate-900">{pred.current}</p>
                      </div>
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-xs text-slate-500">30-Day Prediction</p>
                        <p className="text-lg font-bold text-violet-600">{pred.predicted}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

              <AISuggestions />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}