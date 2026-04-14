import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Filter,
  Target,
  Calendar,
  TrendingUp,
  DollarSign,
  Eye,
  Heart,
  MoreHorizontal,
  ChevronRight,
  Play,
  Pause,
  Archive,
  BarChart3 } from
'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
'@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CampaignPerformanceDashboard from '@/components/campaigns/CampaignPerformanceDashboard';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' }
};

const _OLD_sampleCampaigns = [
{
  id: '1',
  name: 'Summer Sale 2024',
  description: 'Promote summer collection with 30% off',
  objective: 'sales',
  status: 'active',
  color: '#8b5cf6',
  start_date: '2024-06-01',
  end_date: '2024-08-31',
  budget: { total: 5000, spent: 2340, currency: 'USD' },
  kpis: { target_reach: 500000, target_engagement: 25000, target_conversions: 500 },
  performance: {
    total_posts: 24,
    published_posts: 18,
    total_reach: 342000,
    total_engagement: 18500,
    total_conversions: 234,
    roi: 156
  }
},
{
  id: '2',
  name: 'Product Launch - AI Features',
  description: 'Launch campaign for new AI-powered features',
  objective: 'awareness',
  status: 'active',
  color: '#06b6d4',
  start_date: '2024-07-15',
  end_date: '2024-08-15',
  budget: { total: 3000, spent: 890, currency: 'USD' },
  kpis: { target_reach: 1000000, target_engagement: 50000 },
  performance: {
    total_posts: 12,
    published_posts: 6,
    total_reach: 456000,
    total_engagement: 28000
  }
},
{
  id: '3',
  name: 'Holiday Marketing 2024',
  description: 'Year-end holiday season campaign',
  objective: 'engagement',
  status: 'draft',
  color: '#f59e0b',
  start_date: '2024-11-01',
  end_date: '2024-12-31',
  budget: { total: 10000, spent: 0, currency: 'USD' },
  kpis: { target_reach: 2000000, target_engagement: 100000, target_conversions: 2000 }
}];


export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
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
    queryKey: ['campaigns'],
    queryFn: () => base44.entities.Campaign.list('-created_date'),
  });

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgress = (campaign) => {
    if (!campaign.kpis?.target_reach || !campaign.performance?.total_reach) return 0;
    return Math.min(100, campaign.performance.total_reach / campaign.kpis.target_reach * 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const calculateROI = (campaign) => {
    if (!campaign.budget?.spent || !campaign.performance?.total_revenue) {
      return campaign.performance?.roi || 0;
    }
    return ((campaign.performance.total_revenue - campaign.budget.spent) / campaign.budget.spent * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
          <p className="text-slate-500">Organize, track, and analyze your marketing campaigns</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input placeholder="e.g., Summer Sale 2024" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your campaign goals..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Objective</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="awareness">Awareness</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="traffic">Traffic</SelectItem>
                      <SelectItem value="leads">Leads</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Budget</Label>
                  <Input type="number" placeholder="5000" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>UTM Campaign Tag (for tracking)</Label>
                <Input placeholder="summer-sale-2024" />
                <p className="text-xs text-slate-500">Auto-applied to all campaign links for ROI attribution</p>
              </div>
              <Button className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950" onClick={() => setShowCreateDialog(false)}>
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="campaigns">All Campaigns</TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9" />

        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) =>
        <Card key={campaign.id} className="group hover:shadow-lg transition-all overflow-hidden">
            <div
            className="h-2"
            style={{ backgroundColor: campaign.color }} />

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className={statusConfig[campaign.status]?.color}>
                    {statusConfig[campaign.status]?.label}
                  </Badge>
                  <CardTitle className="mt-2 text-lg">{campaign.name}</CardTitle>
                  <p className="text-sm text-slate-500 mt-1">{campaign.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </DropdownMenuItem>
                    {campaign.status === 'active' &&
                  <DropdownMenuItem>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Campaign
                      </DropdownMenuItem>
                  }
                    {campaign.status === 'paused' &&
                  <DropdownMenuItem>
                        <Play className="w-4 h-4 mr-2" />
                        Resume Campaign
                      </DropdownMenuItem>
                  }
                    <DropdownMenuItem>
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Date Range */}
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="w-4 h-4" />
                {moment(campaign.start_date).format('MMM D')} - {moment(campaign.end_date).format('MMM D, YYYY')}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Campaign Progress</span>
                  <span className="font-medium">{Math.round(getProgress(campaign))}%</span>
                </div>
                <Progress value={getProgress(campaign)} className="h-2" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                    <Eye className="w-3 h-3" />
                  </div>
                  <p className="text-sm font-semibold">{formatNumber(campaign.performance?.total_reach)}</p>
                  <p className="text-xs text-slate-500">Reach</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                    <Heart className="w-3 h-3" />
                  </div>
                  <p className="text-sm font-semibold">{formatNumber(campaign.performance?.total_engagement)}</p>
                  <p className="text-xs text-slate-500">Engagement</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <p className="text-sm font-semibold">{calculateROI(campaign)}%</p>
                  <p className="text-xs text-slate-500">ROI</p>
                </div>
              </div>

              {/* Budget */}
              {campaign.budget &&
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">
                      {formatCurrency(campaign.budget.spent)} / {formatCurrency(campaign.budget.total)}
                    </span>
                  </div>
                  <Link to={createPageUrl('CampaignDetails') + '?id=' + campaign.id}>
                    <Button variant="ghost" size="sm" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
            }
            </CardContent>
          </Card>
        )}
      </div>

      {filteredCampaigns.length === 0 &&
      <Card className="py-12">
          <div className="text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No campaigns found</h3>
            <p className="text-slate-500 mb-4">Create your first campaign to start organizing your content</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </Card>
      }
        </TabsContent>

        <TabsContent value="analytics">
          <CampaignPerformanceDashboard campaigns={campaigns} brands={brands} />
        </TabsContent>
      </Tabs>
    </div>);

}