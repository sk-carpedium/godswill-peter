import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Calendar,
  List,
  Search,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitPullRequestArrow,
  LayoutGrid,
  ChevronRight,
  Zap
} from 'lucide-react';
import ContentCalendar from '@/components/ContentCalendar';
import PostComposer from '@/components/PostComposer';
import ContentGenerator from '@/components/ContentGenerator';
import ApprovalFlow from '@/components/ApprovalFlow';
import BulkActions from '@/components/BulkActions';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  all:       { label: 'All',       icon: LayoutGrid,    color: 'text-slate-400' },
  draft:     { label: 'Drafts',    icon: FileText,      color: 'text-slate-400' },
  scheduled: { label: 'Scheduled', icon: Clock,         color: 'text-blue-400' },
  published: { label: 'Published', icon: CheckCircle2,  color: 'text-emerald-400' },
  failed:    { label: 'Failed',    icon: AlertCircle,   color: 'text-red-400' },
};

const PLATFORM_COLORS = {
  instagram: '#E1306C',
  facebook:  '#1877F2',
  twitter:   '#000000',
  linkedin:  '#0A66C2',
  tiktok:    '#010101',
  youtube:   '#FF0000',
};

export default function Content() {
  const [view, setView] = useState('calendar');
  const [showComposer, setShowComposer] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showApprovalFlow, setShowApprovalFlow] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    api.entities.Workspace.filter({ status: 'active' }).then((ws) => {
      if (ws.length > 0) setCurrentWorkspace(ws[0]);
    });
  }, []);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', statusFilter, currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const filter = { workspace_id: currentWorkspace.id };
      if (statusFilter !== 'all') filter.status = statusFilter;
      return api.entities.Post.filter(filter, '-created_date', 100);
    },
    enabled: !!currentWorkspace,
  });

  const createPostMutation = useMutation({
    mutationFn: async (postData) => {
      const user = await api.auth.me();
      const subscriptions = await api.entities.Subscription.filter({
        user_email: user.email,
        workspace_id: currentWorkspace?.id,
      });
      const subscription = subscriptions[0];
      const monthlyLimit = subscription?.usage_limits?.posts_per_month || 10;
      const currentUsage = subscription?.current_usage?.posts_this_month || 0;
      if (currentUsage >= monthlyLimit) {
        throw new Error(`Monthly post limit reached (${monthlyLimit}). Upgrade your plan for more posts.`);
      }
      const post = await api.entities.Post.create({ ...postData, workspace_id: currentWorkspace?.id });
      if (subscription) {
        await api.entities.Subscription.update(subscription.id, {
          current_usage: { ...subscription.current_usage, posts_this_month: currentUsage + 1 },
        });
      }
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setShowComposer(false);
      setSelectedPost(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCreatePost = () => { setSelectedPost(null); setShowComposer(true); };
  const handlePostClick = (post) => { setSelectedPost(post); setShowComposer(true); };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    return post.content?.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getCount = (status) => status === 'all' ? posts.length : posts.filter((p) => p.status === status).length;

  // ── Overlay panels ──────────────────────────────────────────────────────────
  if (showAIGenerator) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAIGenerator(false)} className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-600">AI Content Generator</span>
        </div>
        <ContentGenerator onUseContent={(content) => {
          setSelectedPost({ content: { text: content } });
          setShowAIGenerator(false);
          setShowComposer(true);
        }} />
      </div>
    );
  }

  if (showApprovalFlow) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowApprovalFlow(false)} className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-600">Approval Queue</span>
        </div>
        <ApprovalFlow />
      </div>
    );
  }

  if (showComposer) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowComposer(false); setSelectedPost(null); }} className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-600">{selectedPost?.id ? 'Edit Post' : 'New Post'}</span>
        </div>
        <PostComposer
          post={selectedPost}
          onClose={() => { setShowComposer(false); setSelectedPost(null); }}
          onSave={(postData) => createPostMutation.mutate(postData)}
          isLoading={createPostMutation.isPending}
        />
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content</h1>
          <p className="text-sm text-slate-400 mt-0.5">Plan, create and schedule across all platforms</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedPosts.length > 0 && (
            <BulkActions
              selectedPosts={selectedPosts}
              onComplete={() => { setSelectedPosts([]); queryClient.invalidateQueries(['posts']); }}
            />
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAIGenerator(true)}
            className="h-9 gap-2 border-slate-200 text-slate-600 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Generate
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowApprovalFlow(true)}
            className="h-9 gap-2 border-slate-200 text-slate-600 hover:border-slate-400 transition-colors"
          >
            <GitPullRequestArrow className="w-3.5 h-3.5" />
            Approvals
          </Button>
          <Button
            size="sm"
            onClick={handleCreatePost}
            className="h-9 gap-2 bg-[#d4af37] hover:bg-[#c49f2f] text-slate-950 font-semibold shadow-lg shadow-[#d4af37]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Post
          </Button>
        </div>
      </div>

      {/* ── Selection bar ── */}
      {selectedPosts.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#d4af37]/8 border border-[#d4af37]/30">
          <span className="text-sm font-medium text-slate-700">
            {selectedPosts.length} post{selectedPosts.length > 1 ? 's' : ''} selected
          </span>
          <button onClick={() => setSelectedPosts([])} className="text-xs text-slate-500 hover:text-slate-700 underline underline-offset-2">
            Clear
          </button>
        </div>
      )}

      {/* ── Controls row ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">

        {/* Status chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([id, cfg]) => {
            const active = statusFilter === id;
            const Icon = cfg.icon;
            const count = getCount(id);
            return (
              <button
                key={id}
                onClick={() => setStatusFilter(id)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  active
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
                )}
              >
                <Icon className={cn("w-3 h-3", active ? "text-white" : cfg.color)} />
                {cfg.label}
                <span className={cn(
                  "ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold",
                  active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            placeholder="Search posts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm border-slate-200 bg-white rounded-lg"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
          {[
            { id: 'calendar', Icon: Calendar },
            { id: 'list', Icon: List },
          ].map(({ id, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                view === id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline capitalize">{id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content area ── */}
      {view === 'calendar' ? (
        <ContentCalendar
          posts={filteredPosts}
          workspaceId={currentWorkspace?.id}
          onPostClick={handlePostClick}
          onCreatePost={handleCreatePost}
        />
      ) : (
        <div className="space-y-2">
          {filteredPosts.map((post) => {
            const isSelected = selectedPosts.some((p) => p.id === post.id);
            const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={post.id}
                className={cn(
                  "group flex items-start gap-3 p-4 rounded-xl border bg-white transition-all hover:shadow-sm cursor-pointer",
                  isSelected ? "border-[#d4af37]/50 bg-[#d4af37]/4" : "border-slate-100 hover:border-slate-200"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    setSelectedPosts(checked
                      ? [...selectedPosts, post]
                      : selectedPosts.filter((p) => p.id !== post.id))
                  }
                  onClick={(e) => e.stopPropagation()}
                  className="mt-0.5 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
                />
                <div className="flex-1 min-w-0" onClick={() => handlePostClick(post)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("flex items-center gap-1 text-xs font-medium", statusCfg.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                    {post.schedule?.scheduled_at && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(post.schedule.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                    <div className="flex gap-1 ml-auto">
                      {post.platforms?.slice(0, 4).map((p, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                          style={{ backgroundColor: PLATFORM_COLORS[p.platform] || '#94a3b8' }}
                        >
                          {p.platform?.[0]?.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                    {post.content?.text || <span className="text-slate-400 italic">No content</span>}
                  </p>
                </div>
                {post.media?.[0]?.url && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            );
          })}

          {filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">
                {searchQuery ? 'No posts match your search' : 'No posts yet'}
              </h3>
              <p className="text-sm text-slate-400 mb-6 max-w-xs">
                {searchQuery ? 'Try a different keyword' : 'Create your first post or let AI generate content for you'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowAIGenerator(true)} className="gap-2 h-9">
                  <Sparkles className="w-3.5 h-3.5" /> AI Generate
                </Button>
                <Button size="sm" onClick={handleCreatePost} className="gap-2 h-9 bg-[#d4af37] text-slate-950 hover:bg-[#c49f2f]">
                  <Plus className="w-3.5 h-3.5" /> Create Post
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}