import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Calendar,
  Target,
  DollarSign,
  TrendingUp,
  Eye,
  Heart,
  MousePointerClick,
  BarChart3,
  FileText,
  Settings,
  Edit,
  Play,
  Pause
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import moment from 'moment';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' }
};

export default function CampaignDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const campaignId = urlParams.get('id');

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      const campaigns = await api.entities.Campaign.filter({ id: campaignId });
      return campaigns[0] || null;
    },
    enabled: !!campaignId
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['campaign-posts', campaignId],
    queryFn: () => api.entities.Post.filter({ campaign_id: campaignId }),
    enabled: !!campaignId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Campaign Not Found</h2>
        <p className="text-slate-500 mb-6">The campaign you're looking for doesn't exist.</p>
        <Link to={createPageUrl('Campaigns')}>
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const calculateProgress = () => {
    if (!campaign.kpis?.target_reach || !campaign.performance?.total_reach) return 0;
    return Math.min(100, (campaign.performance.total_reach / campaign.kpis.target_reach) * 100);
  };

  const calculateROI = () => {
    const spent = campaign.budget?.spent || 0;
    const revenue = campaign.performance?.total_revenue || 0;
    if (spent === 0) return campaign.performance?.roi || 0;
    return ((revenue - spent) / spent * 100).toFixed(1);
  };

  const performanceData = [
    { name: 'Week 1', reach: 45000, engagement: 3200, conversions: 45 },
    { name: 'Week 2', reach: 68000, engagement: 5400, conversions: 78 },
    { name: 'Week 3', reach: 92000, engagement: 6800, conversions: 89 },
    { name: 'Week 4', reach: 137000, engagement: 9100, conversions: 122 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl('Campaigns')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
              <Badge className={statusConfig[campaign.status]?.color}>
                {statusConfig[campaign.status]?.label}
              </Badge>
            </div>
            <p className="text-slate-500">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === 'active' && (
            <Button variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause Campaign
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Resume Campaign
            </Button>
          )}
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Total Reach</p>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatNumber(campaign.performance?.total_reach || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Target: {formatNumber(campaign.kpis?.target_reach || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Engagement</p>
              <Heart className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatNumber(campaign.performance?.total_engagement || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Target: {formatNumber(campaign.kpis?.target_engagement || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">Conversions</p>
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatNumber(campaign.performance?.total_conversions || 0)}</p>
            <p className="text-xs text-slate-500 mt-1">
              Target: {formatNumber(campaign.kpis?.target_conversions || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500">ROI</p>
              <TrendingUp className="w-5 h-5 text-[#d4af37]" />
            </div>
            <p className={`text-3xl font-bold ${calculateROI() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calculateROI()}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Revenue: {formatCurrency(campaign.performance?.total_revenue || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Info & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">Objective</p>
                <p className="font-medium capitalize">{campaign.objective}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Duration</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="font-medium">
                    {moment(campaign.start_date).format('MMM D')} - {moment(campaign.end_date).format('MMM D, YYYY')}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Budget</p>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  <p className="font-medium">{formatCurrency(campaign.budget?.total || 0)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Spent</p>
                <p className="font-medium">{formatCurrency(campaign.budget?.spent || 0)}</p>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Campaign Progress</span>
                <span className="font-medium">{Math.round(calculateProgress())}%</span>
              </div>
              <Progress value={calculateProgress()} className="h-3" />
              <p className="text-xs text-slate-500">
                Based on reach target of {formatNumber(campaign.kpis?.target_reach || 0)}
              </p>
            </div>

            {campaign.utm_parameters && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-slate-700 mb-2">UTM Parameters</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Source</p>
                    <p className="font-mono text-xs">{campaign.utm_parameters.source}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Medium</p>
                    <p className="font-mono text-xs">{campaign.utm_parameters.medium}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Campaign</p>
                    <p className="font-mono text-xs">{campaign.utm_parameters.campaign}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Posts Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Total Posts</p>
                <p className="text-2xl font-bold text-slate-900">{campaign.performance?.total_posts || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Published</p>
                <p className="text-2xl font-bold text-emerald-600">{campaign.performance?.published_posts || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
              <div>
                <p className="text-sm text-slate-500">Scheduled</p>
                <p className="text-2xl font-bold text-amber-600">
                  {(campaign.performance?.total_posts || 0) - (campaign.performance?.published_posts || 0)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Weekly breakdown of reach, engagement, and conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="reach" stroke="#3b82f6" strokeWidth={2} name="Reach" />
              <Line type="monotone" dataKey="engagement" stroke="#8b5cf6" strokeWidth={2} name="Engagement" />
              <Line type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} name="Conversions" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Campaign Posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign Posts</CardTitle>
              <CardDescription>All posts associated with this campaign</CardDescription>
            </div>
            <Link to={createPageUrl('Content') + '?campaign=' + campaignId}>
              <Button variant="outline" size="sm">
                Create Post
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No posts in this campaign yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{post.title || 'Untitled Post'}</p>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{post.content?.text}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(post.platforms?.[0]?.metrics?.reach || 0)}
                    </div>
                    <Badge variant="outline">{post.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}