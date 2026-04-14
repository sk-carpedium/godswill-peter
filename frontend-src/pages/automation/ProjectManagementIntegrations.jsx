import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  XCircle,
  Settings,
  ExternalLink,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';

const integrations = [
  {
    id: 'asana',
    name: 'Asana',
    description: 'Sync tasks and projects with Asana',
    logo: '📋',
    features: ['Auto-create tasks', 'Sync deadlines', 'Team assignments', 'Status updates'],
    connected: false
  },
  {
    id: 'trello',
    name: 'Trello',
    description: 'Create cards and manage boards',
    logo: '📊',
    features: ['Create cards', 'Move between lists', 'Add labels', 'Set due dates'],
    connected: false
  },
  {
    id: 'monday',
    name: 'Monday.com',
    description: 'Integrate with Monday.com workflows',
    logo: '🎯',
    features: ['Sync items', 'Update statuses', 'Assign people', 'Custom fields'],
    connected: false
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Track issues and sprint planning',
    logo: '🔷',
    features: ['Create issues', 'Link epics', 'Sprint tracking', 'Custom workflows'],
    connected: false
  },
  {
    id: 'clickup',
    name: 'ClickUp',
    description: 'All-in-one project management',
    logo: '✅',
    features: ['Create tasks', 'Time tracking', 'Goals', 'Custom fields'],
    connected: false
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync with Notion databases',
    logo: '📝',
    features: ['Create pages', 'Update databases', 'Link relations', 'Custom properties'],
    connected: false
  }
];

const syncRules = [
  {
    id: 'new_post',
    name: 'New Post Created',
    description: 'Create a task when a new post is created',
    enabled: true
  },
  {
    id: 'post_approved',
    name: 'Post Approved',
    description: 'Update task status when post is approved',
    enabled: true
  },
  {
    id: 'campaign_start',
    name: 'Campaign Started',
    description: 'Create project when campaign begins',
    enabled: false
  },
  {
    id: 'task_assigned',
    name: 'Task Assigned',
    description: 'Sync team member assignments',
    enabled: true
  }
];

export default function ProjectManagementIntegrations() {
  const [connections, setConnections] = useState(integrations);
  const [rules, setRules] = useState(syncRules);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [workspace, setWorkspace] = useState('');

  const handleConnect = (integrationId) => {
    setConnections(connections.map(c => 
      c.id === integrationId ? { ...c, connected: true } : c
    ));
    setSelectedIntegration(null);
    toast.success(`Connected to ${connections.find(c => c.id === integrationId)?.name}!`);
  };

  const handleDisconnect = (integrationId) => {
    setConnections(connections.map(c => 
      c.id === integrationId ? { ...c, connected: false } : c
    ));
    toast.success('Disconnected successfully');
  };

  const toggleRule = (ruleId) => {
    setRules(rules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const connectedCount = connections.filter(c => c.connected).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{connectedCount}</p>
                <p className="text-sm text-slate-500">Active Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rules.filter(r => r.enabled).length}</p>
                <p className="text-sm text-slate-500">Sync Rules Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">Real-time</p>
                <p className="text-sm text-slate-500">Sync Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Available Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connections.map((integration) => (
              <Card key={integration.id} className={cn(
                "border-2 transition-all hover:shadow-md",
                integration.connected ? "border-[#d4af37]/30 bg-[#d4af37]/5" : "border-slate-200"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{integration.logo}</div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{integration.name}</h3>
                        <p className="text-xs text-slate-500">{integration.description}</p>
                      </div>
                    </div>
                    {integration.connected && (
                      <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {integration.features.slice(0, 3).map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                        <div className="w-1 h-1 rounded-full bg-[#d4af37]" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {integration.connected ? (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Settings className="w-3 h-3 mr-2" />
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{integration.name} Settings</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label>Workspace/Project</Label>
                              <Input placeholder="Select workspace..." />
                            </div>
                            <div>
                              <Label>Default Task List</Label>
                              <Input placeholder="Select list..." />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label>Auto-sync</Label>
                              <Switch defaultChecked />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDisconnect(integration.id)}
                        className="text-red-600"
                      >
                        Disconnect
                      </Button>
                    </div>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          Connect
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Connect to {integration.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label>API Key</Label>
                            <Input
                              type="password"
                              placeholder="Enter your API key..."
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Workspace ID (optional)</Label>
                            <Input
                              placeholder="Enter workspace ID..."
                              value={workspace}
                              onChange={(e) => setWorkspace(e.target.value)}
                            />
                          </div>
                          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-900">
                              You can find your API key in {integration.name} Settings → Integrations → API
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">Cancel</Button>
                          <Button
                            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                            onClick={() => handleConnect(integration.id)}
                          >
                            Connect
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Rules */}
      {connectedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 mb-1">{rule.name}</h4>
                    <p className="text-sm text-slate-500">{rule.description}</p>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}