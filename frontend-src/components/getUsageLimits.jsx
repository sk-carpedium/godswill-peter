// Centralized usage limits configuration for all plans

export const getUsageLimits = (planId) => {
  const limits = {
    free: { 
      social_accounts: 2, 
      posts_per_month: 10, 
      team_members: 1, 
      ai_requests_per_month: 50, 
      storage_gb: 1 
    },
    starter: { 
      social_accounts: 5, 
      posts_per_month: 100, 
      team_members: 3, 
      ai_requests_per_month: 500, 
      storage_gb: 5 
    },
    growth: { 
      social_accounts: 15, 
      posts_per_month: 500, 
      team_members: 10, 
      ai_requests_per_month: 2000, 
      storage_gb: 20 
    },
    professional: { 
      social_accounts: 25, 
      posts_per_month: 2000, 
      team_members: 20, 
      ai_requests_per_month: 5000, 
      storage_gb: 50 
    },
    agency: { 
      social_accounts: 50, 
      posts_per_month: 10000, 
      team_members: 50, 
      ai_requests_per_month: 20000, 
      storage_gb: 200 
    }
  };
  return limits[planId] || limits.free;
};

export const checkFeatureAccess = (planId, feature) => {
  const access = {
    // Free plan
    free: [
      'basic_posting',
      'ai_caption_generation',
      'ai_hashtags',
      'basic_dashboard',
      'best_time_global'
    ],
    
    // Starter plan
    starter: [
      'basic_posting',
      'ai_caption_generation',
      'ai_hashtags',
      'basic_dashboard',
      'best_time_global',
      'unlimited_scheduling',
      'basic_calendar',
      'full_ai_chat',
      'limited_proactive_insights',
      'basic_trend_responder',
      'ai_reply_suggestions_limited',
      'ai_daily_summary',
      'detailed_analytics',
      'basic_historical_reports',
      'limited_keyword_tracking'
    ],
    
    // Growth plan
    growth: [
      'basic_posting',
      'ai_caption_generation',
      'ai_hashtags',
      'basic_dashboard',
      'best_time_global',
      'unlimited_scheduling',
      'basic_calendar',
      'full_ai_chat',
      'limited_proactive_insights',
      'basic_trend_responder',
      'ai_reply_suggestions_limited',
      'ai_daily_summary',
      'detailed_analytics',
      'basic_historical_reports',
      'limited_keyword_tracking',
      // Growth-specific features
      'advanced_content_calendar',
      'brand_management',
      'revenue_optimizer',
      'full_proactive_insights',
      'full_trend_responder',
      'ai_workload_balancer',
      'unlimited_ai_replies',
      'brand_voice_presets',
      'platform_specific_timing',
      'predictive_scoring',
      'ab_testing',
      'advanced_analytics',
      'benchmarking',
      'full_historical_reports',
      'team_tasks',
      'team_discussions',
      'unlimited_keyword_tracking',
      'crisis_detection',
      'basic_revenue_tracking',
      'brand_deal_management',
      'full_media_library'
    ],
    
    // Professional and Agency have all features
    professional: ['all'],
    agency: ['all']
  };
  
  const planFeatures = access[planId] || access.free;
  
  if (planFeatures.includes('all')) return true;
  return planFeatures.includes(feature);
};