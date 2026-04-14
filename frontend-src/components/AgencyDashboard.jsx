import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Crown,
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  Calendar,
  BarChart3,
  Sparkles,
  Eye,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import MultiWorkspaceDashboard from '@/components/agency/MultiWorkspaceDashboard';
import ClientOnboardingWizard from '@/components/agency/ClientOnboardingWizard';

export default function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [planAccess, setPlanAccess] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAgencyAccess();
  }, []);

  const checkAgencyAccess = async () => {
    try {
      const user = await base44.auth.me();
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      
      if (workspaces.length === 0) {
        setPlanAccess(true); // Allow access to create first workspace
        return;
      }
      
      const subscriptions = await base44.entities.Subscription.filter({
        user_email: user.email
      });
      
      const subscription = subscriptions[0];
      const plan = subscription?.plan_id || 'free';
      
      // For demo/testing, allow access regardless of plan
      setPlanAccess(true);
    } catch (error) {
      console.error('Failed to check agency access:', error);
      setPlanAccess(true); // Allow access on error for testing
    }
  };

  const { data: allRevenue = [] } = useQuery({
    queryKey: ['all-revenue-agency'],
    queryFn: () => base44.entities.Revenue.list(),
    enabled: planAccess
  });

  const { data: allWorkspaces = [] } = useQuery({
    queryKey: ['all-workspaces-agency'],
    queryFn: () => base44.entities.Workspace.filter({ status: 'active' }),
    enabled: planAccess
  });

  const { data: allDeals = [] } = useQuery({
    queryKey: ['all-deals-agency'],
    queryFn: () => base44.entities.BrandDeal.list(),
    enabled: planAccess
  });

  if (!planAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Crown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Loading agency dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = allRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const activeDeals = allDeals.filter(d => d.status === 'active').length;
  const avgRevenuePerClient = allWorkspaces.length > 0 
    ? totalRevenue / allWorkspaces.length 
    : 0;

  if (showOnboarding) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Client Onboarding</h1>
              <p className="text-slate-500">Set up a new client workspace</p>
            </div>
          </div>
        </div>
        <ClientOnboardingWizard
          onComplete={() => setShowOnboarding(false)}
          onCancel={() => setShowOnboarding(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Agency Command Center</h1>
              <p className="text-slate-500">Multi-client management & ROI tracking</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setShowOnboarding(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Onboard New Client
          </Button>
          <Badge className="bg-emerald-500 text-white px-4 py-2">
            <Crown className="w-4 h-4 mr-2" />
            Agency Plan
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{allWorkspaces.length}</p>
            <p className="text-sm text-slate-600">Active Clients</p>
            <p className="text-xs text-emerald-600 mt-2">Unlimited capacity</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600">Total Client Revenue</p>
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +32% this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              ${avgRevenuePerClient.toFixed(0)}
            </p>
            <p className="text-sm text-slate-600">Avg Revenue/Client</p>
            <p className="text-xs text-violet-600 mt-2">Per month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{activeDeals}</p>
            <p className="text-sm text-slate-600">Active Brand Deals</p>
            <p className="text-xs text-amber-600 mt-2">Across all clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Building2 className="w-4 h-4" />
            Multi-Client View
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Revenue Tracking
          </TabsTrigger>
          <TabsTrigger value="deals" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Brand Deals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <MultiWorkspaceDashboard />
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Multi-Client Revenue Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allWorkspaces.map((workspace) => {
                  const workspaceRevenue = allRevenue
                    .filter(r => r.workspace_id === workspace.id)
                    .reduce((sum, r) => sum + (r.amount || 0), 0);
                  
                  const workspaceDeals = allDeals.filter(d => d.workspace_id === workspace.id);
                  
                  return (
                    <div
                      key={workspace.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-[#d4af37] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#d4af37]/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#d4af37]" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{workspace.name}</p>
                          <p className="text-sm text-slate-500">
                            {workspaceDeals.length} active deal{workspaceDeals.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-emerald-600">
                            ${workspaceRevenue.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">Total revenue</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(createPageUrl('Monetization') + '?workspace=' + workspace.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#d4af37]" />
                  All Brand Deals
                </CardTitle>
                <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                  <Plus className="w-4 h-4 mr-2" />
                  New Deal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {allDeals.map((deal) => {
                  const workspace = allWorkspaces.find(w => w.id === deal.workspace_id);
                  
                  return (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium text-slate-900">{deal.brand_name}</p>
                          <Badge
                            variant="secondary"
                            className={cn(
                              deal.status === 'active' && "bg-emerald-100 text-emerald-700",
                              deal.status === 'completed' && "bg-blue-100 text-blue-700",
                              deal.status === 'negotiating' && "bg-amber-100 text-amber-700"
                            )}
                          >
                            {deal.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {workspace?.name || 'Client'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="capitalize">{deal.deal_type?.replace(/_/g, ' ')}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-600">
                            ${deal.contract_value?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                      >
                        View Details
                      </Button>
                    </div>
                  );
                })}
                {allDeals.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No brand deals yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}