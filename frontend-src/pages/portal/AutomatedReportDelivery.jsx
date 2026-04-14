import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Send, 
  Calendar, 
  Mail, 
  FileText,
  Clock,
  Users,
  TrendingUp,
  BarChart3,
  MessageSquare,
  CheckCircle2,
  Plus,
  Trash2,
  Target,
  DollarSign,
  Activity,
  Heart,
  Eye,
  Share2,
  Settings
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AutomatedReportDelivery({ clientWorkspaceId }) {
  const queryClient = useQueryClient();

  const [newReport, setNewReport] = useState({
    workspace_id: clientWorkspaceId,
    client_workspace_id: clientWorkspaceId,
    report_name: '',
    client_email: '',
    frequency: 'monthly',
    report_type: 'comprehensive',
    custom_message: '',
    auto_send_enabled: true
  });

  const reportSections = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'engagement', label: 'Engagement', icon: TrendingUp },
    { id: 'audience', label: 'Audience', icon: Users },
    { id: 'content', label: 'Top Content', icon: MessageSquare }
  ];

  const availableKPIs = [
    { id: 'reach', label: 'Reach', icon: Users, category: 'engagement' },
    { id: 'impressions', label: 'Impressions', icon: Eye, category: 'engagement' },
    { id: 'engagement', label: 'Total Engagement', icon: Heart, category: 'engagement' },
    { id: 'engagement_rate', label: 'Engagement Rate', icon: TrendingUp, category: 'engagement' },
    { id: 'followers', label: 'Follower Count', icon: Users, category: 'growth' },
    { id: 'follower_growth', label: 'Follower Growth', icon: Activity, category: 'growth' },
    { id: 'clicks', label: 'Link Clicks', icon: Share2, category: 'traffic' },
    { id: 'conversions', label: 'Conversions', icon: Target, category: 'traffic' },
    { id: 'revenue', label: 'Revenue', icon: DollarSign, category: 'revenue' },
    { id: 'roi', label: 'ROI', icon: BarChart3, category: 'revenue' }
  ];

  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [deliveryTime, setDeliveryTime] = useState('09:00');
  const [deliveryDay, setDeliveryDay] = useState('1');

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['clientReports', clientWorkspaceId],
    queryFn: async () => {
      if (!clientWorkspaceId) return [];
      return await base44.entities.ClientReport.filter({
        client_workspace_id: clientWorkspaceId,
        status: 'active'
      });
    },
    enabled: !!clientWorkspaceId
  });

  const createReportMutation = useMutation({
    mutationFn: async (reportData) => {
      return await base44.entities.ClientReport.create(reportData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientReports'] });
      setNewReport({
        workspace_id: clientWorkspaceId,
        client_workspace_id: clientWorkspaceId,
        report_name: '',
        client_email: '',
        frequency: 'monthly',
        report_type: 'comprehensive',
        custom_message: '',
        auto_send_enabled: true
      });
      setSelectedKPIs([]);
      toast.success('Report schedule created successfully');
    },
    onError: () => {
      toast.error('Failed to create report schedule');
    }
  });

  const toggleScheduleMutation = useMutation({
    mutationFn: async ({ id, enabled }) => {
      return await base44.entities.ClientReport.update(id, {
        auto_send_enabled: enabled
      });
    },
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['clientReports'] });
      toast.success(enabled ? 'Report schedule enabled' : 'Report schedule paused');
    }
  });

  const toggleKPI = (kpiId) => {
    setSelectedKPIs(prev => 
      prev.includes(kpiId) 
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#d4af37]" />
            Schedule New Automated Report
          </CardTitle>
          <CardDescription>
            Create custom reports with tailored KPIs and automatic delivery
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="kpis">KPIs & Metrics</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportName">Report Name *</Label>
                  <Input
                    id="reportName"
                    value={newReport.report_name}
                    onChange={(e) => setNewReport({ ...newReport, report_name: e.target.value })}
                    placeholder="Monthly Performance Report"
                  />
                </div>

                <div>
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select
                    value={newReport.report_type}
                    onValueChange={(value) => setNewReport({ ...newReport, report_type: value })}
                  >
                    <SelectTrigger id="reportType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance Overview</SelectItem>
                      <SelectItem value="engagement">Engagement Analysis</SelectItem>
                      <SelectItem value="growth">Growth Tracking</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="customMessage">Custom Message (Optional)</Label>
                <Textarea
                  id="customMessage"
                  value={newReport.custom_message}
                  onChange={(e) => setNewReport({ ...newReport, custom_message: e.target.value })}
                  placeholder="Add a personalized message that will appear at the top of the report..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="kpis" className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Select KPIs to Include
                </Label>
                <p className="text-sm text-slate-500 mb-4">
                  Choose specific metrics that matter most to this client
                </p>
                
                {['engagement', 'growth', 'traffic', 'revenue'].map(category => {
                  const categoryKPIs = availableKPIs.filter(kpi => kpi.category === category);
                  return (
                    <div key={category} className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 capitalize">{category} Metrics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categoryKPIs.map((kpi) => (
                          <div
                            key={kpi.id}
                            onClick={() => toggleKPI(kpi.id)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                              selectedKPIs.includes(kpi.id)
                                ? "border-[#d4af37] bg-[#d4af37]/5"
                                : "border-slate-200 hover:border-slate-300"
                            )}
                          >
                            <Checkbox
                              checked={selectedKPIs.includes(kpi.id)}
                              onCheckedChange={() => toggleKPI(kpi.id)}
                            />
                            <kpi.icon className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-900">{kpi.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <Label>Additional Sections</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  {reportSections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-[#d4af37] transition-colors cursor-pointer"
                    >
                      <Checkbox id={section.id} />
                      <label htmlFor={section.id} className="flex items-center gap-2 cursor-pointer">
                        <section.icon className="w-4 h-4 text-slate-600" />
                        <span className="text-sm text-slate-900">{section.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientEmail">Recipient Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newReport.client_email}
                    onChange={(e) => setNewReport({ ...newReport, client_email: e.target.value })}
                    placeholder="client@example.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">Multiple emails separated by commas</p>
                </div>

                <div>
                  <Label htmlFor="frequency">Delivery Frequency *</Label>
                  <Select
                    value={newReport.frequency}
                    onValueChange={(value) => setNewReport({ ...newReport, frequency: value })}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {newReport.frequency === 'weekly' && (
                <div>
                  <Label htmlFor="deliveryDay">Delivery Day</Label>
                  <Select value={deliveryDay} onValueChange={setDeliveryDay}>
                    <SelectTrigger id="deliveryDay">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                      <SelectItem value="0">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {newReport.frequency === 'monthly' && (
                <div>
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Select defaultValue="1">
                    <SelectTrigger id="deliveryDate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st of the month</SelectItem>
                      <SelectItem value="15">15th of the month</SelectItem>
                      <SelectItem value="-1">Last day of the month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="deliveryTime">Delivery Time (UTC)</Label>
                <Input
                  id="deliveryTime"
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#d4af37]" />
                  <div>
                    <p className="font-medium text-slate-900">Enable Automatic Delivery</p>
                    <p className="text-xs text-slate-500">Report will be sent automatically at scheduled time</p>
                  </div>
                </div>
                <Switch
                  checked={newReport.auto_send_enabled !== false}
                  onCheckedChange={(checked) => setNewReport({ ...newReport, auto_send_enabled: checked })}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => createReportMutation.mutate({
                ...newReport,
                metrics_included: selectedKPIs,
                delivery_time: deliveryTime,
                delivery_day: deliveryDay
              })}
              disabled={!newReport.report_name || !newReport.client_email || createReportMutation.isPending}
              className="flex-1 bg-[#d4af37] hover:bg-[#c9a961] text-slate-950"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createReportMutation.isPending ? 'Creating...' : 'Create Report Schedule'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setNewReport({
                  workspace_id: clientWorkspaceId,
                  client_workspace_id: clientWorkspaceId,
                  report_name: '',
                  client_email: '',
                  frequency: 'monthly',
                  report_type: 'comprehensive',
                  custom_message: '',
                  auto_send_enabled: true
                });
                setSelectedKPIs([]);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#d4af37]" />
            Active Report Schedules
          </CardTitle>
          <CardDescription>
            {reports.length} scheduled report{reports.length !== 1 ? 's' : ''} • 
            {reports.filter(r => r.auto_send_enabled).length} active
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Loading schedules...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-2">No report schedules yet</p>
              <p className="text-xs text-slate-400">Create your first automated report above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all",
                    report.auto_send_enabled 
                      ? "border-[#d4af37] bg-[#d4af37]/5" 
                      : "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        report.auto_send_enabled ? "bg-[#d4af37]" : "bg-slate-300"
                      )}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{report.report_name}</h4>
                          {report.auto_send_enabled ? (
                            <Badge className="bg-green-100 text-green-700">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Paused</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Mail className="w-3 h-3" />
                            {report.client_email}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock className="w-3 h-3" />
                            {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                          </div>
                          {report.metrics_included && report.metrics_included.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Target className="w-3 h-3" />
                              {report.metrics_included.length} KPIs tracked
                            </div>
                          )}
                          {report.next_scheduled_send && (
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Send className="w-3 h-3" />
                              Next: {new Date(report.next_scheduled_send).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        {report.last_sent_at && (
                          <p className="text-xs text-slate-400 mt-2">
                            Last sent: {new Date(report.last_sent_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="ghost" size="icon" title="Edit schedule">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Switch
                        checked={report.auto_send_enabled}
                        onCheckedChange={(checked) => toggleScheduleMutation.mutate({ id: report.id, enabled: checked })}
                        title={report.auto_send_enabled ? 'Disable delivery' : 'Enable delivery'}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}