import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Building2, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function CreateWorkspace() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    industry: 'technology',
    plan: 'starter'
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data) => {
      const user = await base44.auth.me();
      
      // Check workspace limit
      const existingWorkspaces = await base44.entities.Workspace.filter({ status: 'active' });
      const subscriptions = await base44.entities.Subscription.filter({ user_email: user.email });
      const subscription = subscriptions[0];
      const plan = subscription?.plan_id || 'free';
      const workspaceLimit = subscription?.usage_limits?.workspaces || 1;
      
      if (plan !== 'agency' && existingWorkspaces.length >= workspaceLimit) {
        throw new Error('Workspace limit reached. Upgrade to Agency plan for unlimited client workspaces.');
      }
      
      const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return await base44.entities.Workspace.create({
        name: data.name,
        slug: slug,
        industry: data.industry,
        plan: data.plan,
        status: 'active',
        member_count: 1,
        connected_accounts_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace created successfully!');
      navigate(createPageUrl('Dashboard'));
    },
    onError: (error) => {
      toast.error('Failed to create workspace');
      console.error('Error creating workspace:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    createWorkspaceMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-2 shadow-xl">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f4cf47] flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-950" />
            </div>
            <CardTitle className="text-3xl">Create New Workspace</CardTitle>
            <CardDescription className="text-base">
              Set up a new workspace to manage your social media presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., My Agency, Brand Name, Company HQ"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12"
                  required
                />
                <p className="text-xs text-slate-500">
                  Choose a name that represents your brand or team
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => setFormData({ ...formData, industry: value })}
                >
                  <SelectTrigger id="industry" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="food_beverage">Food & Beverage</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData({ ...formData, plan: value })}
                >
                  <SelectTrigger id="plan" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">
                      <div className="flex items-center justify-between w-full">
                        <span>Starter</span>
                        <span className="text-slate-500 ml-4">Free</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="professional">
                      <div className="flex items-center justify-between w-full">
                        <span>Professional</span>
                        <span className="text-slate-500 ml-4">$49/mo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="business">
                      <div className="flex items-center justify-between w-full">
                        <span>Business</span>
                        <span className="text-slate-500 ml-4">$99/mo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="enterprise">
                      <div className="flex items-center justify-between w-full">
                        <span>Enterprise</span>
                        <span className="text-slate-500 ml-4">Custom</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="agency">
                      <div className="flex items-center justify-between w-full">
                        <span>Agency</span>
                        <span className="text-slate-500 ml-4">$199/mo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  You can upgrade or downgrade your plan anytime
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(createPageUrl('Dashboard'))}
                  className="flex-1 h-12"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createWorkspaceMutation.isPending}
                  className="flex-1 h-12 bg-gradient-to-r from-[#d4af37] to-[#f4cf47] hover:from-[#c49f2f] hover:to-[#e4bf37] text-slate-950"
                >
                  {createWorkspaceMutation.isPending ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Create Workspace
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}