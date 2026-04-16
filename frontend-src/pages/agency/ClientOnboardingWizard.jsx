import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  CheckCircle2,
  Users,
  Settings,
  Palette,
  FileText,
  ArrowRight,
  ArrowLeft,
  Building2,
  Mail,
  Globe,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, name: 'Client Info', icon: Building2 },
  { id: 2, name: 'Brand Assets', icon: Palette },
  { id: 3, name: 'Workspace Setup', icon: Settings },
  { id: 4, name: 'Team Access', icon: Users },
  { id: 5, name: 'Review', icon: CheckCircle2 }
];

export default function ClientOnboardingWizard({ onComplete, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Client Info
    clientName: '',
    clientEmail: '',
    clientWebsite: '',
    industry: '',
    description: '',
    
    // Brand Assets
    logoUrl: '',
    brandColors: { primary: '#000000', secondary: '#ffffff' },
    brandGuidelines: '',
    brandVoice: '',
    sampleContent: '',
    
    // Workspace Setup
    workspaceName: '',
    timezone: 'America/New_York',
    defaultLanguage: 'en',
    
    // Team Access
    teamMembers: [],
    approvalRequired: true,
    clientPortalAccess: true
  });

  const queryClient = useQueryClient();

  const createClientMutation = useMutation({
    mutationFn: async (data) => {
      // Create workspace
      const workspace = await api.entities.Workspace.create({
        name: data.workspaceName,
        slug: data.workspaceName.toLowerCase().replace(/\s+/g, '-'),
        industry: data.industry,
        plan: 'agency',
        settings: {
          timezone: data.timezone,
          default_language: data.defaultLanguage,
          brand_colors: data.brandColors,
          white_label: {
            enabled: false,
            logo_url: data.logoUrl
          }
        },
        status: 'active'
      });

      // Create brand profile
      const brand = await api.entities.Brand.create({
        workspace_id: workspace.id,
        name: data.clientName,
        logo_url: data.logoUrl,
        website: data.clientWebsite,
        industry: data.industry,
        description: data.description,
        brand_voice: {
          tone: data.brandVoice ? [data.brandVoice] : [],
          sample_posts: data.sampleContent ? [data.sampleContent] : []
        },
        visual_guidelines: {
          primary_color: data.brandColors.primary,
          secondary_color: data.brandColors.secondary
        },
        compliance_rules: {
          approval_required: data.approvalRequired
        },
        status: 'active'
      });

      // Invite client to workspace
      if (data.clientEmail) {
        await api.users.inviteUser(data.clientEmail, 'user');
        
        await api.entities.WorkspaceMember.create({
          workspace_id: workspace.id,
          user_email: data.clientEmail,
          role: 'client_viewer',
          permissions: {
            can_publish: false,
            can_approve: data.approvalRequired,
            can_delete: false,
            can_manage_team: false,
            can_view_analytics: true,
            can_manage_billing: false
          },
          status: 'invited'
        });
      }

      return { workspace, brand };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-workspaces-agency']);
      toast.success('Client onboarded successfully!');
      onComplete?.();
    },
    onError: (error) => {
      toast.error('Failed to onboard client: ' + error.message);
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createClientMutation.mutate(formData);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, logoUrl: file_url });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-slate-500 mt-2">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-2",
                  step.id <= currentStep ? "text-[#d4af37]" : "text-slate-300"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2",
                    step.id <= currentStep
                      ? "border-[#d4af37] bg-[#d4af37]/10"
                      : "border-slate-300 bg-slate-50"
                  )}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {steps[currentStep - 1].icon && 
              React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-[#d4af37]" })
            }
            {steps[currentStep - 1].name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Client Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Acme Corporation"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Email *</Label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <Input
                      value={formData.clientWebsite}
                      onChange={(e) => setFormData({ ...formData, clientWebsite: e.target.value })}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Input
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Technology, Retail, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the client and their business..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 2: Brand Assets */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Brand Logo</Label>
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8">
                  {formData.logoUrl ? (
                    <div className="flex flex-col items-center gap-4">
                      <img src={formData.logoUrl} alt="Logo" className="h-24 object-contain" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <span className="text-sm text-slate-600">Click to upload logo</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Brand Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.brandColors.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, primary: e.target.value }
                      })}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.brandColors.primary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, primary: e.target.value }
                      })}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Brand Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.brandColors.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, secondary: e.target.value }
                      })}
                      className="w-12 h-10 rounded border"
                    />
                    <Input
                      value={formData.brandColors.secondary}
                      onChange={(e) => setFormData({
                        ...formData,
                        brandColors: { ...formData.brandColors, secondary: e.target.value }
                      })}
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Brand Voice/Tone</Label>
                <Input
                  value={formData.brandVoice}
                  onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                  placeholder="Professional, Friendly, Casual, etc."
                />
              </div>

              <div className="space-y-2">
                <Label>Sample Content (Optional)</Label>
                <Textarea
                  value={formData.sampleContent}
                  onChange={(e) => setFormData({ ...formData, sampleContent: e.target.value })}
                  placeholder="Paste examples of the client's typical social media posts..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Step 3: Workspace Setup */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Workspace Name *</Label>
                <Input
                  value={formData.workspaceName}
                  onChange={(e) => setFormData({ ...formData, workspaceName: e.target.value })}
                  placeholder={formData.clientName || "Client Workspace"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Paris</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.defaultLanguage}
                    onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Team Access */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Client Portal Access</p>
                  <p className="text-sm text-slate-500">
                    Give client view-only access to content and analytics
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.clientPortalAccess}
                  onChange={(e) => setFormData({ ...formData, clientPortalAccess: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium">Content Approval Required</p>
                  <p className="text-sm text-slate-500">
                    Client must approve all content before publishing
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.approvalRequired}
                  onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-slate-600 mb-2">
                  Client will receive an invitation email at: <strong>{formData.clientEmail}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  They'll have client_viewer role with limited permissions based on settings above.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Client Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {formData.clientName}</p>
                    <p><strong>Email:</strong> {formData.clientEmail}</p>
                    <p><strong>Website:</strong> {formData.clientWebsite || 'N/A'}</p>
                    <p><strong>Industry:</strong> {formData.industry || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Workspace Settings</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {formData.workspaceName}</p>
                    <p><strong>Timezone:</strong> {formData.timezone}</p>
                    <p><strong>Language:</strong> {formData.defaultLanguage}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Brand Assets</h3>
                  <div className="space-y-2 text-sm">
                    {formData.logoUrl && <p className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> Logo uploaded</p>}
                    <p><strong>Primary Color:</strong> {formData.brandColors.primary}</p>
                    <p><strong>Secondary Color:</strong> {formData.brandColors.secondary}</p>
                    <p><strong>Brand Voice:</strong> {formData.brandVoice || 'Not set'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Access Settings</h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      {formData.clientPortalAccess ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4" />}
                      Client Portal Access
                    </p>
                    <p className="flex items-center gap-2">
                      {formData.approvalRequired ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <span className="w-4 h-4" />}
                      Approval Required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        {currentStep < steps.length ? (
          <Button
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && (!formData.clientName || !formData.clientEmail)) ||
              (currentStep === 3 && !formData.workspaceName)
            }
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
            disabled={createClientMutation.isPending}
          >
            {createClientMutation.isPending ? 'Creating...' : 'Complete Onboarding'}
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}