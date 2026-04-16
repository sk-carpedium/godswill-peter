import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export function useUsageLimits() {
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
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

  const canAddSocialAccount = (currentCount) => {
    if (!subscription) return true; // Allow if no subscription found
    return currentCount < (subscription.usage_limits?.social_accounts || 2);
  };

  const canCreatePost = (currentMonthCount) => {
    if (!subscription) return true;
    return currentMonthCount < (subscription.usage_limits?.posts_per_month || 10);
  };

  const canUseAI = (currentMonthCount) => {
    if (!subscription) return true;
    return currentMonthCount < (subscription.usage_limits?.ai_requests_per_month || 50);
  };

  const canAddTeamMember = (currentCount) => {
    if (!subscription) return true;
    return currentCount < (subscription.usage_limits?.team_members || 1);
  };

  return {
    subscription,
    limits: subscription?.usage_limits,
    usage: subscription?.current_usage,
    canAddSocialAccount,
    canCreatePost,
    canUseAI,
    canAddTeamMember,
    planId: subscription?.plan_id || 'free'
  };
}