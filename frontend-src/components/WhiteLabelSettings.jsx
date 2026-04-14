import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertCircle,
  Eye,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';

export default function WhiteLabelSettings({ workspace }) {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [settings, setSettings] = useState({
    enabled: workspace?.settings?.white_label?.enabled || false,
    custom_domain: workspace?.settings?.white_label?.custom_domain || '',
    logo_url: workspace?.settings?.white_label?.logo_url || '',
    favicon_url: workspace?.settings?.white_label?.favicon_url || '',
    brand_name: workspace?.settings?.white_label?.brand_name || workspace?.name || '',
    primary_color: workspace?.settings?.white_label?.primary_color || '#d4af37',
    secondary_color: workspace?.settings?.white_label?.secondary_color || '#f4cf47',
    accent_color: workspace?.settings?.white_label?.accent_color || '#0ea5e9',
    hide_powered_by: workspace?.settings?.white_label?.hide_powered_by || false,
    custom_footer_text: workspace?.settings?.white_label?.custom_footer_text || '',
    client_portal_enabled: workspace?.settings?.white_label?.client_portal_enabled || false
  });

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      await base44.entities.Workspace.update(workspace.id, {
        settings: {
          ...workspace.settings,
          white_label: {
            ...workspace.settings?.white_label,
            ...updates
          }
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces']);
      toast.success('White-label settings updated!');
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSettings({ ...settings, logo_url: file_url });
      toast.success('Logo uploaded!');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setSettings({ ...settings, favicon_url: file_url });
      toast.success('Favicon uploaded!');
    } catch (error) {
      toast.error('Failed to upload favicon');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const isPremiumPlan = ['professional', 'agency', 'business', 'enterprise', 'white_label'].includes(workspace?.plan);

  if (!isPremiumPlan) {
    return (
      <Card className="border-2 border-[#d4af37]/20">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d4af37] to-[#f4cf47] flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Upgrade to Enable White-Labeling</h3>
          <p className="text-slate-600 mb-6">
            White-label features are available on Agency plans. Professional plans get basic branding customization.
          </p>
          <Button 
            className="bg-gradient-to-r from-[#d4af37] to-[#f4cf47] hover:from-[#c49f2f] hover:to-[#e4bf37] text-slate-950"
            onClick={() => window.location.href = createPageUrl('Pricing')}
          >
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable White-Label */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            White-Label Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#d4af37]/5 border border-[#d4af37]/20">
            <div>
              <h4 className="font-semibold text-slate-900 mb-1">Enable White-Labeling</h4>
              <p className="text-sm text-slate-600">
                Customize the platform with your brand identity
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>

          {settings.enabled && (
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">White-labeling is active</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your custom branding is now applied across the platform
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Brand Identity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#d4af37]" />
            Brand Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Brand Name</Label>
            <Input
              placeholder="Your Agency Name"
              value={settings.brand_name}
              onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">
              This will replace "SocialHub" throughout the platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="mb-2 block">Logo</Label>
              <div className="space-y-3">
                {settings.logo_url && (
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <img
                      src={settings.logo_url}
                      alt="Logo preview"
                      className="h-12 object-contain"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      onClick={() => document.getElementById('logo-upload').click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Recommended: PNG or SVG, max 200px height
                  </p>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Favicon</Label>
              <div className="space-y-3">
                {settings.favicon_url && (
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                    <img
                      src={settings.favicon_url}
                      alt="Favicon preview"
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label htmlFor="favicon-upload">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploading}
                      onClick={() => document.getElementById('favicon-upload').click()}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Favicon'}
                    </Button>
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Recommended: 32x32px PNG or ICO
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  placeholder="#d4af37"
                />
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  placeholder="#f4cf47"
                />
              </div>
            </div>
            <div>
              <Label>Accent Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={settings.accent_color}
                  onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                  placeholder="#0ea5e9"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#d4af37]" />
            Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Your Custom Domain</Label>
            <Input
              placeholder="dashboard.youragency.com"
              value={settings.custom_domain}
              onChange={(e) => setSettings({ ...settings, custom_domain: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">
              Point your domain's CNAME to: <code className="bg-slate-100 px-1 py-0.5 rounded">app.socialhub.com</code>
            </p>
          </div>

          {settings.custom_domain && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-2">DNS Configuration Required</p>
                  <div className="space-y-1 text-sm text-blue-700">
                    <p>1. Add a CNAME record in your DNS settings:</p>
                    <code className="block bg-blue-100 p-2 rounded mt-1 font-mono text-xs">
                      Type: CNAME<br />
                      Name: {settings.custom_domain.split('.')[0]}<br />
                      Value: app.socialhub.com
                    </code>
                    <p className="mt-2">2. SSL certificate will be issued automatically</p>
                    <p>3. Changes may take up to 48 hours to propagate</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Options */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
            <div>
              <h4 className="font-medium text-slate-900">Hide "Powered by SocialHub"</h4>
              <p className="text-sm text-slate-500">Remove platform attribution from client views</p>
            </div>
            <Switch
              checked={settings.hide_powered_by}
              onCheckedChange={(checked) => setSettings({ ...settings, hide_powered_by: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
            <div>
              <h4 className="font-medium text-slate-900">Client Portal</h4>
              <p className="text-sm text-slate-500">Enable separate portal for client access</p>
            </div>
            <Switch
              checked={settings.client_portal_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, client_portal_enabled: checked })}
            />
          </div>

          <div>
            <Label>Custom Footer Text</Label>
            <Input
              placeholder="© 2026 Your Agency. All rights reserved."
              value={settings.custom_footer_text}
              onChange={(e) => setSettings({ ...settings, custom_footer_text: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview & Save */}
      <div className="flex items-center justify-between">
        <Button variant="outline" className="gap-2">
          <Eye className="w-4 h-4" />
          Preview Changes
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="bg-gradient-to-r from-[#d4af37] to-[#f4cf47] hover:from-[#c49f2f] hover:to-[#e4bf37] text-slate-950"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save White-Label Settings'}
        </Button>
      </div>
    </div>
  );
}