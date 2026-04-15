import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Plus,
  Settings,
  LayoutDashboard,
  Mail,
  Target,
  Sparkles,
  ExternalLink,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomKPIBuilder from '@/components/CustomKPIBuilder';
import BespokeDashboardEditor from '@/components/BespokeDashboardEditor';
import AutomatedReportDelivery from '@/components/AutomatedReportDelivery';
import WhiteLabelSettings from '@/components/WhiteLabelSettings';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';

export default function AgencyClientManagement() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    industry: '',
    plan: 'starter'
  });

  const { data: agencyWorkspace } = useQuery({
    queryKey: ['agency-workspace'],
    queryFn: async () => {
      const workspaces = await base44.entities.Workspace.filter({ plan: 'agency' });
      return workspaces[0];
    }
  });

  const { data: clientWorkspaces = [] } = useQuery({
    queryKey: ['client-workspaces'],
    queryFn: async () => {
      // Get all workspaces that are managed by this agency
      const allWorkspaces = await base44.entities.Workspace.list();
      return allWorkspaces.filter(w => w.plan !== 'agency' && w.status === 'active');
    }
  });

  const createClientWorkspace = async () => {
    if (!newClient.name || !newClient.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const workspace = await base44.entities.Workspace.create({
        name: newClient.name,
        slug: `client-${Date.now()}`,
        industry: newClient.industry,
        plan: newClient.plan,
        status: 'active',
        settings: {
          white_label: {
            enabled: true,
            brand_name: agencyWorkspace?.settings?.white_label?.brand_name || 'Your Agency',
            logo_url: agencyWorkspace?.settings?.white_label?.logo_url,
            primary_color: agencyWorkspace?.settings?.white_label?.primary_color || '#d4af37',
            client_portal_enabled: true
          }
        }
      });

      await base44.users.inviteUser(newClient.email, 'user');

      toast.success('Client workspace created!');
      setShowAddClient(false);
      setNewClient({ name: '', email: '', industry: '', plan: 'starter' });
    } catch (error) {
      toast.error('Failed to create client workspace');
    }
  };

  const getPortalUrl = (workspace) => {
    const domain = workspace.settings?.white_label?.custom_domain || window.location.hostname;
    return `https://${domain}${createPageUrl('ClientPortal')}?workspace=${workspace.id}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#d4af37]" />
            Client Management & White-Label Portal
          </h1>
          <p className="text-slate-500 mt-1">Manage client accounts, custom dashboards, and automated reporting</p>
        </div>
        <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
          <DialogTrigger asChild>
            <Button className="bg-[#d4af37] hover:bg-[#c9a961] text-slate-950">
              <Plus className="w-4 h-4 mr-2" />
              Add New Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Client Name *</Label>
                <Input
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Acme Corporation"
                />
              </div>
              <div>
                <Label>Client Email *</Label>
                <Input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  placeholder="client@acme.com"
                />
              </div>
              <div>
                <Label>Industry</Label>
                <Select value={newClient.industry} onValueChange={(value) => setNewClient({ ...newClient, industry: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plan</Label>
                <Select value={newClient.plan} onValueChange={(value) => setNewClient({ ...newClient, plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createClientWorkspace} className="w-full bg-[#d4af37] hover:bg-[#c9a961] text-slate-950">
                Create Client Workspace
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientWorkspaces.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => setSelectedClient(client)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900">{client.name}</h3>
                  <Badge variant="secondary" className="mt-1 capitalize">{client.plan}</Badge>
                </div>
                {client.settings?.white_label?.logo_url && (
                  <img 
                    src={client.settings.white_label.logo_url} 
                    alt={client.name}
                    className="h-8 object-contain"
                  />
                )}
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {client.member_count} member{client.member_count !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  {client.connected_accounts_count} connected account{client.connected_accounts_count !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" onClick={(e) => {
                  e.stopPropagation();
                  window.open(getPortalUrl(client), '_blank');
                }}>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Portal
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="w-3 h-3 mr-1" />
                  Config
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Client Configuration */}
      {selectedClient && (
        <Card className="border-2 border-[#d4af37]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Configure: {selectedClient.name}</CardTitle>
                <CardDescription>Customize dashboard, KPIs, and automated reporting</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setSelectedClient(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dashboard" className="space-y-6">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="kpis">
                  <Target className="w-4 h-4 mr-2" />
                  KPIs
                </TabsTrigger>
                <TabsTrigger value="reports">
                  <Mail className="w-4 h-4 mr-2" />
                  Reports
                </TabsTrigger>
                <TabsTrigger value="branding">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Branding
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard">
                <BespokeDashboardEditor 
                  clientWorkspaceId={selectedClient.id}
                  initialLayout={selectedClient.settings?.custom_dashboard_layout || []}
                />
              </TabsContent>

              <TabsContent value="kpis">
                <CustomKPIBuilder clientWorkspaceId={selectedClient.id} />
              </TabsContent>

              <TabsContent value="reports">
                <AutomatedReportDelivery 
                  clientWorkspaceId={selectedClient.id}
                  clientEmail={selectedClient.settings?.client_email}
                />
              </TabsContent>

              <TabsContent value="branding">
                <WhiteLabelSettings workspace={selectedClient} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}