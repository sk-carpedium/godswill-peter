// ─── types/index.ts ───────────────────────────────────────────────────────────
import { Request } from 'express';

export interface JwtPayload { userId: string; email: string; role: string; workspaceId?: string; }
export interface AuthRequest extends Request { user?: JwtPayload; }

export interface ApiResponse<T = unknown> {
  success: boolean; data?: T; message?: string; error?: string;
  meta?: { total: number; page: number; limit: number; totalPages: number; };
}

export interface PlatformSyncResult {
  follower_count?: number; following_count?: number; post_count?: number;
  profile_image_url?: string; error?: string;
}

export interface PlatformAnalytics {
  metrics: {
    impressions: number; reach: number; engagement: number; likes: number;
    comments: number; shares: number; saves?: number; clicks?: number;
    video_views?: number; profile_visits?: number; website_clicks?: number;
    conversions?: number; total_followers?: number;
  };
  audience: { total_followers: number; new_followers: number; unfollowers: number; demographics?: any; };
  engagement_rate: string;
  follower_quality_score: number;
}

export interface PublishResult {
  total: number; published: number; failed: number;
  errors: { post_id: string; error: string }[];
}
