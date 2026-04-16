import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, TrendingUp, Package, Users, DollarSign, BarChart3, ExternalLink, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const _OLD_mockStats = [
  { label: 'Total Revenue', value: '$24,580', change: '+12.4%', positive: true, icon: DollarSign },
  { label: 'Orders', value: '1,284', change: '+8.1%', positive: true, icon: ShoppingBag },
  { label: 'Products', value: '342', change: '+3', positive: true, icon: Package },
  { label: 'Customers', value: '9,841', change: '+5.7%', positive: true, icon: Users },
];

const _OLD_mockProducts = [
  { name: 'Premium Hoodie', sales: 284, revenue: '$8,520', stock: 48, status: 'active' },
  { name: 'Logo Tee', sales: 512, revenue: '$7,680', stock: 120, status: 'active' },
  { name: 'Snapback Cap', sales: 198, revenue: '$4,950', stock: 0, status: 'out_of_stock' },
  { name: 'Tote Bag', sales: 340, revenue: '$3,400', stock: 75, status: 'active' },
];

export default function Shopify() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData, isLoading } = useQuery({
    queryKey: ['shopify-data', workspaceId],
    queryFn: async () => { 
      const [integration, revenue] = await Promise.all([
        api.entities.Integration.filter({ workspace_id: workspaceId, integration_type: 'shopify' }).then(r => r[0] || null),
        api.entities.Revenue.filter({ workspace_id: workspaceId, source: 'shopify', period: '30d' }),
      ]);
      const totalRevenue = revenue.reduce((s,r) => s+(r.amount||0), 0);
      const orders = revenue.length;
      return {
        connected: !!integration,
        stats: [
          { label: 'Total Revenue',   value: '$' + totalRevenue.toLocaleString(), change: '', positive: true },
          { label: 'Orders',          value: String(orders),                       change: '', positive: true },
          { label: 'Avg Order Value', value: orders>0?'$'+(totalRevenue/orders).toFixed(0):'$0', change: '', positive: true },
          { label: 'Integration',     value: integration?.status || 'disconnected', change: '', positive: !!integration },
        ],
        products: integration?.settings?.top_products || [],
      };
         },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['shopify-integration', workspaceId],
    queryFn: async () => { 
      const integration = await api.entities.Integration.filter({ workspace_id: workspaceId, integration_type: 'shopify' }).then(r => r[0] || null);
      return integration;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    api.entities.Integration.filter({ workspace_id: localStorage.getItem('workspace_id')||'', integration_type: 'shopify' })
      .then(ints => api.entities.Integration.sync(ints[0]?.id, 'shopify'))
      .catch(() => null)
      .finally(() => setSyncing(false));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#96bf48]/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#96bf48">
              <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192-.098 0-1.87-.038-1.87-.038s-1.251-1.232-1.388-1.368v20.889zM12.494 7.006s-.658-.193-1.734-.193c-2.778 0-4.119 1.735-4.119 3.41 0 1.87 1.29 2.758 2.508 3.547 1.023.66 1.388 1.12 1.388 1.735 0 .852-.678 1.348-1.562 1.348-1.332 0-2.065-.833-2.065-.833l-.368 1.734s.891.696 2.354.696c2.28 0 3.837-1.425 3.837-3.373 0-1.812-1.29-2.758-2.374-3.45-1.023-.66-1.522-1.083-1.522-1.773 0-.677.562-1.23 1.562-1.23.967 0 1.753.387 1.753.387l.342-1.705zM8.19.388C8.19.388 7.73.194 6.764.194 4.68.194 3.68 1.465 3.68 2.8c0 1.272.888 2.066 2.07 2.85.95.628 1.327 1.063 1.327 1.716 0 .83-.66 1.31-1.527 1.31-1.3 0-2.01-.81-2.01-.81l-.36 1.69s.87.68 2.295.68c2.225 0 3.746-1.39 3.746-3.29C9.22 3.39 7.957 2.47 6.898 1.8 5.9 1.16 5.415.74 5.415.1V0l2.775.388z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Shopify Store</h1>
            <p className="text-slate-500">Manage your store, products, and social commerce</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#96bf48]/10 text-[#96bf48] border-0">Connected</Badge>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button size="sm" className="bg-[#96bf48] hover:bg-[#7ea83b] text-white" asChild>
            <a href="https://shopify.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Store
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(_apiData?.stats || []).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`text-xs font-medium mt-1 ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.change} this month
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-[#96bf48]/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#96bf48]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#96bf48]" />
            Top Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(_apiData?.products || []).map((product) => (
              <div key={product.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#96bf48]/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-[#96bf48]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.sales} sales · Stock: {product.stock}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-900">{product.revenue}</span>
                  <Badge
                    variant="secondary"
                    className={product.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-600 border-0'}
                  >
                    {product.status === 'active' ? 'Active' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Social Commerce */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#96bf48]" />
            Social Commerce Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Instagram Shopping', 'Facebook Shop', 'Pinterest Catalog'].map((channel) => (
              <div key={channel} className="p-4 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{channel}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}