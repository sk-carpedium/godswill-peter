import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, DollarSign, TrendingUp, Package, ExternalLink, Tag, Plus, Link2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const _OLD_salesData = [
  { date: 'Mon', sales: 245, clicks: 1200, conversion: 20.4 },
  { date: 'Tue', sales: 312, clicks: 1450, conversion: 21.5 },
  { date: 'Wed', sales: 289, clicks: 1380, conversion: 21.0 },
  { date: 'Thu', sales: 356, clicks: 1520, conversion: 23.4 },
  { date: 'Fri', sales: 421, clicks: 1680, conversion: 25.1 },
  { date: 'Sat', sales: 489, clicks: 1850, conversion: 26.4 },
  { date: 'Sun', sales: 378, clicks: 1420, conversion: 26.6 }
];

const _OLD_productPerf = [
  { name: 'Summer Collection Dress', posts: 12, sales: 156, revenue: 4680, conversion: 28.5 },
  { name: 'Wireless Headphones', posts: 8, sales: 234, revenue: 11700, conversion: 31.2 },
  { name: 'Eco Water Bottle', posts: 15, sales: 445, revenue: 6675, conversion: 42.1 },
  { name: 'Smart Watch', posts: 6, sales: 89, revenue: 26700, conversion: 19.8 }
];

const _OLD_ecomPlatBreakdown = [
  { platform: 'Instagram', value: 45, color: '#d4af37' },
  { platform: 'Facebook', value: 25, color: '#3b82f6' },
  { platform: 'TikTok', value: 20, color: '#10b981' },
  { platform: 'Pinterest', value: 10, color: '#ef4444' }
];

const _OLD_topPostsEcom = [
  {
    id: '1',
    title: 'Summer Collection Launch',
    platform: 'instagram',
    clicks: 2450,
    sales: 156,
    revenue: 4680,
    date: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    title: 'Limited Time Offer',
    platform: 'facebook',
    clicks: 1890,
    sales: 234,
    revenue: 11700,
    date: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '3',
    title: 'Product Demo Video',
    platform: 'tiktok',
    clicks: 3200,
    sales: 445,
    revenue: 6675,
    date: new Date(Date.now() - 259200000).toISOString()
  }
];

export default function EcommerceTracking() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['ecommerce-tracking', workspaceId],
    queryFn: async () => { 
      const [revenues, posts] = await Promise.all([
        base44.entities.Revenue.filter({ workspace_id: workspaceId, period: '30d' }),
        base44.entities.Post.filter({ workspace_id: workspaceId, status: 'published', sort: '-created_at', limit: 20 }),
      ]);
      const byDate = {};
      revenues.forEach(r => {
        const d = new Date(r.transaction_date||r.date).toLocaleDateString('en',{month:'short',day:'numeric'});
        if (!byDate[d]) byDate[d] = { date: d, revenue: 0, orders: 0 };
        byDate[d].revenue += r.amount||0;
        byDate[d].orders++;
      });
      return { salesData: Object.values(byDate), topPosts: posts.slice(0,5), totalRevenue: revenues.reduce((s,r)=>s+(r.amount||0),0) };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">E-commerce Tracking</h1>
          <p className="text-slate-500 mt-1">Track sales and revenue driven by your social media posts</p>
        </div>
        <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
          <Plus className="w-4 h-4 mr-2" />
          Link Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Platforms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="pinterest">Pinterest</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+12.5%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">$28,450</p>
            <p className="text-sm text-slate-500 mt-1">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+8.2%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">1,234</p>
            <p className="text-sm text-slate-500 mt-1">Total Sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+3.1%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">24.2%</p>
            <p className="text-sm text-slate-500 mt-1">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-blue-100 text-blue-700">+2</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">48</p>
            <p className="text-sm text-slate-500 mt-1">Linked Products</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Product Performance</TabsTrigger>
          <TabsTrigger value="posts">Top Posts</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Sales & Conversion Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#d4af37" strokeWidth={2} name="Sales" />
                    <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#10b981" strokeWidth={2} name="Conversion %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {platformBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {platformBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.platform}</span>
                      </div>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>See which products drive the most sales from social media</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productPerformance.map((product, i) => (
                  <div key={i} className="p-4 rounded-lg border border-slate-200 hover:border-[#d4af37]/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{product.name}</h3>
                        <p className="text-sm text-slate-500">Featured in {product.posts} posts</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Sales</p>
                        <p className="text-lg font-bold text-slate-900">{product.sales}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Revenue</p>
                        <p className="text-lg font-bold text-slate-900">${(product.revenue / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Conversion</p>
                        <p className="text-lg font-bold text-slate-900">{product.conversion}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Posts</CardTitle>
              <CardDescription>Posts that drove the most sales and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPosts.map((post) => (
                  <div key={post.id} className="p-4 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{post.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="outline" className="text-xs">{post.platform}</Badge>
                          <span>{moment(post.date).fromNow()}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Clicks</p>
                        <p className="text-lg font-bold text-slate-900">{post.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Sales</p>
                        <p className="text-lg font-bold text-slate-900">{post.sales}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Revenue</p>
                        <p className="text-lg font-bold text-slate-900">${post.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">Shopify</h3>
                    <p className="text-sm text-slate-500">Connect your Shopify store to track sales automatically</p>
                  </div>
                  <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">WooCommerce</h3>
                    <p className="text-sm text-slate-500">Sync your WooCommerce products and orders</p>
                  </div>
                  <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                    <Link2 className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Tag className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">Custom Tracking Links</h3>
                    <p className="text-sm text-slate-500">Create custom UTM links for any e-commerce platform</p>
                  </div>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Link
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}