/**
 * usePosts.js — Posts data hooks
 * Replaces: samplePosts arrays in RecentPosts, UpcomingPosts, TopPosts
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export function usePosts(filters = {}) {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['posts', workspaceId, filters],
    queryFn:  () => base44.entities.Post.filter({ workspace_id: workspaceId, ...filters }),
    enabled: !!workspaceId,
    staleTime: 30 * 1000,
  });
}

/** RecentPosts.jsx — latest published posts */
export function useRecentPosts(limit = 5) {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['recent-posts', workspaceId, limit],
    queryFn:  () => base44.entities.Post.filter({
      workspace_id: workspaceId, status: 'published', sort: '-created_at', limit,
    }),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  });
}

/** UpcomingPosts.jsx — scheduled posts sorted by schedule time */
export function useUpcomingPosts(limit = 10) {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['upcoming-posts', workspaceId, limit],
    queryFn:  () => base44.entities.Post.filter({
      workspace_id: workspaceId, status: 'scheduled', sort: 'scheduled_at', limit,
    }),
    enabled: !!workspaceId,
    staleTime: 30 * 1000,
  });
}

/** TopPosts.jsx — top-performing posts by engagement */
export function useTopPosts(limit = 5) {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['top-posts', workspaceId, limit],
    queryFn: async () => {
      const posts = await base44.entities.Post.filter({
        workspace_id: workspaceId, status: 'published', sort: '-created_at', limit: 50,
      });
      // Sort by engagement_rate descending
      return posts
        .filter(p => p.engagement_rate || p.ai_analysis?.engagement_prediction)
        .sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0))
        .slice(0, limit);
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

/** Bulk actions mutation */
export function usePostMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['posts'] });

  const update = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message),
  });

  const create = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => { toast.success('Post created!'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return { update, remove, create };
}
