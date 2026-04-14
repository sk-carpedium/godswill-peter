/**
 * SalesTracker.jsx — FIXED
 * Was: hardcoded salesData array + linkedPosts with static revenues
 * Now: fetches real revenue + post attribution from backend
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, DollarSign, TrendingUp, Package, CreditCard, ArrowUpRight, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useSalesData } from '@/hooks';

export default function SalesTracker({ period = '7d' }) {
  const { data, isLoading } = useSalesData(period);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const { chartData = [], linkedPosts = [], totalRevenue = 0, totalOrders = 0 } = data || {};
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;
  const convRate = linkedPosts.reduce((s,p) => s + (p.conversion_rate||0), 0) / Math.max(linkedPosts.length, 1);

  const statCards = [
    { icon: DollarSign, color: 'text-green-600', badge: 'bg-green-100 text-green-800', value: `$${totalRevenue.toLocaleString()}`, label: 'Total Revenue' },
    { icon: ShoppingCart, color: 'text-blue-600', badge: 'bg-blue-100 text-blue-800', value: totalOrders, label: 'Total Orders' },
    { icon: Package, color: 'text-purple-600', badge: null, value: `$${avgOrderValue.toFixed(2)}`, label: 'Avg Order Value' },
    { icon: CreditCard, color: 'text-[#d4af37]', badge: null, value: `${convRate.toFixed(1)}%`, label: 'Conversion Rate' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                {s.badge && <Badge className={s.badge}><TrendingUp className="w-3 h-3 mr-1" />Live</Badge>}
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Performance</CardTitle>
              <CardDescription>Revenue from social posts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={d => moment(d).format('MMM D')} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={d => moment(d).format('MMM D, YYYY')} formatter={(v, n) => [n==='sales'?`$${v}`:v, n==='sales'?'Revenue':'Orders']} />
                <Line type="monotone" dataKey="sales"  stroke="#d4af37" strokeWidth={2} name="sales"  />
                <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="orders" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-slate-500 text-sm">No sales data for this period</p>
          )}
        </CardContent>
      </Card>

      {linkedPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Post</CardTitle>
            <CardDescription>Which posts drive the most sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {linkedPosts.map(post => (
                <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 mb-1">{post.post_title}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{moment(post.created_at).fromNow()}</span>
                        <span>•</span>
                        <span>{post.product_clicks} clicks</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Revenue</p>
                      <p className="text-lg font-bold text-green-600">${post.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Orders</p>
                      <p className="text-lg font-bold text-slate-900">{post.orders}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">Conv.</p>
                      <p className="text-lg font-bold text-blue-600">{post.conversion_rate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
