import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  Bell, 
  TrendingUp, 
  Users, 
  X, 
  ExternalLink,
  Shield,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/api/client';
import { toast } from 'sonner';
import moment from 'moment';

const severityConfig = {
  urgent: {
    color: 'text-red-600 bg-red-50 border-red-200',
    icon: AlertTriangle,
    badge: 'bg-red-600 text-white'
  },
  high: {
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    icon: AlertTriangle,
    badge: 'bg-orange-600 text-white'
  },
  medium: {
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    icon: Bell,
    badge: 'bg-yellow-600 text-white'
  },
  low: {
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    icon: Activity,
    badge: 'bg-blue-600 text-white'
  }
};

const alertTypeIcons = {
  sentiment_spike: TrendingUp,
  crisis_detected: AlertTriangle,
  high_influence: Users,
  keyword_threshold: Bell,
  competitor_activity: Shield
};

export default function AlertsPanel({ workspaceId }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(loadAlerts, 300000);
    return () => clearInterval(interval);
  }, [workspaceId]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.functions.invoke('socialListening', {
        action: 'check_alerts',
        workspace_id: workspaceId
      });
      
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
    toast.success('Alert dismissed');
  };

  const viewAlertDetails = (alert) => {
    // Navigate to mentions with filter
    window.location.href = `#mentions?ids=${alert.mentions.join(',')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-slate-400" />
            Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No active alerts</p>
            <p className="text-xs text-slate-400 mt-1">All systems are running smoothly</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-red-600" />
            Active Alerts
            <Badge className="bg-red-600 text-white">{alerts.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadAlerts}>
            <Activity className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const config = severityConfig[alert.severity] || severityConfig.medium;
              const Icon = config.icon;
              const TypeIcon = alertTypeIcons[alert.type] || Bell;

              return (
                <Alert key={index} className={cn('border-2', config.color)}>
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg', config.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="w-4 h-4" />
                          <Badge className={config.badge}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <AlertDescription className="text-sm font-medium mb-2">
                        {alert.message}
                      </AlertDescription>
                      {alert.mentions && alert.mentions.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => viewAlertDetails(alert)}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View {alert.mentions.length} Mention{alert.mentions.length > 1 ? 's' : ''}
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}