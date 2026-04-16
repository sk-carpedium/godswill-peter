/**
 * useSocialListening.js — Mentions, keywords, competitors, trends hooks
 * Replaces: sampleMentions in MentionsFeed, hardcoded keywords/competitors/trends
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

/** MentionsFeed.jsx — paginated mentions with filters */
export function useMentions(filters = {}) {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['mentions', workspaceId, filters],
    queryFn: () => api.entities.Mention.filter({
      workspace_id: workspaceId, ...filters,
    }),
    enabled: !!workspaceId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

/** SentimentChart.jsx — mentions with sentiment for last 7 days */
export function useSentimentData() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['sentiment-mentions', workspaceId],
    queryFn: () => api.entities.Mention.filter({
      workspace_id: workspaceId, period: '7d', sort: 'mentioned_at',
    }),
    enabled: !!workspaceId,
    staleTime: 2 * 60 * 1000,
  });
}

/** KeywordTracker.jsx — tracked keywords */
export function useKeywords() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['keywords', workspaceId],
    queryFn: () => api.entities.KeywordTrack.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  });
}

/** CompetitorMonitor.jsx — tracked competitors */
export function useCompetitors() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['competitors', workspaceId],
    queryFn: () => api.entities.CompetitorTrack.filter({ workspace_id: workspaceId }),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

/** TrendingTopics.jsx — live trending topics via AI */
export function useTrendingTopics() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['trending-topics', workspaceId],
    queryFn: () => api.functions.invoke('aiSocialListening', {
      action: 'detect_crisis',
      workspace_id: workspaceId,
    }).catch(() => ({ trends: [] })),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });
}

/** AlertsPanel.jsx — real-time alerts */
export function useAlerts() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['alerts', workspaceId],
    queryFn: () => api.functions.invoke('socialListening', {
      action: 'check_alerts',
      workspace_id: workspaceId,
    }),
    enabled: !!workspaceId,
    staleTime: 0,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useMentionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['mentions'] });

  return {
    update: useMutation({
      mutationFn: ({ id, data }) => api.entities.Mention.update(id, data),
      onSuccess: invalidate,
    }),
    dismiss: useMutation({
      mutationFn: (id) => api.entities.Mention.update(id, { status: 'dismissed' }),
      onSuccess: () => { toast.success('Dismissed'); invalidate(); },
    }),
  };
}
