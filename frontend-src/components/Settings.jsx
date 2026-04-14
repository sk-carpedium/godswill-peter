import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Link2,
  Palette,
  Globe,
  Users,
  Plus,
  Check,
  ExternalLink,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Settings as SettingsIcon,
  Sparkles,
  Mic,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  BarChart3,
  Target,
  Zap,
  FolderOpen,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Youtube,
  Radio,
  Video,
  HelpCircle,
  FileText,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppearance } from '@/lib/AppearanceContext';
import SyncStatusCard from '@/components/social/SyncStatusCard';
import SidebarCustomizer from '@/components/settings/SidebarCustomizer';
import WhiteLabelSettings from '@/components/settings/WhiteLabelSettings';
import ClientReportGenerator from '@/components/reports/ClientReportGenerator';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const platformConfig = {
  instagram: { 
    name: 'Instagram', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
  },
  facebook: { 
    name: 'Facebook', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  },
  twitter: { 
    name: 'X (Twitter)', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  },
  linkedin: { 
    name: 'LinkedIn', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  },
  youtube: { 
    name: 'YouTube', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  },
  tiktok: { 
    name: 'TikTok', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  },
  threads: { 
    name: 'Threads', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.129-.73-1.818-1.857-1.818-3.336 0-1.501.697-2.748 1.98-3.549.932-.582 2.106-.873 3.408-.846.896.017 1.727.178 2.508.488v-.695c0-1.173-.394-2.02-1.174-2.522-.651-.418-1.527-.59-2.612-.518-1.256.085-2.29.423-3.074.998l-.546-1.938c.968-.684 2.297-1.134 3.952-1.243 1.443-.097 2.718.13 3.796.676 1.326.672 2.015 1.854 2.048 3.512v2.254c1.175.584 2.09 1.428 2.697 2.49.739 1.29.883 3.008-.235 4.855-1.26 2.082-3.5 3.136-6.848 3.213z"/></svg>
  },
  pinterest: { 
    name: 'Pinterest', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
  },
  google_business: { 
    name: 'Google Business', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
  },
  twitch: { 
    name: 'Twitch', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>
  },
  rumble: { 
    name: 'Rumble', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
  },
  kick: { 
    name: 'Kick', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.45 3.73L12 11.63 4.55 7.91 12 4.18zM4 9.68l7 3.5v7.64l-7-3.5V9.68zm9 11.14v-7.64l7-3.5v7.64l-7 3.5z"/></svg>
  },
  truth_social: { 
    name: 'Truth Social', 
    svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3.5 5.5l-3 3-3-3-1.5 1.5 3 3-3 3 1.5 1.5 3-3 3 3 1.5-1.5-3-3 3-3-1.5-1.5z"/></svg>
  },
};

const PRIMARY_COLORS = [
  { name: 'Gold',    color: '#d4af37' },
  { name: 'Blue',    color: '#3b82f6' },
  { name: 'Purple',  color: '#8b5cf6' },
  { name: 'Green',   color: '#10b981' },
  { name: 'Red',     color: '#ef4444' },
  { name: 'Pink',    color: '#ec4899' },
  { name: 'Orange',  color: '#f97316' },
  { name: 'Teal',    color: '#14b8a6' },
  { name: 'Indigo',  color: '#6366f1' },
  { name: 'Emerald', color: '#059669' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const { settings: appearance, updateSettings: updateAppearance } = useAppearance();

  // Navigation items for sidebar customization
  const navigationItems = [
    { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
    { name: 'Content', href: 'Content', icon: Calendar, badge: 'AI' },
    { name: 'Inbox', href: 'Inbox', icon: MessageSquare },
    { name: 'Advanced Analytics', href: 'AdvancedAnalytics', icon: TrendingUp, badge: 'NEW' },
    { name: 'AI Assistant', href: 'AIAssistant', icon: Sparkles },
    { name: 'AI Calendar', href: 'AIContentCalendar', icon: Calendar, badge: 'AI' },
    { name: 'Analytics', href: 'AnalyticsDashboard', icon: BarChart3 },
    { name: 'Approvals', href: 'WorkflowApprovals', icon: CheckCircle2 },
    { name: 'Auto Notifications', href: 'LiveNotifications', icon: Bell, badge: 'AI' },
    { name: 'Auto Optimization', href: 'AutonomousOptimization', icon: Zap, badge: 'AI' },
    { name: 'Automations', href: 'Automations', icon: Zap },
    { name: 'Benchmarking', href: 'Benchmarking', icon: Target },
    { name: 'Campaign Builder', href: 'CampaignBuilder', icon: Zap, badge: 'NEW' },
    { name: 'Campaigns', href: 'Campaigns', icon: Target },
    { name: 'Creator Economy', href: 'CreatorEconomy', icon: Users, badge: 'NEW' },
    { name: 'E-commerce', href: 'EcommerceTracking', icon: ShoppingBag },
    { name: 'Historical Reports', href: 'HistoricalReports', icon: BarChart3 },
    { name: 'Media Library', href: 'MediaLibrary', icon: FolderOpen },
    { name: 'Monetization', href: 'Monetization', icon: DollarSign },
    { name: 'Predictive Revenue', href: 'PredictiveMonetization', icon: DollarSign, badge: 'AI' },
    { name: 'Social Listening', href: 'SocialListening', icon: Radio }
  ];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const { data: accounts = [] } = useQuery({
    queryKey: ['social-accounts'],
    queryFn: () => base44.entities.SocialAccount.list()
  });

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => base44.entities.Workspace.list()
  });

  const currentWorkspace = workspaces[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your account, workspace, and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:w-64 shrink-0 h-fit">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'workspace', icon: Building2, label: 'Workspace' },
                { id: 'accounts', icon: Link2, label: 'Connected Accounts' },
                { id: 'white-label', icon: Sparkles, label: 'White-Label', premium: true },
                { id: 'reports', icon: FileText, label: 'Client Reports', premium: true },
                { id: 'ai-preferences', icon: Sparkles, label: 'AI Preferences' },
                { id: 'appearance', icon: Palette, label: 'Appearance' },
                { id: 'sidebar', icon: LayoutDashboard, label: 'Sidebar Menu' },
                { id: 'team', icon: Users, label: 'Team Members' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'billing', icon: CreditCard, label: 'Billing' },
                { id: 'security', icon: Shield, label: 'Security' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === item.id 
                    ? "" 
                    : "text-slate-600 hover:bg-slate-50"
                  )}
                  style={activeTab === item.id ? { backgroundColor: `${appearance.primaryColor}18`, color: appearance.primaryColor } : {}}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.premium && <Crown className="w-4 h-4 text-[#d4af37]" />}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user?.avatar_url} />
                    <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37] text-2xl">
                      {user?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline">Change Photo</Button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={user?.full_name} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input defaultValue={user?.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="America/New_York">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'workspace' && (
            <Card>
              <CardHeader>
                <CardTitle>Workspace Settings</CardTitle>
                <CardDescription>Manage your workspace configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={currentWorkspace?.logo_url} />
                    <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37] text-xl">
                      {currentWorkspace?.name?.charAt(0) || 'W'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">Upload Logo</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workspace Name</Label>
                    <Input defaultValue={currentWorkspace?.name || 'My Workspace'} />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select defaultValue={currentWorkspace?.industry || 'technology'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input placeholder="https://yourwebsite.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Timezone</Label>
                    <Select defaultValue="America/New_York">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === 'white-label' && (
            <WhiteLabelSettings workspace={currentWorkspace} />
          )}

          {activeTab === 'reports' && (
            <ClientReportGenerator workspace={currentWorkspace} />
          )}

          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <SyncStatusCard accounts={accounts} />
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Connected Accounts</CardTitle>
                      <CardDescription>Connect your social media accounts</CardDescription>
                    </div>
                    <Button className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]">
                      <Plus className="w-4 h-4 mr-2" />
                      Connect Account
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {accounts.length > 0 ? (
                    <div className="space-y-4">
                      {accounts.map(account => {
                        const config = platformConfig[account.platform];
                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-200"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                {config?.svg}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{account.account_name}</p>
                                  {account.health_status === 'healthy' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                  )}
                                </div>
                                <p className="text-sm text-slate-500">{config?.name} • {account.account_handle}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Reconnect
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Link2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <h3 className="font-medium text-slate-900 mb-1">No accounts connected</h3>
                      <p className="text-sm text-slate-500 mb-4">Connect your social media accounts to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Platforms */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Platforms</CardTitle>
                  <CardDescription>Connect more social media platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(platformConfig).map(([key, config]) => (
                      <button
                        key={key}
                        className="p-4 rounded-xl border border-slate-200 hover:border-[#d4af37] hover:shadow-md transition-all text-center group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                          {config.svg}
                        </div>
                        <p className="font-medium text-sm">{config.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Connect</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'team' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team and their permissions</CardDescription>
                  </div>
                  <Button className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]">
                    <Plus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: user?.full_name || 'You', email: user?.email || 'you@example.com', role: 'Owner', status: 'active' },
                    { name: 'Sarah Johnson', email: 'sarah@example.com', role: 'Admin', status: 'active' },
                    { name: 'Mike Chen', email: 'mike@example.com', role: 'Editor', status: 'active' },
                    { name: 'Emily Davis', email: 'emily@example.com', role: 'Analyst', status: 'invited' },
                  ].map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37]">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            {i === 0 && <Badge variant="secondary">You</Badge>}
                            {member.status === 'invited' && (
                              <Badge variant="secondary" className="bg-amber-50 text-amber-700">Pending</Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Select defaultValue={member.role.toLowerCase()}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="analyst">Analyst</SelectItem>
                          </SelectContent>
                        </Select>
                        {i !== 0 && (
                          <Button variant="ghost" size="icon" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'ai-preferences' && (
            <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#d4af37]" />
                  AI Assistant Preferences
                </CardTitle>
                <CardDescription>Customize how the AI assistant interacts with you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>AI Tone of Voice</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly & Casual</SelectItem>
                      <SelectItem value="concise">Concise & Direct</SelectItem>
                      <SelectItem value="detailed">Detailed & Explanatory</SelectItem>
                      <SelectItem value="creative">Creative & Playful</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">How the AI assistant should communicate with you</p>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Content Style</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="formal">Formal & Business</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="casual">Casual & Conversational</SelectItem>
                      <SelectItem value="trendy">Trendy & Modern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Content Length</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                      <SelectItem value="medium">Medium (2-3 sentences)</SelectItem>
                      <SelectItem value="long">Long (3-5 sentences)</SelectItem>
                      <SelectItem value="thread">Thread (Multiple posts)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <Label>Priority Platforms</Label>
                  <p className="text-sm text-slate-500">AI will optimize content for these platforms first</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['Instagram', 'Twitter/X', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube'].map((platform) => (
                      <label key={platform} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-[#d4af37] cursor-pointer transition-colors">
                        <input type="checkbox" className="rounded text-[#d4af37]" defaultChecked={['Instagram', 'Twitter/X'].includes(platform)} />
                        <span className="text-sm">{platform}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Use Emojis</p>
                      <p className="text-sm text-slate-500">Include emojis in generated content</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Include Hashtags</p>
                      <p className="text-sm text-slate-500">Automatically suggest relevant hashtags</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Call-to-Action</p>
                      <p className="text-sm text-slate-500">Include CTAs in generated posts</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Data-Driven Insights</p>
                      <p className="text-sm text-slate-500">Prioritize analytics-based recommendations</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t">
                  <Label>Brand Voice Keywords</Label>
                  <Textarea 
                    placeholder="e.g., innovative, customer-focused, sustainable, professional..."
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-slate-500">Keywords that describe your brand voice and style</p>
                </div>

                <Button className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a] w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Save AI Preferences
                </Button>
              </CardContent>
            </Card>
            </>
          )}

          {activeTab === 'sidebar' && (
            <SidebarCustomizer 
              navigationItems={navigationItems}
              onOrderChange={() => {
                // Trigger layout refresh
                window.location.reload();
              }}
            />
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-[#d4af37]" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>Customize the look and feel of your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Dark Mode */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-slate-500">Toggle dark mode for the entire app</p>
                  </div>
                  <Switch
                    checked={appearance.darkMode}
                    onCheckedChange={(val) => updateAppearance({ darkMode: val })}
                  />
                </div>

                {/* Primary Color */}
                <div className="space-y-3">
                  <Label>Primary Color</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {PRIMARY_COLORS.map((item) => {
                      const isActive = appearance.primaryColor === item.color;
                      return (
                        <button
                          key={item.name}
                          onClick={() => updateAppearance({ primaryColor: item.color })}
                          className="group relative"
                        >
                          <div
                            className={cn(
                              "w-full aspect-square rounded-xl border-2 transition-all",
                              isActive ? "border-slate-800 scale-105 shadow-md" : "border-slate-200 hover:border-slate-400"
                            )}
                            style={{ backgroundColor: item.color }}
                          />
                          <div className={cn(
                            "absolute inset-0 flex items-center justify-center transition-opacity",
                            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                          )}>
                            <Check className="w-5 h-5 text-white drop-shadow-lg" />
                          </div>
                          <p className="text-xs text-center mt-1 text-slate-600">{item.name}</p>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400">Active color: <span className="font-mono">{appearance.primaryColor}</span> — applied instantly across the app</p>
                </div>

                {/* Sidebar Style */}
                <div className="space-y-2 pt-4 border-t">
                  <Label>Sidebar Style</Label>
                  <Select
                    value={appearance.sidebarStyle}
                    onValueChange={(val) => updateAppearance({ sidebarStyle: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="expanded">Expanded</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400">Controls sidebar density and spacing</p>
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={appearance.fontSize}
                    onValueChange={(val) => updateAppearance({ fontSize: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (13px)</SelectItem>
                      <SelectItem value="medium">Medium (14px)</SelectItem>
                      <SelectItem value="large">Large (16px)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400">Base font size across the app</p>
                </div>

                <div className="pt-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  ✓ All changes apply <strong>instantly</strong> and are saved automatically to your browser.
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: 'Email Notifications', description: 'Receive updates via email', defaultChecked: true },
                  { title: 'Push Notifications', description: 'Receive notifications in browser', defaultChecked: true },
                  { title: 'New Comments', description: 'Get notified when someone comments', defaultChecked: true },
                  { title: 'Mentions', description: 'Get notified when you are mentioned', defaultChecked: true },
                  { title: 'Performance Alerts', description: 'Get alerts about unusual metrics', defaultChecked: true },
                  { title: 'Weekly Reports', description: 'Receive weekly performance summary', defaultChecked: false },
                  { title: 'Team Activity', description: 'Get updates on team actions', defaultChecked: false },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.defaultChecked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white">
                    <div>
                      <Badge className="bg-[#d4af37] text-[#1a1a1a] mb-2">Professional Plan</Badge>
                      <p className="text-3xl font-bold">$49<span className="text-lg font-normal">/month</span></p>
                      <p className="text-white/80 mt-1">Billed monthly • Renews Aug 1, 2024</p>
                    </div>
                    <Button variant="secondary" className="bg-[#d4af37] text-[#1a1a1a] hover:bg-[#c9a961]">
                      Upgrade Plan
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                      { label: 'Connected Accounts', value: '5 / 10' },
                      { label: 'Team Members', value: '4 / 5' },
                      { label: 'Scheduled Posts', value: '45 / ∞' },
                      { label: 'AI Credits', value: '850 / 1000' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-lg bg-slate-50">
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <p className="text-xl font-semibold mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-slate-500">Expires 12/2025</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-medium">Change Password</p>
                      <p className="text-sm text-slate-500">Update your password regularly</p>
                    </div>
                    <Button variant="outline">Change</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-slate-500">Add an extra layer of security</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-slate-500">Manage devices where you're logged in</p>
                    </div>
                    <Button variant="outline">View</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                    <div>
                      <p className="font-medium text-red-700">Delete Account</p>
                      <p className="text-sm text-red-600">Permanently delete your account and data</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}