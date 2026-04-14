import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Shield, CheckCircle, Clock, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import ApprovalFlow from '@/components/workflow/ApprovalFlow';
import TaskAssignment from '@/components/collaboration/TaskAssignment';
import TeamNotifications from '@/components/collaboration/TeamNotifications';
import PermissionsManager from '@/components/collaboration/PermissionsManager';
import { toast } from 'sonner';

const teamMembers = [
{ id: '1', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'admin', avatar: 'SJ', status: 'active', posts: 45, approved: 42 },
{ id: '2', name: 'Mike Chen', email: 'mike@company.com', role: 'editor', avatar: 'MC', status: 'active', posts: 38, approved: 35 },
{ id: '3', name: 'Lisa Anderson', email: 'lisa@company.com', role: 'editor', avatar: 'LA', status: 'active', posts: 52, approved: 48 },
{ id: '4', name: 'David Kim', email: 'david@company.com', role: 'viewer', avatar: 'DK', status: 'invited', posts: 0, approved: 0 }];


const roles = [
{ value: 'admin', label: 'Admin', description: 'Full access to all features' },
{ value: 'editor', label: 'Editor', description: 'Can create and edit content' },
{ value: 'viewer', label: 'Viewer', description: 'View-only access' }];


export default function Team() {
  const [showInvite, setShowInvite] = useState(false);
  const [showApprovals, setShowApprovals] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [selectedMember, setSelectedMember] = useState(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('editor');
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
    if (workspaces.length > 0) {
      setCurrentWorkspace(workspaces[0]);
    }
  };

  const { data: members = [], isLoading} = useQuery({
    queryKey: ['workspace-members', currentWorkspace?.id],
    queryFn: () => base44.entities.WorkspaceMember.filter({ workspace_id: currentWorkspace.id }),
    enabled: !!currentWorkspace
  });

  const handleInvite = async () => {
    if (!email || !currentWorkspace) {
      toast.error('Please enter an email');
      return;
    }
    
    try {
      // Check team member limit
      const existingMembers = await base44.entities.WorkspaceMember.filter({ 
        workspace_id: currentWorkspace.id,
        status: 'active'
      });
      
      const user = await base44.auth.me();
      const subscriptions = await base44.entities.Subscription.filter({
        user_email: user.email,
        workspace_id: currentWorkspace.id
      });
      
      const subscription = subscriptions[0];
      const memberLimit = subscription?.usage_limits?.team_members || 1;
      
      if (existingMembers.length >= memberLimit) {
        toast.error(`Team member limit reached (${memberLimit}). Upgrade your plan to add more members.`);
        return;
      }
      
      await base44.users.inviteUser(email, role === 'admin' ? 'admin' : 'user');
      
      await base44.entities.WorkspaceMember.create({
        workspace_id: currentWorkspace.id,
        user_email: email,
        role: role,
        status: 'invited'
      });
      
      toast.success('Invitation sent!');
      setEmail('');
      setShowInvite(false);
    } catch (error) {
      toast.error('Failed to send invitation');
    }
  };

  if (showApprovals) {
    return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Content Approvals</h1>
            <p className="text-slate-500">Review and approve team content</p>
          </div>
          <Button variant="outline" onClick={() => setShowApprovals(false)} className="bg-[#d4af37] text-slate-950 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9">
            Back to Team
          </Button>
        </div>
        <ApprovalFlow />
      </div>);

  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#d4af37] text-slate-950 rounded-xl w-12 h-12 from-violet-600 to-indigo-600 flex items-center justify-center">
            <Users className="text-slate-950 lucide lucide-users w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Team & Collaboration</h1>
            <p className="text-slate-500">Manage team members and workflow</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowApprovals(true)} className="bg-[#d4af37] text-slate-950 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approvals
          </Button>
          <Button onClick={() => setShowInvite(true)} className="bg-[#d4af37] text-slate-950 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 hover:bg-violet-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="text-[#d4af37] lucide lucide-users w-5 h-5" />
              <p className="text-sm font-medium text-slate-600">Team Members</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{teamMembers.filter((m) => m.status === 'active').length}</p>
            <p className="text-sm text-slate-500 mt-1">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-[#d4af37] lucide lucide-clock w-5 h-5" />
              <p className="text-sm font-medium text-slate-600">Pending Approvals</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">8</p>
            <p className="text-sm text-slate-500 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="text-[#d4af37] lucide lucide-message-square w-5 h-5" />
              <p className="text-sm font-medium text-slate-600">Collaboration</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">24</p>
            <p className="text-sm text-slate-500 mt-1">Comments today</p>
          </CardContent>
        </Card>
      </div>

      {showInvite &&
      <Card className="bg-transparent text-card-foreground rounded-xl shadow border-2 border-violet-300">
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <Input placeholder="colleague@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) =>
                <SelectItem key={r.value} value={r.value}>
                      <div>
                        <p className="font-medium">{r.label}</p>
                        <p className="text-xs text-slate-500">{r.description}</p>
                      </div>
                    </SelectItem>
                )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInvite} className="bg-[#d4af37] text-slate-950 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow h-9 flex-1 hover:bg-violet-700">Send Invitation</Button>
              <Button variant="outline" onClick={() => setShowInvite(false)} className="bg-[#d4af37] text-slate-950 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      }

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-[#d4af37] text-slate-950">
                          {member.user_email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{member.user_email}</p>
                        <p className="text-sm text-slate-500 capitalize">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={member.role === 'admin' || member.role === 'owner' ? 'default' : 'secondary'} className="min-w-20 justify-center bg-[#d4af37] text-slate-950">
                        {(member.role === 'admin' || member.role === 'owner') && <Shield className="w-3 h-3 mr-1" />}
                        {member.role}
                      </Badge>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                        {member.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member);
                          setActiveTab('permissions');
                        }}
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          {currentWorkspace && <TaskAssignment workspaceId={currentWorkspace.id} />}
        </TabsContent>

        <TabsContent value="notifications">
          {currentWorkspace && <TeamNotifications workspaceId={currentWorkspace.id} />}
        </TabsContent>

        <TabsContent value="permissions">
          {selectedMember ? (
            <PermissionsManager
              member={selectedMember}
              onUpdate={(data) => {
                console.log('Update permissions:', data);
                setSelectedMember(null);
                setActiveTab('members');
              }}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a team member to manage permissions</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setActiveTab('members')}
                >
                  Go to Members
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>);

}