import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  Users, 
  Package,
  TrendingUp,
  CreditCard,
  Download,
  Plus,
  Edit,
  Eye,
  Star,
  Crown,
  Gift,
  ShoppingBag,
  FileText,
  BarChart3,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const _OLD_membershipTiers = [
  {
    id: '1',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    members: 245,
    perks: ['Exclusive Content', 'Early Access', 'Member Badge'],
    revenue: 2447.55,
    color: '#94a3b8'
  },
  {
    id: '2',
    name: 'Pro',
    price: 24.99,
    interval: 'month',
    members: 128,
    perks: ['Everything in Basic', '1-on-1 Consultation', 'Private Discord', 'Custom Shoutout'],
    revenue: 3198.72,
    color: '#d4af37'
  },
  {
    id: '3',
    name: 'VIP',
    price: 99.99,
    interval: 'month',
    members: 42,
    perks: ['Everything in Pro', 'Personal Mentorship', 'Exclusive Merch', 'Direct Line Access'],
    revenue: 4199.58,
    color: '#8b5cf6'
  }
];

const _OLD_digitalProducts = [
  {
    id: '1',
    name: 'Social Media Growth Guide',
    type: 'ebook',
    price: 29.99,
    sales: 156,
    revenue: 4678.44,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Content Calendar Template',
    type: 'template',
    price: 19.99,
    sales: 289,
    revenue: 5777.11,
    rating: 4.9
  },
  {
    id: '3',
    name: 'Master Class Bundle',
    type: 'course',
    price: 149.99,
    sales: 78,
    revenue: 11699.22,
    rating: 5.0
  }
];

const _OLD_revenueData = [
  { month: 'Jan', memberships: 8500, products: 4200, tips: 850 },
  { month: 'Feb', memberships: 9200, products: 5100, tips: 920 },
  { month: 'Mar', memberships: 9800, products: 6800, tips: 1100 },
  { month: 'Apr', memberships: 10500, products: 7200, tips: 1250 },
  { month: 'May', memberships: 11200, products: 8500, tips: 1400 },
  { month: 'Jun', memberships: 12100, products: 9200, tips: 1680 }
];

const _OLD_revenueBreakdown = [
  { name: 'Memberships', value: 65, color: '#d4af37' },
  { name: 'Digital Products', value: 25, color: '#3b82f6' },
  { name: 'Tips & Donations', value: 10, color: '#10b981' }
];

export default function CreatorEconomy() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['creator-economy', workspaceId],
    queryFn: async () => { 
      const [revenues, deals] = await Promise.all([
        base44.entities.Revenue.filter({ workspace_id: workspaceId, period: '30d' }),
        base44.entities.BrandDeal.filter({ workspace_id: workspaceId }),
      ]);
      return { revenues, deals, totalRevenue: revenues.reduce((s,r)=>s+(r.amount||0),0) };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [activeTab, setActiveTab] = useState('overview');

  const totalMembers = membershipTiers.reduce((sum, tier) => sum + tier.members, 0);
  const totalMRR = membershipTiers.reduce((sum, tier) => sum + tier.revenue, 0);
  const totalProductRevenue = digitalProducts.reduce((sum, product) => sum + product.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Creator Economy</h1>
          <p className="text-slate-500 mt-1">Manage memberships, digital products, and direct monetization</p>
        </div>
        <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
          <Plus className="w-4 h-4 mr-2" />
          Create Product
        </Button>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+18%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">${(totalMRR + totalProductRevenue).toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">Monthly Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-blue-100 text-blue-700">+12</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalMembers}</p>
            <p className="text-sm text-slate-500 mt-1">Active Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+8%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">{digitalProducts.reduce((sum, p) => sum + p.sales, 0)}</p>
            <p className="text-sm text-slate-500 mt-1">Products Sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+24%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">${totalMRR.toLocaleString()}</p>
            <p className="text-sm text-slate-500 mt-1">MRR</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="memberships">Memberships</TabsTrigger>
          <TabsTrigger value="products">Digital Products</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Streams</CardTitle>
                <CardDescription>Track all your creator income sources</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="memberships" fill="#d4af37" name="Memberships" />
                    <Bar dataKey="products" fill="#3b82f6" name="Products" />
                    <Bar dataKey="tips" fill="#10b981" name="Tips" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenueBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-4">
                  {revenueBreakdown.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#d4af37]/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Create Membership Tier</h3>
                    <p className="text-sm text-slate-500">Add exclusive membership benefits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Add Digital Product</h3>
                    <p className="text-sm text-slate-500">Sell guides, courses, or templates</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Enable Tips</h3>
                    <p className="text-sm text-slate-500">Let fans support you directly</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="memberships" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Membership Tiers</CardTitle>
                  <CardDescription>Manage your subscription offerings</CardDescription>
                </div>
                <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {membershipTiers.map((tier) => (
                  <Card key={tier.id} className="border-2" style={{ borderColor: tier.color + '40' }}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: tier.color + '20' }}>
                            <Crown className="w-4 h-4" style={{ color: tier.color }} />
                          </div>
                          <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mb-4">
                        <p className="text-3xl font-bold text-slate-900">${tier.price}</p>
                        <p className="text-sm text-slate-500">per {tier.interval}</p>
                      </div>

                      <div className="space-y-2 mb-4">
                        {tier.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                            {perk}
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Members</span>
                          <span className="font-semibold text-slate-900">{tier.members}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Revenue</span>
                          <span className="font-semibold" style={{ color: tier.color }}>
                            ${tier.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full mt-4">
                        View Members
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Member Management */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Sarah Johnson', tier: 'VIP', joined: '2 days ago', avatar: 'SJ' },
                  { name: 'Mike Chen', tier: 'Pro', joined: '5 days ago', avatar: 'MC' },
                  { name: 'Emily Davis', tier: 'Basic', joined: '1 week ago', avatar: 'ED' }
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 flex items-center justify-center font-semibold text-[#d4af37]">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{member.name}</p>
                        <p className="text-xs text-slate-500">Joined {member.joined}</p>
                      </div>
                    </div>
                    <Badge className={cn(
                      member.tier === 'VIP' ? 'bg-purple-100 text-purple-700' :
                      member.tier === 'Pro' ? 'bg-[#d4af37]/20 text-[#d4af37]' :
                      'bg-slate-100 text-slate-700'
                    )}>
                      {member.tier}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Digital Products</CardTitle>
                  <CardDescription>Your downloadable content and courses</CardDescription>
                </div>
                <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {digitalProducts.map((product) => (
                  <div key={product.id} className="p-4 rounded-lg border border-slate-200 hover:border-[#d4af37]/30 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                          {product.type === 'ebook' && <FileText className="w-8 h-8 text-slate-400" />}
                          {product.type === 'template' && <FileText className="w-8 h-8 text-slate-400" />}
                          {product.type === 'course' && <Package className="w-8 h-8 text-slate-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{product.name}</h3>
                            <Badge variant="outline" className="text-xs capitalize">{product.type}</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{product.rating}</span>
                            </div>
                            <span>•</span>
                            <span>{product.sales} sales</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#d4af37]">${product.price}</p>
                        <p className="text-sm text-slate-500 mt-1">${product.revenue.toLocaleString()} earned</p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-slate-200">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator Analytics</CardTitle>
              <CardDescription>Track your creator economy performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700 mb-1">Lifetime Revenue</p>
                  <p className="text-2xl font-bold text-green-900">$68,420</p>
                  <Badge className="bg-green-100 text-green-700 text-xs mt-2">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +32% vs last period
                  </Badge>
                </div>

                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-700 mb-1">Avg Revenue Per Member</p>
                  <p className="text-2xl font-bold text-blue-900">$23.85</p>
                  <p className="text-xs text-blue-600 mt-2">Across all tiers</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-700 mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-purple-900">4.2%</p>
                  <Badge className="bg-green-100 text-green-700 text-xs mt-2">
                    -1.5% improvement
                  </Badge>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="memberships" stroke="#d4af37" strokeWidth={2} name="Memberships" />
                  <Line type="monotone" dataKey="products" stroke="#3b82f6" strokeWidth={2} name="Products" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}