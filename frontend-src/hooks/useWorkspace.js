/**
 * useWorkspace.js — Active workspace + user context hook
 * Used by: Layout, Dashboard, Settings, Campaigns, Team, and most page components
 *
 * Returns: { workspace, workspaces, user, workspaceId, isLoading, switchWorkspace }
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn:  () => base44.auth.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn:  () => base44.entities.Workspace.filter({ status: 'active' }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useWorkspace() {
  const { data: workspaces = [], isLoading: loadingWS } = useWorkspaces();
  const { data: user,           isLoading: loadingUser } = useUser();

  // Active workspace: stored in localStorage or first available
  const storedId = typeof localStorage !== 'undefined'
    ? localStorage.getItem('workspace_id') : null;

  const workspace = workspaces.find(w => w.id === storedId) || workspaces[0] || null;
  const workspaceId = workspace?.id || null;

  const switchWorkspace = (id) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('workspace_id', id);
      window.location.reload(); // simple reload keeps all queries fresh
    }
  };

  return {
    workspace,
    workspaces,
    workspaceId,
    user,
    isLoading: loadingWS || loadingUser,
    switchWorkspace,
  };
}
