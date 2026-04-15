import React, { useState, useEffect, useRef } from 'react';
import { useAppearance } from '@/lib/AppearanceContext';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  Zap,
  ChevronDown,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Building2,
  Sparkles,
  Image,
  HelpCircle,
  ChevronRight,
  DollarSign,
  Lightbulb,
  GitBranch,
  MapPin,
  Megaphone,
  Briefcase,
  Headphones,
  Crown
} from 'lucide-react';
import InteractiveTour from '@/components/InteractiveTour';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useWorkspace } from '@/hooks';


const navigation = [
  { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
  { name: 'Agency Dashboard', href: 'AgencyDashboard', icon: Crown, badge: 'Agency' },
  { name: 'Content', href: 'Content', icon: Calendar, badge: 'AI' },
  { name: 'Inbox', href: 'Inbox', icon: MessageSquare, badge: '12' },
  {
    name: 'Nexia Your AI Partner',
    icon: Sparkles,
    children: [
      { name: 'AI Assistant', href: 'AIAssistant' },
      { name: 'AI Calendar', href: 'AIContentCalendar' },
      { name: 'Auto Optimization', href: 'AutonomousOptimization' },
      { name: 'Auto Notifications', href: 'LiveNotifications' }
    ]
  },
  {
    name: 'Insights',
    icon: Lightbulb,
    children: [
      { name: 'Benchmarking', href: 'Benchmarking' },
      { name: 'Social Listening', href: 'SocialListening' }
    ]
  },
  {
    name: 'Reports',
    icon: BarChart3,
    children: [
      { name: 'Workspace Overview', href: 'WorkspaceOverview', badge: 'NEW' },
      { name: 'Analytics', href: 'AnalyticsDashboard' },
      { name: 'Advanced Analytics', href: 'AdvancedAnalytics' },
      { name: 'Historical Reports', href: 'HistoricalReports' }
    ]
  },
  {
    name: 'Workflow',
    icon: GitBranch,
    children: [
      { name: 'Approvals', href: 'WorkflowApprovals' },
      { name: 'Automations', href: 'Automations' }
    ]
  },
  {
    name: 'Campaigns',
    icon: Megaphone,
    children: [
      { name: 'All Campaigns', href: 'Campaigns' },
      { name: 'Campaign Builder', href: 'CampaignBuilder', badge: 'NEW' }
    ]
  },
  {
    name: 'Revenue & Monetization',
    icon: DollarSign,
    children: [
      { name: 'Predictive Revenue', href: 'PredictiveMonetization', badge: 'AI' },
      { name: 'Monetization', href: 'Monetization' },
      { name: 'Creator Economy', href: 'CreatorEconomy', badge: 'NEW' },
      { name: 'E-commerce', href: 'EcommerceTracking' }
    ]
  },
  {
    name: 'Integrations',
    icon: Zap,
    children: [
      { name: 'All Integrations', href: 'Integrations' },
      { name: 'Pricing & Plans', href: 'Pricing' }
    ]
  }
];

const platformNav = [
  { name: 'Instagram', href: 'Instagram', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg> },
  { name: 'X (Twitter)', href: 'Twitter', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { name: 'Facebook', href: 'Facebook', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { name: 'LinkedIn', href: 'LinkedIn', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  { name: 'TikTok', href: 'TikTok', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  { name: 'Threads', href: 'Threads', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.129-.73-1.818-1.857-1.818-3.336 0-1.501.697-2.748 1.98-3.549.932-.582 2.106-.873 3.408-.846.896.017 1.727.178 2.508.488v-.695c0-1.173-.394-2.02-1.174-2.522-.651-.418-1.527-.59-2.612-.518-1.256.085-2.29.423-3.074.998l-.546-1.938c.968-.684 2.297-1.134 3.952-1.243 1.443-.097 2.718.13 3.796.676 1.326.672 2.015 1.854 2.048 3.512v2.254c1.175.584 2.09 1.428 2.697 2.49.739 1.29.883 3.008-.235 4.855-1.26 2.082-3.5 3.136-6.848 3.213z"/></svg> },
  { name: 'Pinterest', href: 'Pinterest', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg> },
  { name: 'Google Business', href: 'GoogleBusiness', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg> },
  { name: 'YouTube', href: 'YouTube', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { name: 'Bluesky', href: 'Bluesky', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.579 6.87-1.5 7.823-4.308.953 2.808 2.81 9.886 7.823 4.308 4.558-5.073 1.082-6.498-2.83-7.078-.14-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg> },
  { name: 'Shopify', href: 'Shopify', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192-.098 0-1.87-.038-1.87-.038s-1.251-1.232-1.388-1.368v20.889zM12.494 7.006s-.658-.193-1.734-.193c-2.778 0-4.119 1.735-4.119 3.41 0 1.87 1.29 2.758 2.508 3.547 1.023.66 1.388 1.12 1.388 1.735 0 .852-.678 1.348-1.562 1.348-1.332 0-2.065-.833-2.065-.833l-.368 1.734s.891.696 2.354.696c2.28 0 3.837-1.425 3.837-3.373 0-1.812-1.29-2.758-2.374-3.45-1.023-.66-1.522-1.083-1.522-1.773 0-.677.562-1.23 1.562-1.23.967 0 1.753.387 1.753.387l.342-1.705zM8.19.388C8.19.388 7.73.194 6.764.194 4.68.194 3.68 1.465 3.68 2.8c0 1.272.888 2.066 2.07 2.85.95.628 1.327 1.063 1.327 1.716 0 .83-.66 1.31-1.527 1.31-1.3 0-2.01-.81-2.01-.81l-.36 1.69s.87.68 2.295.68c2.225 0 3.746-1.39 3.746-3.29C9.22 3.39 7.957 2.47 6.898 1.8 5.9 1.16 5.415.74 5.415.1V0l2.775.388z"/></svg> },
  { name: 'Spotify', href: 'Spotify', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg> },
  { name: 'Twitch', href: 'Twitch', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg> },
  { name: 'Kick', href: 'Kick', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.45 3.73L12 11.63 4.55 7.91 12 4.18zM4 9.68l7 3.5v7.64l-7-3.5V9.68zm9 11.14v-7.64l7-3.5v7.64l-7 3.5z"/></svg> },
  { name: 'Rumble', href: 'Rumble', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> },
  { name: 'Truth Social', href: 'TruthSocial', svg: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3.5 5.5l-3 3-3-3-1.5 1.5 3 3-3 3 1.5 1.5 3-3 3 3 1.5-1.5-3-3 3-3-1.5-1.5z"/></svg> }
];

const bottomNav = [
  {
    name: 'Management',
    icon: Briefcase,
    children: [
      { name: 'Workflow Approvals', href: 'WorkflowApprovals' },
      { name: 'Team', href: 'Team' },
      { name: 'Role Management', href: 'RoleManagement' },
      { name: 'Client Portal', href: 'ClientPortal' },
      { name: 'Agency Client Mgmt', href: 'AgencyClientManagement', badge: 'Agency' }
    ]
  },
  { name: 'Media Library', href: 'MediaLibrary', icon: Image },
  { name: 'Settings', href: 'Settings', icon: Settings },
  { name: 'Customer Support', href: 'CustomerSupport', icon: Headphones },
  { name: 'Help', href: 'Help', icon: HelpCircle }
];

// ── Hover-expandable nav group ────────────────────────────────────────────────
function NavGroup({ item, collapsed, currentPageName, primary = '#d4af37' }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 120);
  };

  if (collapsed) {
    // In collapsed mode use tooltip + dropdown
    return (
      <Tooltip delayDuration={0}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <button className="w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150">
                <item.icon className="w-5 h-5 flex-shrink-0" />
              </button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-52 ml-1">
            <DropdownMenuLabel className="text-xs text-slate-400">{item.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.children.map((child) => (
              <DropdownMenuItem key={child.name} asChild>
                <Link to={createPageUrl(child.href)} className="cursor-pointer text-sm">
                  {child.name}
                  {child.badge && <Badge variant="secondary" className="ml-auto text-[10px]">{child.badge}</Badge>}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          open ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        <item.icon className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">{item.name}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-slate-400", open && "rotate-180")} />
      </button>

      {/* Animated sub-items */}
      <div className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="ml-3 pl-3 border-l border-slate-100 mt-0.5 pb-0.5 space-y-0.5">
          {item.children.map((child) => {
            const isActive = currentPageName === child.href;
            return (
              <Link
                key={child.name}
                to={createPageUrl(child.href)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150",
                  isActive
                    ? "text-slate-800"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
                style={isActive ? { backgroundColor: `${primary}18`, color: primary } : {}}
              >
                {child.name}
                {child.badge && (
                  <Badge variant="secondary" className={cn("text-[10px] ml-auto", child.badge === 'AI' && "bg-[#d4af37]/10 text-[#d4af37] border-0")}>
                    {child.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Simple nav link ───────────────────────────────────────────────────────────
function NavLink({ item, collapsed, currentPageName, primary = '#d4af37' }) {
  if (!item.href) return null;
  const isActive = currentPageName === item.href;

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            to={createPageUrl(item.href)}
            className={cn(
              "flex items-center justify-center px-2 py-2.5 rounded-lg transition-all duration-150",
              isActive ? "" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            )}
            style={isActive ? { backgroundColor: `${primary}18`, color: primary } : {}}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{item.name}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      to={createPageUrl(item.href)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
        isActive ? "" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      )}
      style={isActive ? { backgroundColor: `${primary}18`, color: primary } : {}}
    >
      <item.icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{item.name}</span>
      {item.badge && (
        <Badge
          variant="secondary"
          className={cn("text-[10px]", item.badge === 'AI' && "bg-[#d4af37] text-slate-950 border-0")}
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}

// ── Platforms hover group ─────────────────────────────────────────────────────
function PlatformsGroup({ collapsed }) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => { clearTimeout(timeoutRef.current); setOpen(true); };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setOpen(false), 120); };

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltipTrigger asChild>
              <button className="w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all duration-150">
                <Building2 className="w-5 h-5 flex-shrink-0" />
              </button>
            </TooltipTrigger>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-52 ml-1">
            <DropdownMenuLabel className="text-xs text-slate-400">Social Platforms</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {platformNav.map((item) => (
              <DropdownMenuItem key={item.name} asChild>
                <Link to={createPageUrl(item.href)} className="cursor-pointer text-sm">
                  <span className="mr-2">{item.svg}</span>{item.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="right">All Platforms</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
          open ? "bg-slate-100 text-slate-800" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        <Building2 className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left">All Platforms</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-slate-400", open && "rotate-180")} />
      </button>
      <div className={cn(
        "overflow-hidden transition-all duration-200 ease-in-out",
        open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="ml-3 pl-3 border-l border-slate-100 mt-0.5 pb-0.5 space-y-0.5">
          {platformNav.map((item) => (
            <Link
              key={item.name}
              to={createPageUrl(item.href)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-150"
            >
              {item.svg}{item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const { settings: appearance } = useAppearance();
  const primary = appearance.primaryColor || '#d4af37';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(appearance.sidebarStyle === 'compact');
  const [user, setUser] = useState(null);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [tourShownThisSession, setTourShownThisSession] = useState(false);
  const navigate = useNavigate();

  const { data: workspaces = [] } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const list = await base44.entities.Workspace.filter({ status: 'active' });
      if (list.length === 0) {
        const userData = await base44.auth.me();
        const newWorkspace = await base44.entities.Workspace.create({
          name: `${userData?.full_name || 'My'}'s Workspace`,
          slug: `workspace-${Date.now()}`,
          plan: 'starter',
          status: 'active',
          member_count: 1,
          connected_accounts_count: 0
        });
        return [newWorkspace];
      }
      return list;
    },
    enabled: !isAuthenticating
  });

  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) setCurrentWorkspace(workspaces[0]);
  }, [workspaces, currentWorkspace]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    if (user && !user.onboarding_completed && currentPageName !== 'Onboarding') {
      navigate(createPageUrl('Onboarding'));
    }
    if (user && user.onboarding_completed && !user.tour_completed && !tourShownThisSession) {
      setShowTour(true);
      setTourShownThisSession(true);
    }
  }, [user, currentPageName, navigate, tourShownThisSession]);

  const getOrderedNavigation = (navItems) => {
    if (!user?.sidebar_order) return navItems;
    const orderedItems = user.sidebar_order.map(name => navItems.find(item => item.name === name)).filter(Boolean);
    const newItems = navItems.filter(item => !user.sidebar_order.includes(item.name));
    return [...orderedItems, ...newItems];
  };

  const shouldShowAgencyNav = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return user?.role === 'admin' || urlParams.get('agency') === 'true';
  };

  const checkAuthAndLoadData = async () => {
    try {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) { base44.auth.redirectToLogin(); return; }
      const userData = await base44.auth.me();
      setUser(userData);
      setIsAuthenticating(false);
    } catch (error) {
      console.error('Authentication error:', error);
      base44.auth.redirectToLogin();
    }
  };

  const handleLogout = () => base44.auth.logout();
  const handleTourComplete = async () => { setShowTour(false); await base44.auth.updateMe({ tour_completed: true }); };
  const handleTourSkip = async () => { setShowTour(false); await base44.auth.updateMe({ tour_completed: true }); };
  const handleRestartTour = () => setShowTour(true);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/fe677119b_image.png" alt="Logo" className="w-12 h-12 object-contain mx-auto mb-4 animate-pulse" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const fullWidthPages = ['Onboarding', 'ConnectAccounts', 'Landing'];
  if (fullWidthPages.includes(currentPageName)) return <div className="min-h-screen">{children}</div>;

  const mobileBottomNav = [
    { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
    { name: 'Content', href: 'Content', icon: Calendar },
    { name: 'Inbox', href: 'Inbox', icon: MessageSquare },
    { name: 'Analytics', href: 'AnalyticsDashboard', icon: BarChart3 },
    { name: 'More', icon: Menu, onClick: () => setSidebarOpen(true) }
  ];

  // ── Shared sidebar nav render ─────────────────────────────────────────────
  const renderNavItems = (items) =>
    getOrderedNavigation(items)
      .filter(item => item.href !== 'AgencyDashboard' || shouldShowAgencyNav())
      .map((item) =>
        item.children
          ? <NavGroup key={item.name} item={item} collapsed={collapsed} currentPageName={currentPageName} primary={primary} />
          : <NavLink key={item.name} item={item} collapsed={collapsed} currentPageName={currentPageName} primary={primary} />
      );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Desktop Sidebar ── */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 hidden lg:flex flex-col bg-white border-r border-slate-100 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-60"
        )}>
          {/* Logo */}
          <div className={cn(
            "flex items-center h-14 px-4 border-b border-slate-100",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/fe677119b_image.png" alt="Logo" className="w-7 h-7 object-contain" />
                <span className="font-semibold text-slate-900">SocialHub</span>
              </div>
            )}
            {collapsed && <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/fe677119b_image.png" alt="Logo" className="w-7 h-7 object-contain" />}
            <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:flex w-6 h-6 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <ChevronRight className={cn("w-3.5 h-3.5 transition-transform duration-200", collapsed ? "" : "rotate-180")} />
            </button>
          </div>

          {/* Workspace switcher */}
          {!collapsed && (
            <div className="px-3 py-2.5 border-b border-slate-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-50 transition-all duration-150 text-left">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src={currentWorkspace?.logo_url} />
                      <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-bold">
                        {currentWorkspace?.name?.charAt(0) || 'W'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{currentWorkspace?.name || 'Select Workspace'}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{currentWorkspace?.plan || 'Free'} Plan</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-xs">Workspaces</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {workspaces.map((ws) => (
                    <DropdownMenuItem key={ws.id} onClick={() => setCurrentWorkspace(ws)} className="cursor-pointer text-sm">
                      <Avatar className="h-5 w-5 mr-2">
                        <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37] text-[10px]">{ws.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {ws.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('CreateWorkspace')} className="cursor-pointer text-sm">
                      <Plus className="w-4 h-4 mr-2" />Create Workspace
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Nav */}
          <ScrollArea className="flex-1 py-3">
            <nav className="px-2 space-y-0.5">
              {renderNavItems(navigation.slice(0, 3))}
              <PlatformsGroup collapsed={collapsed} />
              {renderNavItems(navigation.slice(3))}
            </nav>
          </ScrollArea>

          {/* Bottom nav */}
          <div className="border-t border-slate-100 px-2 py-3 space-y-0.5">
            {bottomNav.map((item) =>
              item.children
                ? <NavGroup key={item.name} item={item} collapsed={collapsed} currentPageName={currentPageName} primary={primary} />
                : <NavLink key={item.name} item={item} collapsed={collapsed} currentPageName={currentPageName} primary={primary} />
            )}
          </div>
        </aside>

        {/* ── Mobile Drawer ── */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 flex lg:hidden flex-col bg-white border-r border-slate-100 transition-transform duration-300 w-72",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/fe677119b_image.png" alt="Logo" className="w-7 h-7 object-contain" />
              <span className="font-semibold text-slate-900">SocialHub</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          <ScrollArea className="flex-1 py-3">
            <nav className="px-2 space-y-0.5">
              {getOrderedNavigation(navigation)
                .filter(item => item.href !== 'AgencyDashboard' || shouldShowAgencyNav())
                .map((item) =>
                  item.children ? (
                    <NavGroup key={item.name} item={item} collapsed={false} currentPageName={currentPageName} primary={primary} />
                  ) : (
                    <NavLink key={item.name} item={item} collapsed={false} currentPageName={currentPageName} primary={primary} />
                  )
                )}
              <PlatformsGroup collapsed={false} />
            </nav>
          </ScrollArea>

          <div className="border-t border-slate-100 px-2 py-3 space-y-0.5">
            {bottomNav.map((item) =>
              item.children
                ? <NavGroup key={item.name} item={item} collapsed={false} currentPageName={currentPageName} primary={primary} />
                : <NavLink key={item.name} item={item} collapsed={false} currentPageName={currentPageName} primary={primary} />
            )}
          </div>
        </aside>

        {/* ── Main ── */}
        <div className={cn("transition-all duration-300 pb-20 lg:pb-0", collapsed ? "lg:pl-[68px]" : "lg:pl-60")}>
          <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b border-slate-100">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center gap-3">
                <Link to={createPageUrl('Dashboard')} className="lg:hidden">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/fe677119b_image.png" alt="Logo" className="w-7 h-7 object-contain" />
                </Link>
                <div className="hidden md:flex relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <Input placeholder="Search..." className="w-64 lg:w-80 pl-9 bg-slate-50 border-slate-200 focus:bg-white rounded-lg h-9 text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link to={createPageUrl('Content')}>
                  <Button size="sm" className="font-semibold h-8 rounded-lg gap-1.5" style={{ backgroundColor: primary, color: '#1a1a1a' }}>
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Create</span>
                  </Button>
                </Link>

                <button className="relative hidden lg:flex w-8 h-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-2 h-8 rounded-lg hover:bg-slate-100 transition-all">
                      <Avatar className="h-6 w-6 ring-2 ring-[#d4af37]/20">
                        <AvatarImage src={user?.avatar_url} />
                        <AvatarFallback className="bg-[#d4af37] text-slate-950 text-[10px] font-bold">
                          {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm">{user?.full_name || 'User'}</span>
                        <span className="text-xs font-normal text-slate-400">{user?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Settings')} className="cursor-pointer text-sm"><Settings className="w-3.5 h-3.5 mr-2" />Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Team')} className="cursor-pointer text-sm"><Users className="w-3.5 h-3.5 mr-2" />Team</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleRestartTour} className="cursor-pointer text-sm">
                      <MapPin className="w-3.5 h-3.5 mr-2" />Take Product Tour
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer text-sm">
                      <LogOut className="w-3.5 h-3.5 mr-2" />Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="p-4 lg:p-6 min-h-screen">{children}</main>
        </div>

        {/* ── Mobile bottom nav ── */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/90 backdrop-blur-xl border-t border-slate-100">
          <div className="flex items-center justify-around h-16 px-2">
            {mobileBottomNav.map((item) => {
              const isActive = currentPageName === item.href;
              const Icon = item.icon;
              if (item.onClick) {
                return (
                  <button key={item.name} onClick={item.onClick} className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-95">
                    <div className="p-2 rounded-xl"><Icon className="w-5 h-5 text-slate-500" /></div>
                    <span className="text-[10px] font-medium text-slate-500">{item.name}</span>
                  </button>
                );
              }
              return (
                <Link key={item.name} to={createPageUrl(item.href)} className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all active:scale-95">
                  <div className="p-2 rounded-xl transition-all" style={isActive ? { backgroundColor: `${primary}18` } : {}}>
                    <Icon className="w-5 h-5 transition-colors" style={{ color: isActive ? primary : undefined }} />
                  </div>
                  <span className="text-[10px] font-medium transition-colors" style={{ color: isActive ? primary : undefined }}>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {showTour && <InteractiveTour onComplete={handleTourComplete} onSkip={handleTourSkip} />}
    </TooltipProvider>
  );
}