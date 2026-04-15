import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Zap,
  MessageSquare,
  AtSign,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  MoreHorizontal,
  ChevronRight,
  ArrowRight,
  Filter,
  Settings,
  Trash2,
  Copy,
  Workflow,
  Shield,
  Link2,
  Users } from
'lucide-react';
import AutomationBuilder from '@/components/automation/AutomationBuilder';
import ApprovalRulesConfig from '@/components/automation/ApprovalRulesConfig';
import ProjectManagementIntegrations from '@/components/automation/ProjectManagementIntegrations';
import AIWorkloadBalancer from '@/components/ai/AIWorkloadBalancer';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
'@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger } from
'@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const triggerConfig = {
  new_comment: { icon: MessageSquare, label: 'New Comment', color: 'bg-blue-100 text-blue-700' },
  new_mention: { icon: AtSign, label: 'New Mention', color: 'bg-purple-100 text-purple-700' },
  new_dm: { icon: MessageSquare, label: 'New DM', color: 'bg-emerald-100 text-emerald-700' },
  keyword_detected: { icon: Filter, label: 'Keyword Detected', color: 'bg-amber-100 text-amber-700' },
  sentiment_detected: { icon: AlertTriangle, label: 'Sentiment Alert', color: 'bg-red-100 text-red-700' },
  scheduled: { icon: Clock, label: 'Scheduled', color: 'bg-slate-100 text-slate-700' }
};

const actionConfig = {
  auto_reply: { label: 'Auto Reply', color: 'bg-blue-500' },
  assign_team: { label: 'Assign Team', color: 'bg-purple-500' },
  add_label: { label: 'Add Label', color: 'bg-emerald-500' },
  send_notification: { label: 'Notify', color: 'bg-amber-500' },
  hide_content: { label: 'Hide', color: 'bg-red-500' },
  ai_response: { label: 'AI Response', color: 'bg-violet-500' }
};

const _OLD_sampleAutomations = [
{
  id: '1',
  name: 'Welcome New Followers',
  description: 'Send a personalized welcome message to new followers',
  trigger: { type: 'new_dm', platforms: ['instagram', 'twitter'] },
  actions: [{ type: 'ai_response' }, { type: 'add_label' }],
  execution_count: 1234,
  last_executed_at: new Date(Date.now() - 3600000).toISOString(),
  status: 'active'
},
{
  id: '2',
  name: 'Negative Sentiment Alert',
  description: 'Notify team when negative comments are detected',
  trigger: { type: 'sentiment_detected', conditions: [{ field: 'sentiment', operator: 'equals', value: 'negative' }] },
  actions: [{ type: 'send_notification' }, { type: 'assign_team' }],
  execution_count: 89,
  last_executed_at: new Date(Date.now() - 86400000).toISOString(),
  status: 'active'
},
{
  id: '3',
  name: 'FAQ Auto-Responder',
  description: 'Automatically respond to common questions',
  trigger: { type: 'keyword_detected', conditions: [{ field: 'content', operator: 'contains', value: 'shipping' }] },
  actions: [{ type: 'auto_reply' }],
  execution_count: 456,
  last_executed_at: new Date(Date.now() - 7200000).toISOString(),
  status: 'paused'
},
{
  id: '4',
  name: 'Comment Moderation',
  description: 'Hide spam and inappropriate comments',
  trigger: { type: 'new_comment', platforms: ['facebook', 'instagram'] },
  actions: [{ type: 'hide_content' }, { type: 'add_label' }],
  execution_count: 2345,
  status: 'draft'
}];


const automationTemplates = [
{ name: 'Welcome Message', description: 'Greet new followers', trigger: 'new_dm' },
{ name: 'Negative Review Alert', description: 'Get notified of bad reviews', trigger: 'sentiment_detected' },
{ name: 'FAQ Bot', description: 'Answer common questions', trigger: 'keyword_detected' },
{ name: 'Spam Filter', description: 'Hide inappropriate content', trigger: 'new_comment' }];


export default function Automations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [activeTab, setActiveTab] = useState('automations');
  const [planAccess, setPlanAccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    checkPlanAccess();
  }, []);

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
      
      // Visual automation builder available in Professional+ plans only
      setPlanAccess(['professional', 'agency'].includes(plan));
    } catch (error) {
      console.error('Failed to check plan access:', error);
    }
  };

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['automations'],
    queryFn: () => base44.entities.Automation.list('-created_date'),
  });

  const filteredAutomations = automations.filter((auto) =>
  auto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  auto.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = automations.filter((a) => a.status === 'active').length;
  const totalExecutions = automations.reduce((acc, a) => acc + (a.execution_count || 0), 0);

  const handleSaveAutomation = (automation) => {
    setShowBuilder(false);
    // Here you would save to database
  };

  const handleSaveApprovalRules = (rules) => {
    // Save approval rules
  };

  if (showBuilder) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setShowBuilder(false)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Automation Builder</h1>
            <p className="text-slate-500">Build your custom workflow visually</p>
          </div>
        </div>
        <AutomationBuilder onSave={handleSaveAutomation} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advanced Automations</h1>
          <p className="text-slate-500">Automate workflows, approvals, and team collaboration</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              if (!planAccess) {
                toast.error('Visual Automation Builder is available in Professional and Agency plans');
                return;
              }
              setShowBuilder(true);
            }}
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
          >
            <Workflow className="w-4 h-4 mr-2" />
            Visual Builder
            {!planAccess && <Badge variant="secondary" className="ml-2 text-xs">Pro</Badge>}
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Quick Create
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-500 mb-4">Choose a template to get started</p>
              <div className="grid grid-cols-2 gap-4">
                {automationTemplates.map((template) => {
                  const TriggerIcon = triggerConfig[template.trigger]?.icon || Zap;
                  return (
                    <button
                      key={template.name}
                      className="p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-md transition-all text-left group"
                      onClick={() => setShowCreateDialog(false)}>

                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                        triggerConfig[template.trigger]?.color
                      )}>
                        <TriggerIcon className="w-5 h-5" />
                      </div>
                      <h4 className="font-medium text-slate-900 group-hover:text-violet-700">
                        {template.name}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                    </button>);

                })}
              </div>
              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Create from Scratch
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="automations" className="gap-2">
            <Zap className="w-4 h-4" />
            Automations
          </TabsTrigger>
          <TabsTrigger value="approvals" className="gap-2">
            <Shield className="w-4 h-4" />
            Approval Rules
          </TabsTrigger>
          <TabsTrigger value="workload" className="gap-2">
            <Users className="w-4 h-4" />
            AI Workload
          </TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2">
            <Link2 className="w-4 h-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-6">
          {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50">
              <Play className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-sm text-slate-500">Active Automations</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-violet-50">
              <Zap className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalExecutions.toLocaleString()}</p>
              <p className="text-sm text-slate-500">Total Executions</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-slate-500">Always Running</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search automations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9" />

      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {filteredAutomations.map((automation) => {
          const TriggerIcon = triggerConfig[automation.trigger.type]?.icon || Zap;
          const triggerInfo = triggerConfig[automation.trigger.type];

          return (
            <Card key={automation.id} className="group hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "p-3 rounded-xl shrink-0",
                      triggerInfo?.color || 'bg-slate-100'
                    )}>
                      <TriggerIcon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-slate-900">{automation.name}</h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            automation.status === 'active' && "bg-emerald-100 text-emerald-700",
                            automation.status === 'paused' && "bg-amber-100 text-amber-700",
                            automation.status === 'draft' && "bg-slate-100 text-slate-700"
                          )}>

                          {automation.status}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-sm mb-4">{automation.description}</p>
                      
                      {/* Trigger → Actions Flow */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <Badge variant="outline" className="gap-1">
                          <TriggerIcon className="w-3 h-3" />
                          {triggerInfo?.label}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        {automation.actions?.map((action, i) =>
                        <React.Fragment key={i}>
                            <Badge
                            className={cn(
                              "text-white",
                              actionConfig[action.type]?.color || 'bg-slate-500'
                            )}>

                              {actionConfig[action.type]?.label || action.type}
                            </Badge>
                            {i < automation.actions.length - 1 &&
                          <span className="text-slate-400">+</span>
                          }
                          </React.Fragment>
                        )}
                      </div>
                      
                      {/* Stats */}
                      <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {automation.execution_count?.toLocaleString()} executions
                        </span>
                        {automation.last_executed_at &&
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Last run {moment(automation.last_executed_at).fromNow()}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={automation.status === 'active'}
                      className="data-[state=checked]:bg-emerald-500" />

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Automation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>);

        })}
      </div>

          {filteredAutomations.length === 0 &&
          <Card className="py-12">
              <div className="text-center">
                <Zap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">No automations found</h3>
                <p className="text-slate-500 mb-4">Create your first automation to save time</p>
                <Button onClick={() => setShowBuilder(true)} className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                  <Workflow className="w-4 h-4 mr-2" />
                  Open Visual Builder
                </Button>
              </div>
            </Card>
          }
        </TabsContent>

        <TabsContent value="approvals">
          <ApprovalRulesConfig onSave={handleSaveApprovalRules} />
        </TabsContent>

        <TabsContent value="workload">
          <AIWorkloadBalancer />
        </TabsContent>

        <TabsContent value="integrations">
          <ProjectManagementIntegrations />
        </TabsContent>
      </Tabs>
    </div>);

}