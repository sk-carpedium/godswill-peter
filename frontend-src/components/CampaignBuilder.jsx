import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Target, Calendar, DollarSign, Users, CheckCircle, ArrowRight, TrendingUp, Package, BarChart3, Plus, X, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const platforms = [
{ id: 'instagram', name: 'Instagram', icon: '📸', audience: '125K' },
{ id: 'facebook', name: 'Facebook', icon: 'f', audience: '156K' },
{ id: 'twitter', name: 'Twitter', icon: '𝕏', audience: '89K' },
{ id: 'linkedin', name: 'LinkedIn', icon: 'in', audience: '45K' },
{ id: 'tiktok', name: 'TikTok', icon: '♪', audience: '78K' }];


export default function CampaignBuilder() {
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: '',
    platforms: [],
    budget: '',
    duration: '',
    brand_id: '',
    start_date: '',
    end_date: '',
    kpis: {
      target_reach: '',
      target_engagement: '',
      target_clicks: '',
      target_conversions: '',
      target_revenue: ''
    },
    utm_parameters: {
      source: '',
      medium: 'social',
      campaign: ''
    }
  });
  
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => base44.entities.Workspace.filter({ status: 'active' })
  });

  const currentWorkspace = workspaces[0];

  const { data: brands = [] } = useQuery({
    queryKey: ['brands', currentWorkspace?.id],
    queryFn: () => base44.entities.Brand.filter({ 
      workspace_id: currentWorkspace?.id,
      status: 'active'
    }),
    enabled: !!currentWorkspace?.id
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', currentWorkspace?.id],
    queryFn: () => base44.entities.Campaign.filter({ 
      workspace_id: currentWorkspace?.id 
    }),
    enabled: !!currentWorkspace?.id
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['posts', currentWorkspace?.id],
    queryFn: () => base44.entities.Post.filter({ 
      workspace_id: currentWorkspace?.id 
    }),
    enabled: !!currentWorkspace?.id
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data) => base44.entities.Campaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully!');
      setView('list');
      setStep(1);
      setCampaignData({
        name: '',
        objective: '',
        platforms: [],
        budget: '',
        duration: '',
        brand_id: '',
        start_date: '',
        end_date: '',
        kpis: { target_reach: '', target_engagement: '', target_clicks: '', target_conversions: '', target_revenue: '' },
        utm_parameters: { source: '', medium: 'social', campaign: '' }
      });
    }
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Campaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign updated successfully!');
    }
  });

  const progress = step / 6 * 100;

  const handleNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleLaunch = async () => {
    const campaignToCreate = {
      workspace_id: currentWorkspace?.id,
      brand_id: campaignData.brand_id || brands[0]?.id,
      name: campaignData.name,
      description: campaignData.objective,
      objective: 'awareness',
      start_date: campaignData.start_date || new Date().toISOString().split('T')[0],
      end_date: campaignData.end_date || new Date(Date.now() + parseInt(campaignData.duration || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: {
        total: parseFloat(campaignData.budget) || 0,
        spent: 0,
        currency: 'USD'
      },
      kpis: {
        target_reach: parseFloat(campaignData.kpis.target_reach) || 0,
        target_engagement: parseFloat(campaignData.kpis.target_engagement) || 0,
        target_clicks: parseFloat(campaignData.kpis.target_clicks) || 0,
        target_conversions: parseFloat(campaignData.kpis.target_conversions) || 0,
        target_revenue: parseFloat(campaignData.kpis.target_revenue) || 0
      },
      utm_parameters: {
        source: campaignData.utm_parameters.source || 'social',
        medium: campaignData.utm_parameters.medium || 'social',
        campaign: campaignData.utm_parameters.campaign || campaignData.name.toLowerCase().replace(/\s+/g, '_')
      },
      status: 'active',
      performance: {
        total_posts: 0,
        published_posts: 0,
        total_reach: 0,
        total_impressions: 0,
        total_engagement: 0,
        total_clicks: 0,
        total_conversions: 0,
        total_revenue: 0,
        roi: 0
      }
    };
    
    await createCampaignMutation.mutateAsync(campaignToCreate);
  };

  const calculateROI = (campaign) => {
    if (!campaign.budget?.total || campaign.budget.total === 0) return 0;
    const revenue = campaign.performance?.total_revenue || 0;
    const spent = campaign.budget?.spent || 0;
    return ((revenue - spent) / spent * 100).toFixed(2);
  };

  const getPostsForCampaign = (campaignId) => {
    return posts.filter(post => post.campaign_id === campaignId);
  };

  if (view === 'list') {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Campaign Management</h1>
              <p className="text-slate-500">Manage and track all your marketing campaigns</p>
            </div>
          </div>
          <Button onClick={() => setView('create')} className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Active Campaigns</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {campaigns.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <Target className="w-10 h-10 text-[#d4af37]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Budget</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    ${campaigns.reduce((sum, c) => sum + (c.budget?.total || 0), 0).toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Avg ROI</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + parseFloat(calculateROI(c) || 0), 0) / campaigns.length).toFixed(0) : 0}%
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const campaignPosts = getPostsForCampaign(campaign.id);
            const brand = brands.find(b => b.id === campaign.brand_id);
            const roi = calculateROI(campaign);
            const progress = campaign.kpis?.target_revenue ? 
              ((campaign.performance?.total_revenue || 0) / campaign.kpis.target_revenue * 100).toFixed(0) : 0;

            return (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{campaign.name}</CardTitle>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        {brand && (
                          <Badge variant="outline" className="gap-1">
                            <Package className="w-3 h-3" />
                            {brand.name}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="mt-2">{campaign.description}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="posts">Posts ({campaignPosts.length})</TabsTrigger>
                      <TabsTrigger value="performance">Performance</TabsTrigger>
                      <TabsTrigger value="goals">Goals & ROI</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Budget</p>
                          <p className="text-lg font-semibold">${campaign.budget?.total?.toLocaleString() || 0}</p>
                          <p className="text-xs text-slate-500">Spent: ${campaign.budget?.spent?.toLocaleString() || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Duration</p>
                          <p className="text-lg font-semibold">
                            {campaign.start_date && campaign.end_date ? 
                              Math.ceil((new Date(campaign.end_date) - new Date(campaign.start_date)) / (1000 * 60 * 60 * 24)) : 0} days
                          </p>
                          <p className="text-xs text-slate-500">{campaign.start_date} to {campaign.end_date}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Total Posts</p>
                          <p className="text-lg font-semibold">{campaign.performance?.total_posts || 0}</p>
                          <p className="text-xs text-slate-500">Published: {campaign.performance?.published_posts || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">ROI</p>
                          <p className={`text-lg font-semibold ${parseFloat(roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {roi}%
                          </p>
                          <p className="text-xs text-slate-500">
                            Revenue: ${campaign.performance?.total_revenue?.toLocaleString() || 0}
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="posts" className="mt-4">
                      <div className="space-y-2">
                        {campaignPosts.length > 0 ? (
                          campaignPosts.map((post) => (
                            <div key={post.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <div className="flex-1">
                                <p className="font-medium">{post.title || post.content?.text?.substring(0, 60) + '...'}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{post.status}</Badge>
                                  {post.platforms?.map((p) => (
                                    <Badge key={p.platform} variant="secondary" className="text-xs">
                                      {p.platform}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center text-slate-500 py-8">No posts assigned to this campaign yet</p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="performance" className="mt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600">Reach</p>
                          <p className="text-2xl font-bold text-blue-900">{(campaign.performance?.total_reach || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600">Engagement</p>
                          <p className="text-2xl font-bold text-green-900">{(campaign.performance?.total_engagement || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-600">Clicks</p>
                          <p className="text-2xl font-bold text-purple-900">{(campaign.performance?.total_clicks || 0).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <p className="text-sm text-orange-600">Conversions</p>
                          <p className="text-2xl font-bold text-orange-900">{(campaign.performance?.total_conversions || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="goals" className="space-y-4 mt-4">
                      <div className="space-y-3">
                        {campaign.kpis?.target_reach > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Reach Goal</span>
                              <span>{((campaign.performance?.total_reach || 0) / campaign.kpis.target_reach * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={(campaign.performance?.total_reach || 0) / campaign.kpis.target_reach * 100} />
                            <p className="text-xs text-slate-500 mt-1">
                              {(campaign.performance?.total_reach || 0).toLocaleString()} / {campaign.kpis.target_reach.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {campaign.kpis?.target_engagement > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Engagement Goal</span>
                              <span>{((campaign.performance?.total_engagement || 0) / campaign.kpis.target_engagement * 100).toFixed(0)}%</span>
                            </div>
                            <Progress value={(campaign.performance?.total_engagement || 0) / campaign.kpis.target_engagement * 100} />
                            <p className="text-xs text-slate-500 mt-1">
                              {(campaign.performance?.total_engagement || 0).toLocaleString()} / {campaign.kpis.target_engagement.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {campaign.kpis?.target_revenue > 0 && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Revenue Goal</span>
                              <span className={parseFloat(roi) >= 0 ? 'text-green-600' : 'text-red-600'}>
                                ROI: {roi}%
                              </span>
                            </div>
                            <Progress value={(campaign.performance?.total_revenue || 0) / campaign.kpis.target_revenue * 100} className="bg-green-100" />
                            <p className="text-xs text-slate-500 mt-1">
                              ${(campaign.performance?.total_revenue || 0).toLocaleString()} / ${campaign.kpis.target_revenue.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            );
          })}

          {campaigns.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No campaigns yet</h3>
                <p className="text-slate-500 mb-6">Create your first campaign to start tracking performance</p>
                <Button onClick={() => setView('create')} className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campaign Builder</h1>
            <p className="text-slate-500">Create cross-platform campaigns in minutes</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setView('list')}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Step {step} of 6</CardTitle>
            <Badge variant="secondary">{progress.toFixed(0)}% Complete</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="min-h-[400px]">
          {step === 1 &&
          <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Campaign Basics</h3>
              <div>
                <Label>Campaign Name</Label>
                <Input
                placeholder="e.g., Summer Product Launch 2026"
                value={campaignData.name}
                onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                className="mt-2" />

              </div>
              <div>
                <Label>Client Brand / Product</Label>
                <Select 
                  value={campaignData.brand_id} 
                  onValueChange={(value) => setCampaignData({ ...campaignData, brand_id: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Campaign Objective</Label>
                <Textarea
                placeholder="What do you want to achieve with this campaign?"
                value={campaignData.objective}
                onChange={(e) => setCampaignData({ ...campaignData, objective: e.target.value })}
                className="mt-2 min-h-[120px]" />

              </div>
            </div>
          }

          {step === 2 &&
          <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Select Platforms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((platform) =>
              <Card
                key={platform.id}
                className={`cursor-pointer transition-all ${campaignData.platforms.includes(platform.id) ? 'border-2 border-violet-500 bg-violet-50' : 'hover:bg-slate-50'}`}
                onClick={() => {
                  const newPlatforms = campaignData.platforms.includes(platform.id) ?
                  campaignData.platforms.filter((p) => p !== platform.id) :
                  [...campaignData.platforms, platform.id];
                  setCampaignData({ ...campaignData, platforms: newPlatforms });
                }}>

                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
                            {platform.icon}
                          </div>
                          <div>
                            <p className="font-semibold">{platform.name}</p>
                            <p className="text-sm text-slate-500">{platform.audience} followers</p>
                          </div>
                        </div>
                        {campaignData.platforms.includes(platform.id) &&
                    <CheckCircle className="w-6 h-6 text-violet-600" />
                    }
                      </div>
                    </CardContent>
                  </Card>
              )}
              </div>
            </div>
          }

          {step === 3 &&
          <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Budget & Timeline</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Campaign Budget (USD)
                  </Label>
                  <Input
                  type="number"
                  placeholder="5000"
                  value={campaignData.budget}
                  onChange={(e) => setCampaignData({ ...campaignData, budget: e.target.value })}
                  className="mt-2" />

                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Duration (days)
                  </Label>
                  <Input
                  type="number"
                  placeholder="30"
                  value={campaignData.duration}
                  onChange={(e) => setCampaignData({ ...campaignData, duration: e.target.value })}
                  className="mt-2" />

                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input
                  type="date"
                  value={campaignData.start_date}
                  onChange={(e) => setCampaignData({ ...campaignData, start_date: e.target.value })}
                  className="mt-2" />

                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                  type="date"
                  value={campaignData.end_date}
                  onChange={(e) => setCampaignData({ ...campaignData, end_date: e.target.value })}
                  className="mt-2" />

                </div>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-900">
                    Based on your selection, estimated reach: <strong>2.4M - 3.2M</strong> users
                  </p>
                </CardContent>
              </Card>
            </div>
          }

          {step === 4 &&
          <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Target Audience</h3>
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <Label className="mb-3 block">Age Range</Label>
                    <div className="space-y-2">
                      {['18-24', '25-34', '35-44', '45-54', '55+'].map((range) =>
                    <div key={range} className="flex items-center gap-2">
                          <Checkbox id={range} />
                          <label htmlFor={range} className="text-sm">{range}</label>
                        </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <Label className="mb-3 block">Interests</Label>
                    <div className="space-y-2">
                      {['Technology', 'Business', 'Lifestyle', 'Fashion', 'Health'].map((interest) =>
                    <div key={interest} className="flex items-center gap-2">
                          <Checkbox id={interest} />
                          <label htmlFor={interest} className="text-sm">{interest}</label>
                        </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          }

          {step === 5 &&
          <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Campaign Goals & KPIs</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Target Reach</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100000"
                    value={campaignData.kpis.target_reach}
                    onChange={(e) => setCampaignData({ 
                      ...campaignData, 
                      kpis: { ...campaignData.kpis, target_reach: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Target Engagement</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 5000"
                    value={campaignData.kpis.target_engagement}
                    onChange={(e) => setCampaignData({ 
                      ...campaignData, 
                      kpis: { ...campaignData.kpis, target_engagement: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Target Clicks</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2000"
                    value={campaignData.kpis.target_clicks}
                    onChange={(e) => setCampaignData({ 
                      ...campaignData, 
                      kpis: { ...campaignData.kpis, target_clicks: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Target Conversions</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={campaignData.kpis.target_conversions}
                    onChange={(e) => setCampaignData({ 
                      ...campaignData, 
                      kpis: { ...campaignData.kpis, target_conversions: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Target Revenue (USD)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={campaignData.kpis.target_revenue}
                    onChange={(e) => setCampaignData({ 
                      ...campaignData, 
                      kpis: { ...campaignData.kpis, target_revenue: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">UTM Tracking Parameters</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Source</Label>
                    <Input
                      placeholder="e.g., instagram"
                      value={campaignData.utm_parameters.source}
                      onChange={(e) => setCampaignData({ 
                        ...campaignData, 
                        utm_parameters: { ...campaignData.utm_parameters, source: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Medium</Label>
                    <Input
                      placeholder="social"
                      value={campaignData.utm_parameters.medium}
                      onChange={(e) => setCampaignData({ 
                        ...campaignData, 
                        utm_parameters: { ...campaignData.utm_parameters, medium: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Campaign Tag</Label>
                    <Input
                      placeholder="Auto-generated"
                      value={campaignData.utm_parameters.campaign}
                      onChange={(e) => setCampaignData({ 
                        ...campaignData, 
                        utm_parameters: { ...campaignData.utm_parameters, campaign: e.target.value }
                      })}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <p className="text-sm text-green-900">
                    <strong>ROI Target:</strong> With a budget of ${campaignData.budget || 0} and revenue goal of ${campaignData.kpis.target_revenue || 0}, 
                    your target ROI is <strong>{campaignData.budget && campaignData.kpis.target_revenue ? 
                      ((parseFloat(campaignData.kpis.target_revenue) - parseFloat(campaignData.budget)) / parseFloat(campaignData.budget) * 100).toFixed(0) : 0}%</strong>
                  </p>
                </CardContent>
              </Card>
            </div>
          }

          {step === 6 &&
          <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Review & Launch</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h4 className="font-semibold mb-4">Campaign Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Campaign Name</p>
                        <p className="font-medium">{campaignData.name || 'Not set'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Brand</p>
                        <p className="font-medium">{brands.find(b => b.id === campaignData.brand_id)?.name || 'Not selected'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Platforms</p>
                        <p className="font-medium">{campaignData.platforms.length} selected</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Budget</p>
                        <p className="font-medium">${campaignData.budget || '0'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Duration</p>
                        <p className="font-medium">{campaignData.duration || '0'} days</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Target Revenue</p>
                        <p className="font-medium">${campaignData.kpis.target_revenue || '0'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Target ROI</p>
                        <p className="font-medium text-green-600">
                          {campaignData.budget && campaignData.kpis.target_revenue ? 
                            ((parseFloat(campaignData.kpis.target_revenue) - parseFloat(campaignData.budget)) / parseFloat(campaignData.budget) * 100).toFixed(0) : 0}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Timeline</p>
                        <p className="font-medium">{campaignData.start_date || 'Not set'} - {campaignData.end_date || 'Not set'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Ready to Launch</p>
                        <p className="text-sm text-green-700">Your campaign is configured and ready to go live</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          }
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          Back
        </Button>
        {step < 6 ?
        <Button onClick={handleNext} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
            Next <ArrowRight className="w-4 h-4 ml-2" />
          </Button> :

        <Button onClick={handleLaunch} className="bg-green-600 hover:bg-green-700" disabled={createCampaignMutation.isPending}>
            <Zap className="w-4 h-4 mr-2" />
            {createCampaignMutation.isPending ? 'Creating...' : 'Launch Campaign'}
          </Button>
        }
      </div>
    </div>);

}