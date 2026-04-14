import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Eye,
  Download,
  ThumbsUp,
  ThumbsDown,
  Lock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import ClientDashboardBuilder from '@/components/portal/ClientDashboardBuilder';
import ClientFeedback from '@/components/portal/ClientFeedback';
import SecureDocuments from '@/components/portal/SecureDocuments';
import ClientReportGenerator from '@/components/reports/ClientReportGenerator';
import moment from 'moment';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

export default function ClientPortal() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [planAccess, setPlanAccess] = useState(true);

  useEffect(() => {
    loadUser();
    checkPlanAccess();
  }, []);

  const loadUser = async () => {
    const userData = await base44.auth.me();
    setUser(userData);
  };

  const checkPlanAccess = async () => {
    try {
      const user = await base44.auth.me();
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return;
      
      const subscriptions = await base44.entities.Subscription.filter({
        user_email: user.email,
        workspace_id: workspaces[0].id
      });
      
      const subscription = subscriptions[0];
      const plan = subscription?.plan_id || 'free';
      
      setPlanAccess(['agency'].includes(plan));
    } catch (error) {
      console.error('Failed to check plan access:', error);
      setPlanAccess(false);
    }
  };

  const { data: workspace } = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const workspaceId = urlParams.get('workspace');
      
      if (workspaceId) {
        const workspaces = await base44.entities.Workspace.filter({ id: workspaceId });
        return workspaces[0];
      }
      
      const workspaces = await base44.entities.Workspace.list();
      return workspaces[0];
    }
  });

  const { data: customKPIs = [] } = useQuery({
    queryKey: ['custom-kpis', workspace?.id],
    queryFn: async () => {
      return workspace?.settings?.custom_kpis || [];
    },
    enabled: !!workspace
  });

  const { data: dashboardLayout = [] } = useQuery({
    queryKey: ['dashboard-layout', workspace?.id],
    queryFn: async () => {
      return workspace?.settings?.custom_dashboard_layout || [];
    },
    enabled: !!workspace
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ['client-analytics', workspace?.id],
    queryFn: () => base44.entities.Analytics.filter({ workspace_id: workspace.id }),
    enabled: !!workspace
  });

  // Sample metrics for client view
  const metrics = [
    {
      label: 'Total Reach',
      value: '124.5K',
      change: '+12.3%',
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Engagement Rate',
      value: '8.4%',
      change: '+2.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'text-emerald-600'
    },
    {
      label: 'Posts Published',
      value: '47',
      change: '+5',
      trend: 'up',
      icon: CheckCircle2,
      color: 'text-violet-600'
    },
    {
      label: 'Pending Approvals',
      value: '3',
      change: '-2',
      trend: 'down',
      icon: Clock,
      color: 'text-amber-600'
    }
  ];

  const recentActivity = [
    {
      type: 'report',
      title: 'Monthly Performance Report',
      date: new Date(Date.now() - 86400000),
      status: 'available'
    },
    {
      type: 'approval',
      title: 'Q1 Campaign Content',
      date: new Date(Date.now() - 3600000 * 5),
      status: 'pending'
    },
    {
      type: 'document',
      title: 'Brand Guidelines v2.0',
      date: new Date(Date.now() - 172800000),
      status: 'shared'
    }
  ];

  const whiteLabelSettings = workspace?.settings?.white_label || {};
  const brandName = whiteLabelSettings.brand_name || 'Your Agency';
  const logoUrl = whiteLabelSettings.logo_url;
  const primaryColor = whiteLabelSettings.primary_color || '#d4af37';

  if (!planAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-md border-2 border-emerald-200">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Agency Feature</h3>
            <p className="text-slate-600 mb-6">
              Client Portal with isolated access and approval workflows is available on Agency plans
            </p>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => window.location.href = createPageUrl('Pricing')}
            >
              Upgrade to Agency Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="h-8 object-contain" />
              ) : (
                <div className="text-xl font-bold" style={{ color: primaryColor }}>
                  {brandName}
                </div>
              )}
              <Badge variant="outline" className="hidden md:inline-flex">
                Client Portal
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 hidden md:inline">
                Welcome, {user?.full_name}
              </span>
              <Button variant="outline" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <Lock className="w-4 h-4" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Custom KPIs */}
            {customKPIs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {customKPIs.filter(kpi => kpi.show_in_dashboard).map((kpi, i) => {
                  const currentValue = parseFloat(kpi.actual || kpi.current_value || 0);
                  const progress = (currentValue / parseFloat(kpi.target)) * 100;
                  const status = progress >= 100 ? 'success' : 
                                progress >= parseFloat(kpi.threshold_warning || 70) ? 'warning' : 'critical';
                  
                  return (
                    <Card key={i} className={cn(
                      "border-2",
                      status === 'success' ? 'border-green-200 bg-green-50' :
                      status === 'warning' ? 'border-orange-200 bg-orange-50' :
                      'border-red-200 bg-red-50'
                    )}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", 
                            status === 'success' ? 'bg-green-100' :
                            status === 'warning' ? 'bg-orange-100' : 'bg-red-100'
                          )}>
                            <Target className={cn("w-5 h-5",
                              status === 'success' ? 'text-green-600' :
                              status === 'warning' ? 'text-orange-600' : 'text-red-600'
                            )} />
                          </div>
                          <Badge className={cn(
                            status === 'success' ? 'bg-green-600 text-white' :
                            status === 'warning' ? 'bg-orange-600 text-white' : 'bg-red-600 text-white'
                          )}>
                            {progress.toFixed(0)}%
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">{currentValue.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">{kpi.label}</p>
                        <p className="text-xs text-slate-400 mt-1">Target: {parseFloat(kpi.target).toLocaleString()}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Standard Metrics if no custom KPIs */}
            {customKPIs.length === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", 
                          metric.color === 'text-blue-600' ? 'bg-blue-50' :
                          metric.color === 'text-emerald-600' ? 'bg-emerald-50' :
                          metric.color === 'text-violet-600' ? 'bg-violet-50' : 'bg-amber-50'
                        )}>
                          <metric.icon className={cn("w-5 h-5", metric.color)} />
                        </div>
                        <Badge variant="outline" className={cn(
                          metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        )}>
                          {metric.change}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                      <p className="text-sm text-slate-500">{metric.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Custom Dashboard Widgets */}
            {dashboardLayout.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dashboardLayout.filter(w => w.visible).map((widget) => (
                  <Card key={widget.id} className={cn(
                    widget.size === 'full' && 'lg:col-span-2',
                    widget.size === 'large' && 'lg:col-span-2'
                  )}>
                    <CardHeader>
                      <CardTitle className="text-base">{widget.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {widget.type === 'line_chart' && (
                        <ResponsiveContainer width="100%" height={200}>
                          <LineChart data={analytics.slice(0, 7).reverse().map(a => ({
                            date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                            value: a.metrics?.engagement || 0
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <ChartTooltip />
                            <Line type="monotone" dataKey="value" stroke={primaryColor} strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                      {widget.type === 'kpi_card' && (
                        <div className="text-center py-8">
                          <p className="text-4xl font-bold" style={{ color: primaryColor }}>
                            {(kpi.actual || 0).toLocaleString()}
                          </p>
                          <p className="text-slate-500 mt-2">Custom KPI</p>
                        </div>
                      )}
                      {!['line_chart', 'kpi_card'].includes(widget.type) && (
                        <div className="h-48 bg-slate-50 rounded-lg flex items-center justify-center">
                          <p className="text-slate-400 text-sm">{widget.name} Preview</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <ClientDashboardBuilder primaryColor={primaryColor} />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          activity.type === 'report' ? 'bg-blue-50' :
                          activity.type === 'approval' ? 'bg-amber-50' : 'bg-violet-50'
                        )}>
                          {activity.type === 'report' && <FileText className="w-5 h-5 text-blue-600" />}
                          {activity.type === 'approval' && <Clock className="w-5 h-5 text-amber-600" />}
                          {activity.type === 'document' && <Lock className="w-5 h-5 text-violet-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{activity.title}</p>
                          <p className="text-sm text-slate-500">{moment(activity.date).fromNow()}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <ClientReportGenerator workspace={workspace} isClientView={true} />
          </TabsContent>

          <TabsContent value="approvals">
            <ClientFeedback primaryColor={primaryColor} />
          </TabsContent>

          <TabsContent value="documents">
            <SecureDocuments primaryColor={primaryColor} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      {!whiteLabelSettings.hide_powered_by && (
        <div className="border-t border-slate-200 mt-12 py-6">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm text-slate-500">
              {whiteLabelSettings.custom_footer_text || `Powered by ${brandName}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}