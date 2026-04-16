import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  MousePointerClick,
  DollarSign,
  Target,
  Calendar,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const COLORS = ['#d4af37', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

export default function CampaignPerformanceDashboard({ campaigns = [], brands = [] }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['campaign-performance', workspaceId],
    queryFn: async () => { 
      const campaigns = await api.entities.Campaign.filter({ workspace_id: workspaceId, sort: '-created_at' });
      return campaigns;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [dateRange, setDateRange] = useState('30');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filter campaigns based on selected filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesBrand = brandFilter === 'all' || campaign.brand_id === brandFilter;
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
      
      let matchesDate = true;
      if (dateRange === 'custom' && startDate && endDate) {
        const campaignStart = new Date(campaign.start_date);
        const campaignEnd = new Date(campaign.end_date);
        const filterStart = new Date(startDate);
        const filterEnd = new Date(endDate);
        matchesDate = (campaignStart >= filterStart && campaignStart <= filterEnd) ||
                     (campaignEnd >= filterStart && campaignEnd <= filterEnd);
      } else if (dateRange !== 'all') {
        const daysAgo = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
        const campaignStart = new Date(campaign.start_date);
        matchesDate = campaignStart >= cutoffDate;
      }
      
      return matchesBrand && matchesStatus && matchesDate;
    });
  }, [campaigns, brandFilter, statusFilter, dateRange, startDate, endDate]);

  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    const totals = filteredCampaigns.reduce((acc, campaign) => {
      const perf = campaign.performance || {};
      return {
        totalReach: acc.totalReach + (perf.total_reach || 0),
        totalEngagement: acc.totalEngagement + (perf.total_engagement || 0),
        totalClicks: acc.totalClicks + (perf.total_clicks || 0),
        totalConversions: acc.totalConversions + (perf.total_conversions || 0),
        totalRevenue: acc.totalRevenue + (perf.total_revenue || 0),
        totalSpent: acc.totalSpent + (campaign.budget?.spent || 0),
        totalBudget: acc.totalBudget + (campaign.budget?.total || 0),
        totalPosts: acc.totalPosts + (perf.total_posts || 0),
        publishedPosts: acc.publishedPosts + (perf.published_posts || 0)
      };
    }, {
      totalReach: 0,
      totalEngagement: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalSpent: 0,
      totalBudget: 0,
      totalPosts: 0,
      publishedPosts: 0
    });

    const engagementRate = totals.totalReach > 0 ? (totals.totalEngagement / totals.totalReach * 100) : 0;
    const conversionRate = totals.totalClicks > 0 ? (totals.totalConversions / totals.totalClicks * 100) : 0;
    const overallROI = totals.totalSpent > 0 ? ((totals.totalRevenue - totals.totalSpent) / totals.totalSpent * 100) : 0;
    const avgCPC = totals.totalClicks > 0 ? (totals.totalSpent / totals.totalClicks) : 0;
    const avgCPA = totals.totalConversions > 0 ? (totals.totalSpent / totals.totalConversions) : 0;

    return { ...totals, engagementRate, conversionRate, overallROI, avgCPC, avgCPA };
  }, [filteredCampaigns]);

  // Prepare trend data for charts
  const trendData = useMemo(() => {
    const monthlyData = {};
    
    filteredCampaigns.forEach((campaign) => {
      const startMonth = moment(campaign.start_date).format('MMM YY');
      if (!monthlyData[startMonth]) {
        monthlyData[startMonth] = {
          month: startMonth,
          reach: 0,
          engagement: 0,
          conversions: 0,
          revenue: 0,
          spent: 0
        };
      }
      
      const perf = campaign.performance || {};
      monthlyData[startMonth].reach += perf.total_reach || 0;
      monthlyData[startMonth].engagement += perf.total_engagement || 0;
      monthlyData[startMonth].conversions += perf.total_conversions || 0;
      monthlyData[startMonth].revenue += perf.total_revenue || 0;
      monthlyData[startMonth].spent += campaign.budget?.spent || 0;
    });

    return Object.values(monthlyData).sort((a, b) => 
      moment(a.month, 'MMM YY').valueOf() - moment(b.month, 'MMM YY').valueOf()
    );
  }, [filteredCampaigns]);

  // Campaign status distribution
  const statusDistribution = useMemo(() => {
    const dist = filteredCampaigns.reduce((acc, campaign) => {
      acc[campaign.status] = (acc[campaign.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dist).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [filteredCampaigns]);

  // Top performing campaigns
  const topCampaigns = useMemo(() => {
    return [...filteredCampaigns]
      .sort((a, b) => (b.performance?.total_revenue || 0) - (a.performance?.total_revenue || 0))
      .slice(0, 5);
  }, [filteredCampaigns]);

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
              <CardDescription>Filter campaign data by date range, brand, and status</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </>
            )}

            <div>
              <Label>Brand</Label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">Total Reach</p>
                <p className="text-3xl font-bold text-slate-900">{formatNumber(aggregatedMetrics.totalReach)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Engagement: {aggregatedMetrics.engagementRate.toFixed(2)}%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">Total Engagement</p>
                <p className="text-3xl font-bold text-slate-900">{formatNumber(aggregatedMetrics.totalEngagement)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-slate-600">Posts: {aggregatedMetrics.publishedPosts}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">Conversions</p>
                <p className="text-3xl font-bold text-slate-900">{formatNumber(aggregatedMetrics.totalConversions)}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-slate-600">CVR: {aggregatedMetrics.conversionRate.toFixed(2)}%</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-1">Overall ROI</p>
                <p className={`text-3xl font-bold ${aggregatedMetrics.overallROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {aggregatedMetrics.overallROI.toFixed(1)}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(aggregatedMetrics.totalRevenue)} revenue
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#d4af37]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Reach, engagement, and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
                <Area type="monotone" dataKey="reach" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Reach" />
                <Area type="monotone" dataKey="engagement" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Engagement" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue vs Spent */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Budget Spent</CardTitle>
            <CardDescription>Monthly comparison of revenue and spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Status Distribution</CardTitle>
            <CardDescription>Breakdown of campaigns by status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>From reach to conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={[
                  { stage: 'Reach', value: aggregatedMetrics.totalReach },
                  { stage: 'Engagement', value: aggregatedMetrics.totalEngagement },
                  { stage: 'Clicks', value: aggregatedMetrics.totalClicks },
                  { stage: 'Conversions', value: aggregatedMetrics.totalConversions }
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => formatNumber(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Campaigns</CardTitle>
          <CardDescription>Ranked by revenue generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCampaigns.map((campaign, index) => {
              const revenue = campaign.performance?.total_revenue || 0;
              const spent = campaign.budget?.spent || 0;
              const roi = spent > 0 ? ((revenue - spent) / spent * 100) : 0;

              return (
                <div key={campaign.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#d4af37] text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{campaign.name}</p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(campaign.performance?.total_reach || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(campaign.performance?.total_engagement || 0)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {formatNumber(campaign.performance?.total_conversions || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(revenue)}</p>
                    <p className={`text-sm ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ROI: {roi.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-1">Average CPC</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(aggregatedMetrics.avgCPC)}</p>
            <p className="text-xs text-slate-500 mt-1">Cost per click</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-1">Average CPA</p>
            <p className="text-2xl font-bold text-slate-900">{formatCurrency(aggregatedMetrics.avgCPA)}</p>
            <p className="text-xs text-slate-500 mt-1">Cost per acquisition</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 mb-1">Budget Utilization</p>
            <p className="text-2xl font-bold text-slate-900">
              {aggregatedMetrics.totalBudget > 0 ? ((aggregatedMetrics.totalSpent / aggregatedMetrics.totalBudget) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(aggregatedMetrics.totalSpent)} / {formatCurrency(aggregatedMetrics.totalBudget)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}