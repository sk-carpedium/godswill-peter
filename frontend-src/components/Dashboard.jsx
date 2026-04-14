import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import {
  Users,
  Eye,
  Heart,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Calendar,
  ArrowUpRight } from
'lucide-react';
import StatsCard from '@/components/dashboard/StatsCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import RecentPosts from '@/components/dashboard/RecentPosts';
import UpcomingPosts from '@/components/dashboard/UpcomingPosts';
import QuickActions from '@/components/dashboard/QuickActions';
import ConnectedAccounts from '@/components/dashboard/ConnectedAccounts';
import SyncStatusCard from '@/components/social/SyncStatusCard';
import { WelcomeChecklist } from '@/components/onboarding/WelcomeChecklist';
import DailySummary from '@/components/ai/DailySummary';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: posts = [] } = useQuery({
    queryKey: ['posts', user?.email],
    queryFn: async () => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return [];
      return base44.entities.Post.filter({ workspace_id: workspaces[0].id }, '-created_date', 10);
    },
    enabled: !!user
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', user?.email],
    queryFn: async () => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return [];
      return base44.entities.SocialAccount.filter({ workspace_id: workspaces[0].id });
    },
    enabled: !!user
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', user?.email],
    queryFn: async () => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return [];
      return base44.entities.Conversation.filter({ workspace_id: workspaces[0].id }, '-created_date', 5);
    },
    enabled: !!user
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Check if user should see onboarding checklist
  const showChecklist = user && !user.onboarding_completed && !user.checklist_dismissed;

  return (
    <div className="space-y-8">
      {/* Welcome Checklist for new users */}
      {showChecklist && <WelcomeChecklist />}

      {/* Daily AI Summary */}
      <DailySummary showFullVersion={false} />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-2xl font-semibold text-left normal-case lg:text-3xl">
            {greeting()}, {user?.full_name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your social media today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={dateRange} onValueChange={setDateRange}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* AI Insight Banner */}
      <Card className="bg-[#d4af37] border-0 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <CardContent className="bg-slate-50 text-[#d4af37] p-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="bg-slate-50 text-[#d4af37] px-3 text-xs font-medium rounded-md hover:bg-accent hover:text-accent-foreground h-8 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">AI Performance Insight</h3>
                <p className="text-[#d4af37] text-sm max-w-xl">Your engagement rate increased by 23% this week! Posts with video content are performing 3.2x better than images. Consider creating more Reels and Stories.


                </p>
              </div>
            </div>
            <Link to="/AnalyticsDashboard">
              <Button variant="secondary" className="bg-slate-50 text-[#d4af37] px-3 py-2 text-xs font-medium rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground h-8 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors">
                View Full Report
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Followers"
          value="183.2K"
          change={12.5}
          changeLabel="vs last week"
          icon={Users}
          iconColor="text-[#d4af37]"
          iconBg="bg-[#d4af37]/10" />

        <StatsCard
          title="Total Reach"
          value="1.2M"
          change={8.3}
          changeLabel="vs last week"
          icon={Eye}
          iconColor="text-blue-600"
          iconBg="bg-blue-50" />

        <StatsCard
          title="Engagement Rate"
          value="4.8%"
          change={15.2}
          changeLabel="vs last week"
          icon={Heart}
          iconColor="text-pink-600"
          iconBg="bg-pink-50" />

        <StatsCard
          title="Post Performance"
          value="92"
          change={5.7}
          changeLabel="AI Score"
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50" />

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Chart & Recent Posts */}
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart />
          <RecentPosts posts={posts} />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          <QuickActions />
          <SyncStatusCard accounts={accounts} />
          <UpcomingPosts posts={posts.filter((p) => p.status === 'scheduled')} />
          <ConnectedAccounts accounts={accounts} />
        </div>
      </div>
    </div>);

}