import React, { useState } from 'react';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Target,
  Plus,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Eye,
  Heart,
  MessageCircle,
  MousePointerClick,
  ShoppingCart,
  Percent
} from 'lucide-react';
import { toast } from 'sonner';

const metricIcons = {
  reach: Eye,
  engagement: Heart,
  impressions: Eye,
  clicks: MousePointerClick,
  conversions: Target,
  revenue: DollarSign,
  followers: Users,
  comments: MessageCircle,
  shares: TrendingUp,
  saves: Heart,
  orders: ShoppingCart,
  engagement_rate: Percent,
  conversion_rate: Percent,
  roi: TrendingUp
};

const metricCategories = {
  engagement: ['reach', 'impressions', 'engagement', 'engagement_rate', 'followers'],
  conversion: ['clicks', 'conversions', 'conversion_rate', 'leads'],
  revenue: ['revenue', 'orders', 'roi', 'average_order_value'],
  social: ['comments', 'shares', 'saves', 'mentions']
};

export default function CustomKPIBuilder({ clientWorkspaceId, onSave }) {
  const queryClient = useQueryClient();
  const [kpis, setKpis] = useState([]);
  const [newKPI, setNewKPI] = useState({
    metric: '',
    label: '',
    target: '',
    threshold_warning: '',
    threshold_critical: '',
    show_in_dashboard: true,
    show_in_reports: true,
    priority: 'medium'
  });

  const addKPI = () => {
    if (!newKPI.metric || !newKPI.label || !newKPI.target) {
      toast.error('Please fill in all required fields');
      return;
    }

    setKpis([...kpis, { ...newKPI, id: Date.now().toString() }]);
    setNewKPI({
      metric: '',
      label: '',
      target: '',
      threshold_warning: '',
      threshold_critical: '',
      show_in_dashboard: true,
      show_in_reports: true,
      priority: 'medium'
    });
  };

  const removeKPI = (id) => {
    setKpis(kpis.filter(k => k.id !== id));
  };

  const saveKPIs = async () => {
    try {
      await api.entities.Workspace.update(clientWorkspaceId, {
        settings: {
          custom_kpis: kpis
        }
      });
      toast.success('KPIs saved successfully');
      onSave && onSave(kpis);
    } catch (error) {
      toast.error('Failed to save KPIs');
    }
  };

  const MetricIcon = metricIcons[newKPI.metric] || Target;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#d4af37]" />
            Define Client KPIs
          </CardTitle>
          <CardDescription>
            Set custom KPIs tailored to each client's business objectives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New KPI Form */}
          <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Metric Type *</Label>
                <Select value={newKPI.metric} onValueChange={(value) => setNewKPI({ ...newKPI, metric: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Engagement</p>
                      {metricCategories.engagement.map(m => (
                        <SelectItem key={m} value={m} className="capitalize">
                          {m.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </div>
                    <div className="p-2 border-t">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Conversion</p>
                      {metricCategories.conversion.map(m => (
                        <SelectItem key={m} value={m} className="capitalize">
                          {m.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </div>
                    <div className="p-2 border-t">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Revenue</p>
                      {metricCategories.revenue.map(m => (
                        <SelectItem key={m} value={m} className="capitalize">
                          {m.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Custom Label *</Label>
                <Input
                  value={newKPI.label}
                  onChange={(e) => setNewKPI({ ...newKPI, label: e.target.value })}
                  placeholder="e.g., Monthly Lead Target"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Target Value *</Label>
                <Input
                  type="number"
                  value={newKPI.target}
                  onChange={(e) => setNewKPI({ ...newKPI, target: e.target.value })}
                  placeholder="e.g., 10000"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={newKPI.priority} onValueChange={(value) => setNewKPI({ ...newKPI, priority: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Warning Threshold (%)</Label>
                <Input
                  type="number"
                  value={newKPI.threshold_warning}
                  onChange={(e) => setNewKPI({ ...newKPI, threshold_warning: e.target.value })}
                  placeholder="e.g., 70"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Alert at % of target</p>
              </div>

              <div>
                <Label>Critical Threshold (%)</Label>
                <Input
                  type="number"
                  value={newKPI.threshold_critical}
                  onChange={(e) => setNewKPI({ ...newKPI, threshold_critical: e.target.value })}
                  placeholder="e.g., 50"
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Critical alert at % of target</p>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newKPI.show_in_dashboard}
                  onCheckedChange={(checked) => setNewKPI({ ...newKPI, show_in_dashboard: checked })}
                />
                <Label>Show in Dashboard</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newKPI.show_in_reports}
                  onCheckedChange={(checked) => setNewKPI({ ...newKPI, show_in_reports: checked })}
                />
                <Label>Include in Reports</Label>
              </div>
            </div>

            <Button onClick={addKPI} className="w-full bg-[#d4af37] hover:bg-[#c9a961] text-slate-950">
              <Plus className="w-4 h-4 mr-2" />
              Add KPI
            </Button>
          </div>

          {/* KPIs List */}
          {kpis.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-slate-700">Configured KPIs ({kpis.length})</h4>
              {kpis.map((kpi) => {
                const Icon = metricIcons[kpi.metric] || Target;
                return (
                  <div key={kpi.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white">
                          <Icon className="w-5 h-5 text-[#d4af37]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{kpi.label}</h4>
                            <Badge variant="secondary" className="text-xs capitalize">{kpi.metric.replace('_', ' ')}</Badge>
                            <Badge className={
                              kpi.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              kpi.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              kpi.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-700'
                            }>
                              {kpi.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">Target: {parseFloat(kpi.target).toLocaleString()}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            {kpi.threshold_warning && <span>⚠️ Warning: {kpi.threshold_warning}%</span>}
                            {kpi.threshold_critical && <span>🚨 Critical: {kpi.threshold_critical}%</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {kpi.show_in_dashboard && <Badge variant="outline" className="text-xs">Dashboard</Badge>}
                            {kpi.show_in_reports && <Badge variant="outline" className="text-xs">Reports</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKPI(kpi.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {kpis.length > 0 && (
            <Button onClick={saveKPIs} className="w-full bg-green-600 hover:bg-green-700 text-white">
              Save All KPIs
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}