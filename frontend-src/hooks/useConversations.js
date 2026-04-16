/**
 * useConversations.js — Inbox / conversations data hooks
 * Replaces: sampleConversations in ConversationList, PriorityInbox, IntelligentInbox
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from './useWorkspace';
import { toast } from 'sonner';

export function useConversations(filters = {}) {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['conversations', workspaceId, filters],
    queryFn: () => api.entities.Conversation.filter({
      workspace_id: workspaceId, ...filters,
    }),
    enabled: !!workspaceId,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000, // live inbox — poll every 30s
  });
}

/** PriorityInbox — urgent + VIP + SLA conversations */
export function usePriorityConversations() {
  const { workspaceId } = useWorkspace();
  return useQuery({
    queryKey: ['priority-conversations', workspaceId],
    queryFn: async () => {
      const all = await api.entities.Conversation.filter({
        workspace_id: workspaceId, status: 'open',
      });
      return {
        all,
        vip:     all.filter(c => c.is_vip),
        urgent:  all.filter(c => c.priority === 'urgent' || c.priority === 'high'),
        sla:     all.filter(c => c.sla?.breached),
        unread:  all.filter(c => c.status === 'new' || c.unread_count > 0),
      };
    },
    enabled: !!workspaceId,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useConversationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['conversations'] });

  const update = useMutation({
    mutationFn: ({ id, data }) => api.entities.Conversation.update(id, data),
    onSuccess: invalidate,
  });

  const reply = useMutation({
    mutationFn: ({ id, message }) => api.entities.Conversation.reply(id, message),
    onSuccess: () => { toast.success('Reply sent'); invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  return { update, reply };
}
