import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PermissionGuard, usePermissions } from '@/components/auth/PermissionGuard';
import { ROLES, PERMISSIONS, getRoleInfo, getRolePermissions } from '@/components/utils/permissions';
import { Users, Shield, UserPlus, Search, AlertCircle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function RoleManagement() {
  return (
    <PermissionGuard feature="team">
      <RoleManagementContent />
    </PermissionGuard>
  );
}

function RoleManagementContent() {
  const [members, setMembers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const { can, user } = usePermissions();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workspacesData, membersData] = await Promise.all([
        base44.entities.Workspace.filter({ status: 'active' }),
        base44.entities.WorkspaceMember.list()
      ]);

      setWorkspaces(workspacesData);
      if (workspacesData.length > 0) {
        setCurrentWorkspace(workspacesData[0]);
      }
      setMembers(membersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load team members');
    }
  };

  const filteredMembers = members.filter(member =>
    member.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (memberId, newRole) => {
    try {
      const { serializePermissions } = await import('@/components/utils/permissions');
      const newPermissions = serializePermissions(newRole);
      
      await base44.entities.WorkspaceMember.update(memberId, { 
        role: newRole,
        permissions: newPermissions
      });
      toast.success('Role and permissions updated successfully');
      loadData();
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    try {
      await base44.entities.WorkspaceMember.delete(memberId);
      toast.success('Member removed successfully');
      loadData();
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Role & Permission Management</h1>
        <p className="text-slate-600 mt-1">Manage team members and their access levels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#d4af37]" />
                    Team Members
                  </CardTitle>
                  <CardDescription>Manage roles and permissions for your team</CardDescription>
                </div>
                {can(PERMISSIONS.INVITE_MEMBERS) && (
                  <InviteMemberDialog
                    isOpen={isInviteOpen}
                    setIsOpen={setIsInviteOpen}
                    workspaceId={currentWorkspace?.id}
                    onSuccess={loadData}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Members Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-slate-500 py-8">
                          No team members found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => {
                        const roleInfo = getRoleInfo(member.role);
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-slate-900">{member.user_email}</p>
                                {member.user_email === user?.email && (
                                  <Badge variant="outline" className="text-xs mt-1">You</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {can(PERMISSIONS.MANAGE_ROLES) && member.role !== 'owner' ? (
                                <Select
                                  value={member.role}
                                  onValueChange={(value) => handleRoleChange(member.id, value)}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.values(ROLES).filter(r => r !== 'owner').map(role => (
                                      <SelectItem key={role} value={role}>
                                        {getRoleInfo(role).name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge className={roleInfo.color}>
                                  {roleInfo.icon} {roleInfo.name}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={member.status === 'active' ? 'default' : 'secondary'}
                                className={member.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {member.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setIsPermissionsOpen(true);
                                  }}
                                >
                                  View Permissions
                                </Button>
                                {can(PERMISSIONS.REMOVE_MEMBERS) && member.role !== 'owner' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#d4af37]" />
                Available Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(ROLES).map(role => {
                const info = getRoleInfo(role);
                return (
                  <div key={role} className="p-3 border rounded-lg hover:border-[#d4af37] transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{info.icon}</span>
                      <span className="font-medium text-slate-900">{info.name}</span>
                    </div>
                    <p className="text-xs text-slate-600">{info.description}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Permission Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Assign roles carefully. Higher roles have more access to sensitive data and settings. Owners and Admins have full control.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Permission Details Dialog */}
      {selectedMember && (
        <PermissionDetailsDialog
          isOpen={isPermissionsOpen}
          setIsOpen={setIsPermissionsOpen}
          member={selectedMember}
        />
      )}
    </div>
  );
}

function InviteMemberDialog({ isOpen, setIsOpen, workspaceId, onSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.EDITOR);
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email || !workspaceId) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Check team member limit
      const existingMembers = await base44.entities.WorkspaceMember.filter({ 
        workspace_id: workspaceId,
        status: 'active'
      });
      
      const user = await base44.auth.me();
      const subscriptions = await base44.entities.Subscription.filter({
        user_email: user.email,
        workspace_id: workspaceId
      });
      
      const subscription = subscriptions[0];
      const memberLimit = subscription?.usage_limits?.team_members || 1;
      
      if (existingMembers.length >= memberLimit) {
        toast.error(`Team member limit reached (${memberLimit}). Upgrade to Professional plan for up to 20 members.`);
        setLoading(false);
        return;
      }
      
      await base44.users.inviteUser(email, 'user');

      const { serializePermissions } = await import('@/components/utils/permissions');
      
      await base44.entities.WorkspaceMember.create({
        workspace_id: workspaceId,
        user_email: email,
        role: role,
        status: 'invited',
        permissions: serializePermissions(role)
      });

      toast.success('Invitation sent successfully');
      setEmail('');
      setRole(ROLES.EDITOR);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to invite member:', error);
      toast.error('Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your workspace
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ROLES).filter(r => r !== 'owner').map(r => {
                  const info = getRoleInfo(r);
                  return (
                    <SelectItem key={r} value={r}>
                      {info.icon} {info.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
            onClick={handleInvite}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PermissionDetailsDialog({ isOpen, setIsOpen, member }) {
  const permissions = getRolePermissions(member.role);
  const roleInfo = getRoleInfo(member.role);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge className={roleInfo.color}>
              {roleInfo.icon} {roleInfo.name}
            </Badge>
            Permissions
          </DialogTitle>
          <DialogDescription>
            Viewing permissions for {member.user_email}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(PERMISSIONS).map(permission => {
              const hasAccess = permissions.includes(permission);
              return (
                <div
                  key={permission}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border",
                    hasAccess ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
                  )}
                >
                  {hasAccess ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-slate-400" />
                  )}
                  <span className={cn(
                    "text-sm capitalize",
                    hasAccess ? "text-green-900" : "text-slate-500"
                  )}>
                    {permission.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}