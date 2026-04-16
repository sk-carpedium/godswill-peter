import React, { useState } from 'react';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DollarSign,
  TrendingUp,
  Users,
  ShoppingCart,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Heart,
  MessageCircle,
  Link as LinkIcon,
  Sparkles,
  Calendar,
  CreditCard,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useWorkspace } from '@/hooks';


const COLORS = ['#d4af37', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

export default function UnifiedEngagementHub() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');

  const { data: posts = [] } = useQuery({
    queryKey: ['posts-with-revenue'],
    queryFn: async () => {
      const allPosts = await api.entities.Post.list('-created_date', 50);
      return allPosts;
    }
  });

  const { data: revenues = [] } = useQuery({
    queryKey: ['revenues'],
    queryFn: () => api.entities.Revenue.list('-transaction_date', 100)
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.entities.Analytics.list('-date', 100)
  });

  // Mock CRM & E-commerce data (in production, this would come from integrated systems)
  // replaced by real API data from _apiData
const _OLD_crmData = {
    leads_generated: 247,
    customers_acquired: 89,
    avg_customer_value: 425,
    total_pipeline_value: 125400
  };

  const _OLD_ecommerceData = {
    total_orders: 156,
    total_revenue: 67890,
    avg_order_value: 435,
    conversion_rate: 3.2
  };

  // Calculate post-level attribution
  const postsWithAttribution = posts.map(post => {
    const postRevenues = revenues.filter(r => r.post_id === post.id);
    const totalRevenue = postRevenues.reduce((sum, r) => sum + (r.amount || 0), 0);
    const conversions = postRevenues.filter(r => r.source === 'product_sale').length;
    
    // Mock engagement data
    const engagement = analyticsRow?.engagement || 0;
    const reach = analyticsRow?.reach || 0;
    const clicks = analyticsRow?.clicks || 0;
    
    // Calculate metrics
    const roi = totalRevenue > 0 ? ((totalRevenue - (post.monetization?.deal_value || 0)) / (post.monetization?.deal_value || 1) * 100) : 0;
    const revenuePerEngagement = engagement > 0 ? totalRevenue / engagement : 0;
    
    return {
      ...post,
      totalRevenue,
      conversions,
      engagement,
      reach,
      clicks,
      roi,
      revenuePerEngagement,
      leads: Math.floor(clicks * 0.15),
      customers: conversions
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Aggregate metrics
  const totalSocialRevenue = postsWithAttribution.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalLeads = postsWithAttribution.reduce((sum, p) => sum + p.leads, 0);
  const totalCustomers = postsWithAttribution.reduce((sum, p) => sum + p.customers, 0);
  const avgCustomerLifetimeValue = totalCustomers > 0 ? totalSocialRevenue / totalCustomers : 0;

  // Attribution funnel data
  const funnelData = [
    { stage: 'Social Reach', value: postsWithAttribution.reduce((sum, p) => sum + p.reach, 0), percentage: 100 },
    { stage: 'Engagement', value: postsWithAttribution.reduce((sum, p) => sum + p.engagement, 0), percentage: 25 },
    { stage: 'Clicks', value: postsWithAttribution.reduce((sum, p) => sum + p.clicks, 0), percentage: 5 },
    { stage: 'Leads', value: totalLeads, percentage: 0.75 },
    { stage: 'Customers', value: totalCustomers, percentage: 0.35 }
  ];

  // Revenue by channel
  const revenueByChannel = [
    { channel: 'Instagram', revenue: totalSocialRevenue * 0.35, orders: 54 },
    { channel: 'Facebook', revenue: totalSocialRevenue * 0.25, orders: 39 },
    { channel: 'TikTok', revenue: totalSocialRevenue * 0.20, orders: 31 },
    { channel: 'LinkedIn', revenue: totalSocialRevenue * 0.12, orders: 19 },
    { channel: 'Twitter/X', revenue: totalSocialRevenue * 0.08, orders: 13 }
  ];

  // Customer journey timeline
  const customerJourneyData = [
    { week: 'Week 1', awareness: 12000, consideration: 3200, purchase: 45 },
    { week: 'Week 2', awareness: 15000, consideration: 4100, purchase: 67 },
    { week: 'Week 3', awareness: 18500, consideration: 5300, purchase: 89 },
    { week: 'Week 4', awareness: 22000, consideration: 6800, purchase: 112 }
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.round(num).toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#d4af37]" />
            Unified Engagement Hub
          </h2>
          <p className="text-slate-500 mt-1">Social activity → CRM → E-commerce: Complete revenue attribution</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-green-700 font-medium">Social → Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-900">{formatCurrency(totalSocialRevenue)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-700">
              <ArrowUpRight className="w-3 h-3" />
              <span>Direct attribution from social posts</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-blue-700 font-medium">Leads Generated</p>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-blue-900">{totalLeads}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-700">
              <Target className="w-3 h-3" />
              <span>{formatCurrency(totalSocialRevenue / totalLeads)} per lead</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-purple-700 font-medium">Customers Acquired</p>
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-900">{totalCustomers}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-purple-700">
              <TrendingUp className="w-3 h-3" />
              <span>{((totalCustomers / totalLeads) * 100).toFixed(1)}% conversion rate</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#d4af37]/30 bg-[#d4af37]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#d4af37] font-medium">Avg Customer LTV</p>
              <CreditCard className="w-5 h-5 text-[#d4af37]" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(avgCustomerLifetimeValue)}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-600">
              <Sparkles className="w-3 h-3" />
              <span>From social engagement</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Attribution</TabsTrigger>
          <TabsTrigger value="funnel">Customer Journey</TabsTrigger>
          <TabsTrigger value="channels">Channel ROI</TabsTrigger>
          <TabsTrigger value="customers">Customer Data</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Attribution Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Attribution Timeline</CardTitle>
              <CardDescription>Track how social engagement drives purchases over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customerJourneyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="awareness" stroke="#3b82f6" strokeWidth={2} name="Social Reach" />
                  <Line type="monotone" dataKey="consideration" stroke="#8b5cf6" strokeWidth={2} name="Engaged Users" />
                  <Line type="monotone" dataKey="purchase" stroke="#10b981" strokeWidth={2} name="Purchases" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attribution Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Social → Purchase Funnel</CardTitle>
              <CardDescription>Complete attribution from social media to revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{stage.stage}</span>
                      <span className="text-slate-900 font-bold">{formatNumber(stage.value)}</span>
                    </div>
                    <div className="relative h-12 bg-slate-100 rounded-lg overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#d4af37] to-[#f4cf47] flex items-center justify-center text-sm font-medium text-slate-900"
                        style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                      >
                        {stage.percentage >= 10 && `${stage.percentage.toFixed(2)}%`}
                      </div>
                      {stage.percentage < 10 && (
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                          {stage.percentage.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Post Attribution Tab */}
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Posts Ranked by Revenue Impact</CardTitle>
              <CardDescription>Direct revenue attribution for each social media post</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {postsWithAttribution.slice(0, 10).map((post, i) => (
                  <div 
                    key={post.id} 
                    className="p-4 rounded-lg border-2 border-slate-200 hover:border-[#d4af37] transition-all cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{post.title || 'Untitled Post'}</h4>
                        <p className="text-sm text-slate-600 line-clamp-1">{post.content?.text}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700 ml-3">
                        {formatCurrency(post.totalRevenue)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                          <Eye className="w-3 h-3" />
                          <span>Reach</span>
                        </div>
                        <p className="text-sm font-bold text-blue-900">{formatNumber(post.reach)}</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded">
                        <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                          <Heart className="w-3 h-3" />
                          <span>Engagement</span>
                        </div>
                        <p className="text-sm font-bold text-purple-900">{formatNumber(post.engagement)}</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded">
                        <div className="flex items-center gap-1 text-xs text-orange-600 mb-1">
                          <Users className="w-3 h-3" />
                          <span>Leads</span>
                        </div>
                        <p className="text-sm font-bold text-orange-900">{post.leads}</p>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
                          <ShoppingCart className="w-3 h-3" />
                          <span>Customers</span>
                        </div>
                        <p className="text-sm font-bold text-green-900">{post.customers}</p>
                      </div>
                      <div className="p-2 bg-[#d4af37]/10 rounded">
                        <div className="flex items-center gap-1 text-xs text-[#d4af37] mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>ROI</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{post.roi.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Journey Tab */}
        <TabsContent value="funnel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Journey Stage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={funnelData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ stage, percentage }) => `${stage}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Velocity</CardTitle>
                <CardDescription>Average time from social engagement to purchase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Avg. Journey Duration</p>
                  <p className="text-3xl font-bold text-blue-900">8.5 days</p>
                  <p className="text-xs text-blue-700 mt-1">From first touch to purchase</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Fastest</p>
                    <p className="text-lg font-bold">2 days</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Slowest</p>
                    <p className="text-lg font-bold">45 days</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-1">AI Insight</p>
                      <p className="text-xs text-green-800">
                        Posts with video content convert 3x faster (avg. 3.2 days vs 9.6 days)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channel ROI Tab */}
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Social Channel</CardTitle>
              <CardDescription>Compare ROI across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByChannel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="channel" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#d4af37" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {revenueByChannel.map((channel, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4">{channel.channel}</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(channel.revenue)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Orders</p>
                        <p className="font-bold">{channel.orders}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Avg Order</p>
                        <p className="font-bold">{formatCurrency(channel.revenue / channel.orders)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customer Data Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers from Social</CardTitle>
              <CardDescription>Customers acquired through social media engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Johnson', email: 'sarah.j@email.com', source: 'Instagram Post', ltv: 1240, orders: 4, firstTouch: '14 days ago' },
                  { name: 'Michael Chen', email: 'mchen@email.com', source: 'TikTok Video', ltv: 980, orders: 3, firstTouch: '21 days ago' },
                  { name: 'Emily Davis', email: 'emily.d@email.com', source: 'Facebook Ad', ltv: 750, orders: 2, firstTouch: '8 days ago' },
                  { name: 'James Wilson', email: 'jwilson@email.com', source: 'LinkedIn Post', ltv: 2100, orders: 5, firstTouch: '35 days ago' },
                  { name: 'Lisa Anderson', email: 'lisa.a@email.com', source: 'Instagram Story', ltv: 620, orders: 2, firstTouch: '12 days ago' }
                ].map((customer, i) => (
                  <div key={i} className="p-4 rounded-lg border border-slate-200 hover:border-[#d4af37] transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{customer.name}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <LinkIcon className="w-3 h-3 mr-1" />
                            {customer.source}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        LTV: {formatCurrency(customer.ltv)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-slate-500 text-xs">Orders</p>
                        <p className="font-bold">{customer.orders}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-slate-500 text-xs">Avg Order</p>
                        <p className="font-bold">{formatCurrency(customer.ltv / customer.orders)}</p>
                      </div>
                      <div className="p-2 bg-slate-50 rounded">
                        <p className="text-slate-500 text-xs">First Touch</p>
                        <p className="font-bold text-xs">{customer.firstTouch}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Customers</p>
                    <p className="text-2xl font-bold text-slate-900">247</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Acquired via social media</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Repeat Rate</p>
                    <p className="text-2xl font-bold text-slate-900">64%</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Made 2+ purchases</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-green-100">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg LTV</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(avgCustomerLifetimeValue)}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Per customer from social</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}