import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Search,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MultiWorkspaceDashboard() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['all-workspaces'],
    queryFn: async () => {
      return await base44.entities.Workspace.filter({ status: 'active' });
    }
  });

  const { data: allSubscriptions = [] } = useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: async () => {
      return await base44.entities.Subscription.list();
    }
  });

  const { data: allRevenue = [] } = useQuery({
    queryKey: ['all-revenue'],
    queryFn: async () => {
      return await base44.entities.Revenue.list();
    }
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['all-posts'],
    queryFn: async () => {
      return await base44.entities.Post.list();
    }
  });

  const filteredWorkspaces = workspaces.filter(ws =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getWorkspaceStats = (workspaceId) => {
    const posts = allPosts.filter(p => p.workspace_id === workspaceId);
    const revenue = allRevenue.filter(r => r.workspace_id === workspaceId);
    const subscription = allSubscriptions.find(s => s.workspace_id === workspaceId);
    
    const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
    const publishedPosts = posts.filter(p => p.status === 'published').length;
    const scheduledPosts = posts.filter(p => p.status === 'scheduled').length;

    return {
      totalRevenue,
      publishedPosts,
      scheduledPosts,
      plan: subscription?.plan_id || 'free',
      teamMembers: subscription?.current_usage?.team_members || 0,
      socialAccounts: subscription?.current_usage?.social_accounts || 0
    };
  };

  const totalClients = workspaces.length;
  const totalRevenue = allRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalPosts = allPosts.filter(p => p.status === 'published').length;
  const activeClients = workspaces.filter(ws => {
    const posts = allPosts.filter(p => p.workspace_id === ws.id);
    return posts.some(p => new Date(p.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Multi-Client Dashboard</h1>
          <p className="text-slate-500">Manage all your client workspaces in one place</p>
        </div>
        <Link to={createPageUrl('CreateWorkspace')}>
          <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
            <Plus className="w-4 h-4 mr-2" />
            New Client Workspace
          </Button>
        </Link>
      </div>

      {/* Agency-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <Badge className="bg-blue-500 text-white">Agency</Badge>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{totalClients}</p>
            <p className="text-sm text-slate-600">Total Clients</p>
            <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              {activeClients} active this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-slate-600">Total Revenue</p>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +24% vs last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100/50 border-violet-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{totalPosts}</p>
            <p className="text-sm text-slate-600">Posts Published</p>
            <p className="text-xs text-violet-600 mt-2">Across all clients</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">94.2%</p>
            <p className="text-sm text-slate-600">Client Satisfaction</p>
            <p className="text-xs text-amber-600 mt-2">Based on feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Client Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.map((workspace) => {
          const stats = getWorkspaceStats(workspace.id);
          
          return (
            <Card key={workspace.id} className="group hover:shadow-xl transition-all hover:border-[#d4af37]">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#f4cf47]/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#d4af37]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-xs capitalize">
                        {stats.plan} plan
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Revenue</p>
                    <p className="text-lg font-bold text-slate-900">
                      ${stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Posts</p>
                    <p className="text-lg font-bold text-slate-900">{stats.publishedPosts}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Team</p>
                    <p className="text-lg font-bold text-slate-900">{stats.teamMembers}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Accounts</p>
                    <p className="text-lg font-bold text-slate-900">{stats.socialAccounts}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Switch to this workspace context
                      window.location.href = createPageUrl('Dashboard') + '?workspace=' + workspace.id;
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                    onClick={() => {
                      window.location.href = createPageUrl('AnalyticsDashboard') + '?workspace=' + workspace.id;
                    }}
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredWorkspaces.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No workspaces found</h3>
            <p className="text-slate-500 mb-4">Create your first client workspace to get started</p>
            <Link to={createPageUrl('CreateWorkspace')}>
              <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}