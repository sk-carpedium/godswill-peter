import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Target,
  Calendar,
  Download,
  Plus,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Users,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StatsCard from '@/components/dashboard/StatsCard';
import EarningsChart from '@/components/monetization/EarningsChart';
import ActiveDeals from '@/components/monetization/ActiveDeals';
import RevenueByPost from '@/components/monetization/RevenueByPost';
import RevenueInsights from '@/components/monetization/RevenueInsights';
import MonetizationStats from '@/components/monetization/MonetizationStats';
import AffiliateDashboard from '@/components/monetization/AffiliateDashboard';
import ROICalculator from '@/components/monetization/ROICalculator';
import ExportableEarnings from '@/components/monetization/ExportableEarnings';
import UnifiedEngagementHub from '@/components/monetization/UnifiedEngagementHub';

export default function Monetization() {
  const [dateRange, setDateRange] = useState('30d');

  const { data: deals = [] } = useQuery({
    queryKey: ['brand-deals'],
    queryFn: () => base44.entities.BrandDeal.list('-created_date')
  });

  const { data: revenues = [] } = useQuery({
    queryKey: ['revenues', dateRange],
    queryFn: () => base44.entities.Revenue.list('-transaction_date', 100)
  });

  const { data: posts = [] } = useQuery({
    queryKey: ['monetized-posts'],
    queryFn: () => base44.entities.Post.filter({ 'monetization.is_sponsored': true }, '-created_date', 20)
  });

  // Calculate metrics
  const totalRevenue = 12847.50;
  const activeDeals = 3;
  const avgRevenuePerPost = 245.30;
  const monthlyGrowth = 23.5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revenue & Monetization</h1>
          <p className="text-slate-500">Unified engagement analytics with complete revenue attribution</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Tabs value={dateRange} onValueChange={setDateRange}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Unified Engagement Hub */}
      <UnifiedEngagementHub />

      {/* AI Revenue Insights Banner */}
      <Card className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-0 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">AI Revenue Opportunity</h3>
                <p className="text-white/80 text-sm max-w-xl">
                  Based on your content performance and audience engagement, you could increase 
                  monthly revenue by <strong>$2,340</strong> by adding 3 more sponsored posts with 
                  affiliate links. Your posts with product reviews have 3.2x higher conversion rates.
                </p>
              </div>
            </div>
            <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-white/90 shrink-0">
              <Target className="w-4 h-4 mr-2" />
              View Recommendations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MonetizationStats
          title="Total Revenue"
          value={totalRevenue}
          change={monthlyGrowth}
          changeLabel="vs last month"
          icon={DollarSign}
          iconColor="text-[#d4af37]"
          iconBg="bg-[#d4af37]/10"
          breakdown={[
            { label: 'Sponsored', value: 7850, color: '#8b5cf6' },
            { label: 'Affiliate', value: 3240, color: '#06b6d4' },
            { label: 'Ads', value: 1757, color: '#f59e0b' }
          ]}
        />
        <MonetizationStats
          title="Active Deals"
          value={activeDeals}
          change={50}
          changeLabel="vs last month"
          icon={Briefcase}
          iconColor="text-[#d4af37]"
          iconBg="bg-[#d4af37]/10"
          prefix=""
          suffix=" deals"
        />
        <MonetizationStats
          title="Avg Revenue/Post"
          value={avgRevenuePerPost}
          change={15.2}
          changeLabel="vs last month"
          icon={TrendingUp}
          iconColor="text-[#d4af37]"
          iconBg="bg-[#d4af37]/10"
        />
        <MonetizationStats
          title="Total Payouts"
          value={9800}
          icon={CreditCard}
          iconColor="text-[#d4af37]"
          iconBg="bg-[#d4af37]/10"
        />
      </div>

      {/* Revenue Breakdown by Source */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          { source: 'Sponsored Posts', amount: 7850, percentage: 61, color: 'from-violet-500 to-purple-600', icon: Briefcase },
          { source: 'Affiliate Income', amount: 3240, percentage: 25, color: 'from-blue-500 to-cyan-600', icon: Target },
          { source: 'Platform Ads', amount: 1757, percentage: 14, color: 'from-amber-500 to-orange-600', icon: TrendingUp },
        ].map((item, i) => (
          <Card key={i} className="group hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-3 rounded-xl bg-gradient-to-br",
                  item.color
                )}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  {item.percentage}%
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mb-1">{item.source}</p>
              <p className="text-2xl font-bold text-slate-900">${item.amount.toLocaleString()}</p>
              <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full bg-gradient-to-r", item.color)}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          <EarningsChart />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RevenueByPost posts={posts} />
            <AffiliateDashboard />
          </div>
        </div>

        {/* Right Column - Deals & Insights */}
        <div className="space-y-6">
          <ExportableEarnings revenue={revenues} />
          <RevenueInsights />
          <ROICalculator />
          <ActiveDeals deals={deals} />
          
          {/* Payment Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Pending Payouts', amount: 3247, status: 'pending', date: 'Aug 1, 2024' },
                { label: 'Processing', amount: 1850, status: 'processing', date: 'Jul 28, 2024' },
                { label: 'Last Payment', amount: 4750, status: 'paid', date: 'Jul 15, 2024' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ${item.amount.toLocaleString()}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs mt-1",
                        item.status === 'paid' && "bg-emerald-100 text-emerald-700",
                        item.status === 'processing' && "bg-blue-100 text-blue-700",
                        item.status === 'pending' && "bg-amber-100 text-amber-700"
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add Brand Deal
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Sponsored Post
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download Invoice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}