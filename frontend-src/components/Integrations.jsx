import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Mail, 
  Database, 
  Zap, 
  Check, 
  Plus,
  Settings,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { ContextualHelp, InlineHelp } from '@/components/FeatureTooltip';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const integrationTypes = [
  {
    id: 'email',
    name: 'Email Marketing',
    description: 'Sync contacts and send campaigns',
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    integrations: [
      {
        id: 'mailchimp',
        name: 'Mailchimp',
        logo: '🐵',
        description: 'Sync your audience to Mailchimp lists',
        requiresOAuth: false,
        fields: ['api_key', 'list_id']
      },
      {
        id: 'sendgrid',
        name: 'SendGrid',
        logo: '📧',
        description: 'Send email campaigns via SendGrid',
        requiresOAuth: false,
        fields: ['api_key']
      },
      {
        id: 'activecampaign',
        name: 'ActiveCampaign',
        logo: '🎯',
        description: 'Marketing automation and email campaigns',
        requiresOAuth: false,
        fields: ['api_url', 'api_key']
      },
      {
        id: 'constant_contact',
        name: 'Constant Contact',
        logo: '✉️',
        description: 'Email marketing and social campaigns',
        requiresOAuth: false,
        fields: ['api_key', 'access_token']
      },
      {
        id: 'convertkit',
        name: 'ConvertKit',
        logo: '📨',
        description: 'Email marketing for creators',
        requiresOAuth: false,
        fields: ['api_key', 'api_secret']
      },
      {
        id: 'custom_email',
        name: 'Custom Email Tool',
        logo: '🔧',
        description: 'Connect any email marketing platform with API',
        requiresOAuth: false,
        fields: ['api_endpoint', 'api_key', 'api_secret']
      }
    ]
  },
  {
    id: 'crm',
    name: 'CRM Systems',
    description: 'Sync contacts and track leads',
    icon: Database,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    integrations: [
      {
        id: 'salesforce',
        name: 'Salesforce',
        logo: '☁️',
        description: 'Sync leads and contacts to Salesforce',
        requiresOAuth: true,
        appConnector: 'salesforce'
      },
      {
        id: 'hubspot',
        name: 'HubSpot',
        logo: '🔶',
        description: 'Sync contacts and track engagement',
        requiresOAuth: true,
        appConnector: 'hubspot'
      },
      {
        id: 'pipedrive',
        name: 'Pipedrive',
        logo: '📊',
        description: 'Sales CRM for small teams',
        requiresOAuth: false,
        fields: ['api_token', 'company_domain']
      },
      {
        id: 'zoho_crm',
        name: 'Zoho CRM',
        logo: '🔷',
        description: 'Customer relationship management',
        requiresOAuth: false,
        fields: ['api_key', 'organization_id']
      },
      {
        id: 'monday',
        name: 'Monday.com',
        logo: '📅',
        description: 'Work OS and CRM platform',
        requiresOAuth: false,
        fields: ['api_token', 'board_id']
      },
      {
        id: 'custom_crm',
        name: 'Custom CRM',
        logo: '🛠️',
        description: 'Connect any CRM platform with API',
        requiresOAuth: false,
        fields: ['api_endpoint', 'api_key', 'api_secret']
      }
    ]
  },
  {
    id: 'automation',
    name: 'Automation',
    description: 'Connect to automation tools',
    icon: Zap,
    color: 'text-[#d4af37]',
    bgColor: 'bg-[#d4af37]/10',
    integrations: [
      {
        id: 'zapier',
        name: 'Zapier',
        logo: '⚡',
        description: 'Connect to 5000+ apps via Zapier',
        requiresOAuth: false,
        fields: ['api_key']
      },
      {
        id: 'make',
        name: 'Make (Integromat)',
        logo: '🔄',
        description: 'Visual automation platform',
        requiresOAuth: false,
        fields: ['api_key', 'organization_id']
      },
      {
        id: 'n8n',
        name: 'n8n',
        logo: '🔗',
        description: 'Open-source workflow automation',
        requiresOAuth: false,
        fields: ['api_endpoint', 'api_key']
      },
      {
        id: 'ifttt',
        name: 'IFTTT',
        logo: '🌐',
        description: 'Connect apps and devices',
        requiresOAuth: false,
        fields: ['webhook_key']
      },
      {
        id: 'custom_automation',
        name: 'Custom Automation Tool',
        logo: '⚙️',
        description: 'Connect any automation platform with webhooks or API',
        requiresOAuth: false,
        fields: ['api_endpoint', 'api_key', 'webhook_url']
      }
    ]
  }
];

export default function Integrations() {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [setupData, setSetupData] = useState({});
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
    if (workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  };

  const { data: activeIntegrations = [], isLoading } = useQuery({
    queryKey: ['integrations', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return await base44.entities.Integration.filter({ workspace_id: workspaceId });
    },
    enabled: !!workspaceId
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Integration.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      setShowSetupDialog(false);
      setSetupData({});
      toast.success('Integration connected successfully');
    },
    onError: (error) => {
      toast.error('Failed to connect integration: ' + error.message);
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.Integration.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('Integration disconnected');
    }
  });

  const syncIntegrationMutation = useMutation({
    mutationFn: async (integration) => {
      // Call sync function
      return await base44.functions.invoke('syncIntegration', {
        integration_id: integration.id,
        integration_type: integration.integration_type
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['integrations']);
      toast.success('Sync completed');
    },
    onError: (error) => {
      toast.error('Sync failed: ' + error.message);
    }
  });

  const handleSetup = (integration) => {
    setSelectedIntegration(integration);
    setShowSetupDialog(true);
    setSetupData({
      workspace_id: workspaceId,
      integration_type: integration.id,
      integration_name: integration.name,
      credentials: {},
      settings: {
        sync_enabled: true,
        sync_frequency: 'daily',
        sync_direction: 'one-way'
      }
    });
  };

  const handleConnectOAuth = async (integration) => {
    // For OAuth integrations using app connectors
    toast.info('Redirecting to authorization...');
    // This would trigger the OAuth flow
  };

  const handleSaveIntegration = () => {
    createIntegrationMutation.mutate(setupData);
  };

  const isIntegrationConnected = (integrationId) => {
    return activeIntegrations.some(i => i.integration_type === integrationId && i.status === 'active');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
          <p className="text-slate-500">Connect your favorite marketing tools</p>
        </div>
        <ContextualHelp
          title="How to Set Up Integrations"
          steps={[
            'Choose the integration you want to connect',
            'Click "Connect" and enter your API credentials',
            'Select sync frequency (real-time, hourly, daily, or weekly)',
            'Test the connection to ensure it works',
            'Your data will start syncing automatically'
          ]}
        />
      </div>

      <InlineHelp>
        💡 Tip: Start with email marketing integrations to sync your audience, then add CRM tools to track leads and engagement.
      </InlineHelp>

      {/* Active Integrations Overview */}
      {activeIntegrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeIntegrations.map((integration) => (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">
                      {integrationTypes
                        .flatMap(t => t.integrations)
                        .find(i => i.id === integration.integration_type)?.logo}
                    </div>
                    <div>
                      <p className="font-medium">{integration.integration_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className={cn(
                            integration.sync_status === 'healthy' && 'bg-emerald-50 text-emerald-700',
                            integration.sync_status === 'warning' && 'bg-amber-50 text-amber-700',
                            integration.sync_status === 'error' && 'bg-red-50 text-red-700'
                          )}
                        >
                          {integration.sync_status}
                        </Badge>
                        {integration.last_synced_at && (
                          <span className="text-xs text-slate-500">
                            Last synced: {new Date(integration.last_synced_at).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => syncIntegrationMutation.mutate(integration)}
                      disabled={syncIntegrationMutation.isPending}
                    >
                      <RefreshCw className={cn("w-4 h-4", syncIntegrationMutation.isPending && "animate-spin")} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Integrations */}
      <Tabs defaultValue="email" className="space-y-6">
        <TabsList>
          {integrationTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              <type.icon className="w-4 h-4 mr-2" />
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {integrationTypes.map((type) => (
          <TabsContent key={type.id} value={type.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {type.integrations.map((integration) => {
                const connected = isIntegrationConnected(integration.id);
                return (
                  <Card key={integration.id} className={cn(connected && "border-emerald-200 bg-emerald-50/50")}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-4xl mb-2">{integration.logo}</div>
                        {connected && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {connected ? (
                        <Button variant="outline" className="w-full" disabled>
                          Already Connected
                        </Button>
                      ) : integration.requiresOAuth ? (
                        <Button
                          className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                          onClick={() => handleConnectOAuth(integration)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect via OAuth
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                          onClick={() => handleSetup(integration)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>{selectedIntegration?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedIntegration?.fields?.map((field) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={field} className="capitalize">
                  {field.replace('_', ' ')}
                </Label>
                <Input
                  id={field}
                  placeholder={`Enter ${field.replace('_', ' ')}`}
                  value={setupData.credentials?.[field] || ''}
                  onChange={(e) =>
                    setSetupData({
                      ...setupData,
                      credentials: {
                        ...setupData.credentials,
                        [field]: e.target.value
                      }
                    })
                  }
                />
              </div>
            ))}

            <div className="space-y-2">
              <Label>Sync Frequency</Label>
              <Select
                value={setupData.settings?.sync_frequency || 'daily'}
                onValueChange={(value) =>
                  setSetupData({
                    ...setupData,
                    settings: {
                      ...setupData.settings,
                      sync_frequency: value
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-time">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveIntegration}
              disabled={createIntegrationMutation.isPending}
              className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
            >
              {createIntegrationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}