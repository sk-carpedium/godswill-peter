import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ExternalLink,
  TrendingUp,
  MousePointerClick,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Plus,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const _OLD_affiliateLinks = [
  {
    id: '1',
    product_name: 'Premium Headphones',
    url: 'https://amzn.to/xyz123',
    merchant: 'Amazon Associates',
    commission_rate: 8,
    total_clicks: 1240,
    conversions: 89,
    revenue: 534,
    conversion_rate: 7.2
  },
  {
    id: '2',
    product_name: 'Fitness Tracker',
    url: 'https://bit.ly/fitness-tracker',
    merchant: 'BestBuy Affiliate',
    commission_rate: 5,
    total_clicks: 890,
    conversions: 45,
    revenue: 337,
    conversion_rate: 5.1
  },
  {
    id: '3',
    product_name: 'Coffee Subscription',
    url: 'https://coffee.co/ref/abc',
    merchant: 'Direct',
    commission_rate: 20,
    total_clicks: 560,
    conversions: 67,
    revenue: 804,
    conversion_rate: 12.0
  }
];

export default function AffiliateDashboard() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['affiliate-links', workspaceId],
    queryFn: async () => { 
      const revenues = await base44.entities.Revenue.filter({ workspace_id: workspaceId, source: 'affiliate' });
      const byPost = {};
      revenues.forEach(r => {
        const key = r.post_id || r.id;
        if (!byPost[key]) byPost[key] = { id: key, post_id: r.post_id, platform: r.platform||'unknown', clicks: 0, conversions: 0, revenue: 0 };
        byPost[key].conversions++;
        byPost[key].revenue += r.amount||0;
      });
      return Object.values(byPost);
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (link, id) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalRevenue = affiliateLinks.reduce((sum, link) => sum + link.revenue, 0);
  const totalClicks = affiliateLinks.reduce((sum, link) => sum + link.total_clicks, 0);
  const totalConversions = affiliateLinks.reduce((sum, link) => sum + link.conversions, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="text-lg">Affiliate Marketing</CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Track your affiliate links and commissions
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <DollarSign className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-emerald-900">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-700">Total Earned</p>
          </div>
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <MousePointerClick className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-900">
              {totalClicks.toLocaleString()}
            </p>
            <p className="text-xs text-blue-700">Total Clicks</p>
          </div>
          <div className="p-4 rounded-lg bg-violet-50 border border-violet-200">
            <ShoppingCart className="w-5 h-5 text-violet-600 mb-2" />
            <p className="text-2xl font-bold text-violet-900">
              {totalConversions}
            </p>
            <p className="text-xs text-violet-700">Conversions</p>
          </div>
        </div>

        {/* Affiliate Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700">Your Affiliate Links</h4>
          {affiliateLinks.map((link) => (
            <div
              key={link.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-violet-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-slate-900">{link.product_name}</h5>
                  <p className="text-sm text-slate-500">{link.merchant}</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {link.commission_rate}% commission
                </Badge>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <p className="text-lg font-bold text-slate-900">{link.total_clicks}</p>
                  <p className="text-xs text-slate-500">Clicks</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <p className="text-lg font-bold text-slate-900">{link.conversions}</p>
                  <p className="text-xs text-slate-500">Sales</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-slate-50">
                  <p className="text-lg font-bold text-emerald-600">{link.conversion_rate}%</p>
                  <p className="text-xs text-slate-500">CVR</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-emerald-50">
                  <p className="text-lg font-bold text-emerald-700">${link.revenue}</p>
                  <p className="text-xs text-emerald-600">Earned</p>
                </div>
              </div>

              {/* Link Actions */}
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                  <code className="text-xs text-slate-600 truncate flex-1">
                    {link.url}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleCopy(link.url, link.id)}
                  >
                    {copiedId === link.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </Button>
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}