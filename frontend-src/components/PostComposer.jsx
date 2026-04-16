import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Image,
  Video,
  Link2,
  Smile,
  Hash,
  AtSign,
  Calendar as CalendarIcon,
  Clock,
  Send,
  Sparkles,
  Wand2,
  Eye,
  X,
  Upload,
  MoreHorizontal,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Users,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  ThumbsUp,
  MessageCircle,
  Share2 } from
'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import ProfitabilityCard from '@/components/ProfitabilityCard';
import ComplianceChecker from '@/components/ComplianceChecker';
import PlatformFeatures from '@/components/PlatformFeatures';
import MediaLibraryPicker from '@/components/MediaLibraryPicker';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';

const platforms = [
{ id: 'instagram', name: 'Instagram', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>, maxLength: 2200 },
{ id: 'twitter', name: 'X (Twitter)', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, maxLength: 280 },
{ id: 'facebook', name: 'Facebook', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, maxLength: 63206 },
{ id: 'linkedin', name: 'LinkedIn', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>, maxLength: 3000 },
{ id: 'tiktok', name: 'TikTok', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>, maxLength: 2200 },
{ id: 'threads', name: 'Threads', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.129-.73-1.818-1.857-1.818-3.336 0-1.501.697-2.748 1.98-3.549.932-.582 2.106-.873 3.408-.846.896.017 1.727.178 2.508.488v-.695c0-1.173-.394-2.02-1.174-2.522-.651-.418-1.527-.59-2.612-.518-1.256.085-2.29.423-3.074.998l-.546-1.938c.968-.684 2.297-1.134 3.952-1.243 1.443-.097 2.718.13 3.796.676 1.326.672 2.015 1.854 2.048 3.512v2.254c1.175.584 2.09 1.428 2.697 2.49.739 1.29.883 3.008-.235 4.855-1.26 2.082-3.5 3.136-6.848 3.213z"/></svg>, maxLength: 500 },
{ id: 'pinterest', name: 'Pinterest', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>, maxLength: 500 },
{ id: 'youtube', name: 'YouTube', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>, maxLength: 5000 },
{ id: 'bluesky', name: 'Bluesky', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.579 6.87-1.5 7.823-4.308.953 2.808 2.81 9.886 7.823 4.308 4.558-5.073 1.082-6.498-2.83-7.078-.14-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg>, maxLength: 300 },
{ id: 'twitch', name: 'Twitch', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>, maxLength: 500 },
{ id: 'rumble', name: 'Rumble', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>, maxLength: 1000 },
{ id: 'kick', name: 'Kick', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.45 3.73L12 11.63 4.55 7.91 12 4.18zM4 9.68l7 3.5v7.64l-7-3.5V9.68zm9 11.14v-7.64l7-3.5v7.64l-7 3.5z"/></svg>, maxLength: 500 },
{ id: 'truth_social', name: 'Truth Social', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3.5 5.5l-3 3-3-3-1.5 1.5 3 3-3 3 1.5 1.5 3-3 3 3 1.5-1.5-3-3 3-3-1.5-1.5z"/></svg>, maxLength: 500 },
{ id: 'google_business', name: 'Google Business', icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>, maxLength: 1500 }];


const platformColors = {
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500',
  facebook: 'bg-blue-500',
  twitter: 'bg-slate-800',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-slate-900',
  threads: 'bg-slate-700',
  pinterest: 'bg-red-600',
  youtube: 'bg-red-600',
  twitch: 'bg-purple-600',
  rumble: 'bg-green-600',
  kick: 'bg-emerald-600',
  google_business: 'bg-blue-600'
};

export default function PostComposer({
  post = null,
  onSave,
  onPublish,
  onClose,
  isLoading = false
}) {
  const [content, setContent] = useState(post?.content?.text || '');
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    post?.platforms?.map((p) => p.platform) || ['instagram']
  );
  const [postType, setPostType] = useState(post?.post_type || 'post');
  const [scheduleType, setScheduleType] = useState('now');
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState('daily');
  const [recurringEndDate, setRecurringEndDate] = useState(null);
  const [media, setMedia] = useState(post?.media || []);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiScore, setAiScore] = useState(null);
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState(null);
  const [isSponsored, setIsSponsored] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const fileInputRef = useRef(null);

  const { data: workspaceMembers = [] } = useQuery({
    queryKey: ['workspace-members'],
    queryFn: async () => {
      const workspaces = await api.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return [];
      return api.entities.WorkspaceMember.filter({ 
        workspace_id: workspaces[0].id,
        status: 'active'
      });
    }
  });

  // Check plan-based features availability
  const { data: subscription } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: async () => {
      const user = await api.auth.me();
      const workspaces = await api.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return null;
      
      const subs = await api.entities.Subscription.filter({
        user_email: user.email,
        workspace_id: workspaces[0].id
      });
      
      return subs[0] || null;
    }
  });

  const planId = subscription?.plan_id || 'free';
  const hasAdvancedFeatures = ['growth', 'professional', 'agency'].includes(planId);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
    prev.includes(platformId) ?
    prev.filter((p) => p !== platformId) :
    [...prev, platformId]
    );
  };

  const getCharacterLimit = () => {
    const limits = selectedPlatforms.map((p) =>
    platforms.find((pl) => pl.id === p)?.maxLength || 2200
    );
    return Math.min(...limits);
  };

  const handleAIEnhance = async () => {
    setShowAIPanel(true);
    if (!content?.text?.trim()) return;
    try {
      const analysis = await api.functions.invoke('analyzePost', {
        content: content.text,
        platforms: selectedPlatforms,
        post_type: postType || 'post',
      });
      setAiScore({
        overall:        analysis.overall_score     || 0,
        engagement:     analysis.engagement_score  || 0,
        reach:          analysis.reach_score        || 0,
        compliance:     analysis.compliance_score   || 100,
        viralPotential: analysis.viral_potential    || 0,
        suggestions:    analysis.suggestions        || [],
        platformInsights: analysis.platform_insights || selectedPlatforms.map(p => ({
          platform: p, predictedEngagement: '—', predictedReach: 0,
          predictedLikes: 0, predictedComments: 0, predictedShares: 0,
          optimalPostTime: analysis.optimal_post_time || '—',
          audienceActivity: 'Medium', confidence: 'Medium',
        })),
        trendingTopics:   analysis.trending_topics   || [],
        contentRelevance: analysis.content_relevance || { score: 0, suggestions: [] },
        competitorAnalysis: analysis.competitor_analysis || {},
      });
      if (analysis.profitability) setProfitabilityAnalysis(analysis.profitability);
    } catch (err) {
      toast.error('AI analysis failed');
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    // Handle file upload logic here
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMedia((prev) => [...prev, {
          type: file.type.startsWith('video') ? 'video' : 'image',
          url: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSelectFromLibrary = (selectedAssets) => {
    if (Array.isArray(selectedAssets)) {
      // Multiple media assets
      const newMedia = selectedAssets
        .filter(asset => asset.type !== 'template')
        .map(asset => ({
          type: asset.type,
          url: asset.url,
          name: asset.name,
          id: asset.id
        }));
      setMedia(prev => [...prev, ...newMedia]);

      // Handle templates
      const templates = selectedAssets.filter(asset => asset.content);
      if (templates.length > 0) {
        setContent(templates[0].content);
      }
    } else if (selectedAssets) {
      // Single asset
      if (selectedAssets.content) {
        // It's a template
        setContent(selectedAssets.content);
      } else {
        // It's a media asset
        setMedia(prev => [...prev, {
          type: selectedAssets.type,
          url: selectedAssets.url,
          name: selectedAssets.name,
          id: selectedAssets.id
        }]);
      }
    }
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const charLimit = getCharacterLimit();
  const charCount = content.length;
  const isOverLimit = charCount > charLimit;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Composer */}
      <div className="flex-1 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Create Post</CardTitle>
              {onClose &&
              <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              }
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Publish to</Label>
              <div className="flex flex-wrap gap-2">
                {platforms.map((platform) =>
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)} className="bg-slate-50 text-slate-950 px-3 py-2 text-xs font-medium rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground h-8 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">







                    {platform.icon}
                    <span className="text-sm font-medium">{platform.name}</span>
                    {selectedPlatforms.includes(platform.id) &&
                  <CheckCircle2 className="w-4 h-4 text-violet-600" />
                  }
                  </button>
                )}
              </div>
            </div>

            {/* Post Type Selection */}
            <div className="pt-4 border-t border-slate-200">
              <Label className="text-sm font-medium mb-3 block">Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">📱 Regular Post</SelectItem>
                  <SelectItem value="story">⏱️ Story</SelectItem>
                  <SelectItem value="reel">🎬 Reel</SelectItem>
                  <SelectItem value="short">⚡ Short</SelectItem>
                  <SelectItem value="video">🎥 Full Video</SelectItem>
                  <SelectItem value="article">📄 Article (LinkedIn)</SelectItem>
                  <SelectItem value="carousel">🎨 Carousel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Platform-Specific Features */}
            <PlatformFeatures platforms={selectedPlatforms} />

            {/* Content Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="shadow-sm py-2 hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">Content</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIEnhance} className="bg-transparent text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-8 gap-2">


                  <Sparkles className="w-4 h-4 text-violet-600" />
                  AI Enhance
                </Button>
              </div>
              
              <Textarea
                placeholder="What's on your mind? Start typing or use AI to generate content..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(
                  "min-h-[200px] resize-none text-base",
                  isOverLimit && "border-red-500 focus:ring-red-500"
                )} />

              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowMediaLibrary(true)}
                    title="Media Library"
                  >
                    <Image className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload from device"
                  >
                    <Upload className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Text templates">
                    <FileText className="w-5 h-5" onClick={() => setShowMediaLibrary(true)} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Smile className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Hash className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <AtSign className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link2 className="w-5 h-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleMediaUpload}
                  />
                </div>
                
                <div className={cn(
                  "text-sm",
                  isOverLimit ? "text-red-600" : "text-slate-500"
                )}>
                  {charCount} / {charLimit}
                </div>
              </div>
            </div>

            {/* Media Preview */}
            {media.length > 0 &&
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {media.map((item, index) =>
              <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                    {item.type === 'image' ?
                <img src={item.url} alt="" className="w-full h-full object-cover" /> :

                <video src={item.url} className="w-full h-full object-cover" />
                }
                    <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeMedia(index)}>

                      <X className="w-3 h-3" />
                    </Button>
                  </div>
              )}
              </div>
            }

            {/* Team Assignment - Growth+ */}
            {hasAdvancedFeatures && workspaceMembers.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-slate-500" />
                  <Label className="text-sm font-medium">Team Assignment</Label>
                </div>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to team member (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {workspaceMembers.map((member) => (
                      <SelectItem key={member.id} value={member.user_email}>
                        {member.user_email} ({member.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Monetization Options - Growth+ */}
            {hasAdvancedFeatures && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-violet-200 transition-colors">
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-[#d4af37] lucide lucide-dollar-sign w-4 h-4" />
                    <div>
                      <Label className="text-sm font-medium">Sponsored Content</Label>
                      <p className="text-xs text-slate-500">Mark this as paid partnership</p>
                    </div>
                  </div>
                  <Switch
                    checked={isSponsored}
                    onCheckedChange={setIsSponsored} />

                </div>
              </div>
            )}

            {/* Scheduling */}
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <Label className="shadow-sm py-2 hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">When to publish</Label>
              
              <Tabs value={scheduleType} onValueChange={setScheduleType}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="now">Now</TabsTrigger>
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring</TabsTrigger>
                  <TabsTrigger value="optimal">AI Optimal</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule" className="mt-4">
                  <div className="flex flex-wrap gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {moment(scheduledDate).format('MMM D, YYYY')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduledDate}
                          onSelect={setScheduledDate}
                          disabled={(date) => date < new Date()} />

                      </PopoverContent>
                    </Popover>
                    
                    <Select value={scheduledTime} onValueChange={setScheduledTime}>
                      <SelectTrigger className="w-32">
                        <Clock className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }).map((_, hour) =>
                        <React.Fragment key={hour}>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                              {`${hour.toString().padStart(2, '0')}:00`}
                            </SelectItem>
                            <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                              {`${hour.toString().padStart(2, '0')}:30`}
                            </SelectItem>
                          </React.Fragment>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="recurring" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Start: {moment(scheduledDate).format('MMM D, YYYY')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={setScheduledDate}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Select value={scheduledTime} onValueChange={setScheduledTime}>
                        <SelectTrigger className="w-32">
                          <Clock className="w-4 h-4 mr-2" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <React.Fragment key={hour}>
                              <SelectItem value={`${hour.toString().padStart(2, '0')}:00`}>
                                {`${hour.toString().padStart(2, '0')}:00`}
                              </SelectItem>
                              <SelectItem value={`${hour.toString().padStart(2, '0')}:30`}>
                                {`${hour.toString().padStart(2, '0')}:30`}
                              </SelectItem>
                            </React.Fragment>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Repeat Frequency</Label>
                      <Select value={recurringFrequency} onValueChange={setRecurringFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date (Optional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            {recurringEndDate ? moment(recurringEndDate).format('MMM D, YYYY') : 'Never'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={recurringEndDate}
                            onSelect={setRecurringEndDate}
                            disabled={(date) => date < scheduledDate}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-900">
                        <strong>Preview:</strong> Post will be published {recurringFrequency} starting {moment(scheduledDate).format('MMM D, YYYY')} at {scheduledTime}
                        {recurringEndDate && ` until ${moment(recurringEndDate).format('MMM D, YYYY')}`}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="optimal" className="mt-4">
                  <div className="bg-[#d4af37] text-slate-950 p-4 rounded-lg border border-violet-200">
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-slate-950 mt-0.5 lucide lucide-sparkles w-5 h-5" />
                      <div>
                        <p className="text-slate-950 font-medium">AI Recommended Time</p>
                        <p className="shadow-sm py-2 hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">Based on your audience activity, the best time to post is Tomorrow at 9:30 AM. Expected reach: +23% above average.


                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button variant="outline" disabled={isLoading} className="shadow-sm py-2 hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">
                <FileText className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              
              <div className="bg-transparent text-black flex gap-3">
                <Button variant="outline" disabled={isLoading} className="shadow-sm py-2 hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button className="bg-[#d4af37] text-primary-foreground px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 h-9 from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"

                disabled={isLoading || selectedPlatforms.length === 0 || !content.trim()}>

                  {scheduleType === 'now' ?
                  <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Now
                    </> :

                  <>
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      Schedule Post
                    </>
                  }
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Panel */}
      {showAIPanel &&
      <div className="w-full lg:w-80 space-y-4">
          {/* Profitability Analysis - Growth+ only */}
          {profitabilityAnalysis && hasAdvancedFeatures &&
        <ProfitabilityCard
          analysis={profitabilityAnalysis}
          onOptimize={() => {
            // Handle optimization
            console.log('Optimize for revenue');
          }} />

        }

          {/* Compliance Check */}
          <ComplianceChecker
          postContent={content}
          platforms={selectedPlatforms}
          isSponsored={isSponsored} />


          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  AI Analysis
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowAIPanel(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {aiScore ?
            <>
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-200" />

                        <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${aiScore.overall * 2.51} 251`}
                      className="text-violet-600" />

                      </svg>
                      <span className="absolute text-2xl font-bold text-slate-900">
                        {aiScore.overall}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2">Performance Score</p>
                  </div>

                  {/* Detailed Scores */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Engagement</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${aiScore.engagement}%` }} />

                        </div>
                        <span className="text-sm font-medium">{aiScore.engagement}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Reach</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${aiScore.reach}%` }} />

                        </div>
                        <span className="text-sm font-medium">{aiScore.reach}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Compliance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${aiScore.compliance}%` }} />

                        </div>
                        <span className="text-sm font-medium">{aiScore.compliance}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Platform-Specific Insights */}
                  {aiScore.platformInsights && aiScore.platformInsights.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4 text-violet-600" />
                        Platform Performance Predictions
                      </Label>
                      {aiScore.platformInsights.map((insight, i) => {
                        const platform = platforms.find(p => p.id === insight.platform);
                        return (
                          <div key={i} className="p-3 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {platform?.icon}
                                <span className="text-sm font-medium text-slate-900">{platform?.name}</span>
                              </div>
                              <Badge variant={insight.confidence === 'High' ? 'default' : 'secondary'} className="text-xs">
                                {insight.confidence} Confidence
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />
                                <span className="text-slate-600">Engagement: <strong>{insight.predictedEngagement}</strong></span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-blue-600" />
                                <span className="text-slate-600">Reach: <strong>{insight.predictedReach.toLocaleString()}</strong></span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3 text-violet-600" />
                                <span className="text-slate-600">Likes: <strong>{insight.predictedLikes}</strong></span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3 text-amber-600" />
                                <span className="text-slate-600">Comments: <strong>{insight.predictedComments}</strong></span>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600">Optimal Time:</span>
                                <span className="font-medium text-violet-600">{insight.optimalPostTime}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs mt-1">
                                <span className="text-slate-600">Audience Activity:</span>
                                <Badge variant="outline" className="text-xs h-5">
                                  {insight.audienceActivity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Trending Topics */}
                  {aiScore.trendingTopics && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Trending Topics
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {aiScore.trendingTopics.map((topic, i) => (
                          <Badge
                            key={i}
                            variant={topic.trending ? 'default' : 'secondary'}
                            className={topic.trending ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}
                          >
                            {topic.trending && <TrendingUp className="w-3 h-3 mr-1" />}
                            {topic.topic} ({topic.relevance}%)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Content Relevance */}
                  {aiScore.contentRelevance && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-medium text-blue-900">Content Relevance</Label>
                        <span className="text-sm font-bold text-blue-700">{aiScore.contentRelevance.score}/100</span>
                      </div>
                      <div className="space-y-1">
                        {aiScore.contentRelevance.suggestions.map((suggestion, i) => (
                          <p key={i} className="text-xs text-blue-800">• {suggestion}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competitor Analysis */}
                  {aiScore.competitorAnalysis && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <Label className="text-sm font-medium text-emerald-900 mb-2 block">
                        Competitive Analysis
                      </Label>
                      <div className="text-xs text-emerald-800 space-y-1">
                        <div className="flex justify-between">
                          <span>Industry Average:</span>
                          <strong>{aiScore.competitorAnalysis.averageEngagement}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Predicted:</span>
                          <strong>{aiScore.competitorAnalysis.yourPredicted}</strong>
                        </div>
                        <div className="pt-2 border-t border-emerald-200 text-emerald-700 font-medium">
                          {aiScore.competitorAnalysis.performance}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">AI Suggestions</Label>
                    {aiScore.suggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-50"
                      >
                        <Wand2 className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-600">{suggestion}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Regenerate with AI
                  </Button>
                </> :

            <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-violet-600 animate-spin" />
                </div>
            }
            </CardContent>
          </Card>
        </div>
      }

      {/* Media Library Modal */}
      <MediaLibraryPicker
        open={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleSelectFromLibrary}
        allowMultiple={true}
      />
    </div>
  );
}