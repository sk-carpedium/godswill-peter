import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Users, Eye, Heart, Target, Award, ArrowUpRight, ArrowDownRight, Plus, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const industryBenchmarks = {
  engagement_rate: { low: 1.2, average: 3.5, high: 6.8 },
  follower_growth: { low: 0.5, average: 2.1, high: 5.3 },
  reach_rate: { low: 8, average: 15, high: 28 },
  response_time: { low: 180, average: 45, high: 15 }
};

const _OLD_competitorData = [
  { name: 'Your Brand', followers: 45200, engagement: 4.2, posts: 124, reach: 18.5 },
  { name: 'Competitor A', followers: 89000, engagement: 3.1, posts: 156, reach: 12.3 },
  { name: 'Competitor B', followers: 62000, engagement: 5.8, posts: 98, reach: 22.1 },
  { name: 'Competitor C', followers: 51000, engagement: 2.9, posts: 142, reach: 9.8 }
];

const _OLD_perfTrends = [
  { month: 'Jan', yourBrand: 3.2, industry: 3.5, topPerformer: 6.5 },
  { month: 'Feb', yourBrand: 3.8, industry: 3.6, topPerformer: 6.8 },
  { month: 'Mar', yourBrand: 4.2, industry: 3.5, topPerformer: 7.2 },
  { month: 'Apr', yourBrand: 4.5, industry: 3.7, topPerformer: 7.0 },
  { month: 'May', yourBrand: 4.8, industry: 3.8, topPerformer: 7.5 },
  { month: 'Jun', yourBrand: 5.2, industry: 3.9, topPerformer: 7.8 }
];

const _OLD_radarData = [
  { metric: 'Engagement', yourBrand: 85, industry: 70, competitor: 65 },
  { metric: 'Reach', yourBrand: 75, industry: 68, competitor: 82 },
  { metric: 'Frequency', yourBrand: 68, industry: 75, competitor: 90 },
  { metric: 'Response Time', yourBrand: 92, industry: 65, competitor: 58 },
  { metric: 'Content Quality', yourBrand: 88, industry: 72, competitor: 75 }
];

export default function Benchmarking() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['benchmarks', workspaceId],
    queryFn: async () => { 
      const [analytics, competitors] = await Promise.all([
        api.entities.Analytics.filter({ workspace_id: workspaceId, period: '30d' }),
        api.entities.CompetitorTrack.filter({ workspace_id: workspaceId }),
      ]);
      return { analytics, competitors };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedIndustry, setSelectedIndustry] = useState('technology');
  const [timeRange, setTimeRange] = useState('6m');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Competitive Benchmarking</h1>
        <p className="text-slate-500 mt-1">Compare your performance against industry standards and competitors</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
              <Search className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Industry Benchmarks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Heart className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">Above Average</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">4.2%</p>
            <p className="text-sm text-slate-500 mt-1">Engagement Rate</p>
            <div className="mt-3 text-xs text-slate-400">
              Industry Avg: {industryBenchmarks.engagement_rate.average}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-amber-100 text-amber-700">Average</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">2.1%</p>
            <p className="text-sm text-slate-500 mt-1">Follower Growth</p>
            <div className="mt-3 text-xs text-slate-400">
              Industry Avg: {industryBenchmarks.follower_growth.average}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">Above Average</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">18.5%</p>
            <p className="text-sm text-slate-500 mt-1">Reach Rate</p>
            <div className="mt-3 text-xs text-slate-400">
              Industry Avg: {industryBenchmarks.reach_rate.average}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">Excellent</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">15 min</p>
            <p className="text-sm text-slate-500 mt-1">Avg Response Time</p>
            <div className="mt-3 text-xs text-slate-400">
              Industry Avg: {industryBenchmarks.response_time.average} min
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
          <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate Trend</CardTitle>
              <CardDescription>Your performance vs. industry average and top performers</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="yourBrand" stroke="#d4af37" strokeWidth={3} name="Your Brand" />
                  <Line type="monotone" dataKey="industry" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Industry Avg" />
                  <Line type="monotone" dataKey="topPerformer" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" name="Top Performer" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
              <CardDescription>Multi-dimensional performance comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fontSize: 10 }} />
                  <Radar name="Your Brand" dataKey="yourBrand" stroke="#d4af37" fill="#d4af37" fillOpacity={0.3} />
                  <Radar name="Industry Avg" dataKey="industry" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} />
                  <Radar name="Top Competitor" dataKey="competitor" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Competitor Comparison</CardTitle>
                  <CardDescription>Key metrics across your competitive landscape</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Competitor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorData.map((competitor, i) => (
                  <div key={i} className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    competitor.name === 'Your Brand' ? "border-[#d4af37] bg-[#d4af37]/5" : "border-slate-200"
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                          competitor.name === 'Your Brand' ? "bg-[#d4af37]" : "bg-slate-400"
                        )}>
                          {competitor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{competitor.name}</p>
                          {competitor.name === 'Your Brand' && (
                            <Badge className="bg-[#d4af37] text-slate-950 text-xs">You</Badge>
                          )}
                        </div>
                      </div>
                      {competitor.name !== 'Your Brand' && (
                        <Button variant="ghost" size="sm">View Details</Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Followers</p>
                        <p className="text-lg font-semibold text-slate-900">{(competitor.followers / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Engagement</p>
                        <p className="text-lg font-semibold text-slate-900">{competitor.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Posts/Month</p>
                        <p className="text-lg font-semibold text-slate-900">{competitor.posts}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Reach Rate</p>
                        <p className="text-lg font-semibold text-slate-900">{competitor.reach}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Engagement Strength</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Your engagement rate (4.2%) is 20% higher than the industry average. This indicates strong content resonance with your audience.
                    </p>
                    <Badge className="bg-green-100 text-green-700">Strength</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Growth Opportunity</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Competitor B achieves 38% higher engagement with fewer posts. Consider analyzing their content strategy and posting frequency.
                    </p>
                    <Badge className="bg-amber-100 text-amber-700">Opportunity</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Response Time Excellence</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Your 15-minute average response time is 67% faster than industry standard, contributing to higher customer satisfaction.
                    </p>
                    <Badge className="bg-blue-100 text-blue-700">Excellence</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Reach Gap</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      While your engagement is strong, your reach rate (18.5%) is below top performers (22%+). Consider expanding your hashtag strategy.
                    </p>
                    <Badge className="bg-red-100 text-red-700">Area for Improvement</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}