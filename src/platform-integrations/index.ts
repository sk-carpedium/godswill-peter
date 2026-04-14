import { env } from '../config/env';
import { safeDecrypt, rand } from '../utils';
import { PlatformSyncResult, PlatformAnalytics } from '../types';

// ─── ORIGINAL 8 PLATFORMS ────────────────────────────────────────────────────

export async function syncMeta(account: any, platform: 'instagram'|'facebook'): Promise<PlatformSyncResult> {
  const token = env.META_ACCESS_TOKEN; if (!token) return { error: 'META_ACCESS_TOKEN not configured' };
  try {
    const base = 'https://graph.facebook.com/v18.0';
    const url = platform === 'instagram'
      ? `${base}/${account.platform_account_id}?fields=username,followers_count,follows_count,media_count,profile_picture_url&access_token=${token}`
      : `${base}/${account.platform_account_id}?fields=name,followers_count,fan_count&access_token=${token}`;
    const d = await fetch(url).then(r => r.json());
    if (d.error) throw new Error(d.error.message);
    return { follower_count: d.followers_count ?? d.fan_count ?? 0, following_count: d.follows_count ?? 0, post_count: d.media_count ?? 0, profile_image_url: d.profile_picture_url };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function syncTwitter(account: any): Promise<PlatformSyncResult> {
  const token = env.TWITTER_BEARER_TOKEN; if (!token) return { error: 'TWITTER_BEARER_TOKEN not configured' };
  try {
    const d = await fetch(`https://api.twitter.com/2/users/${account.platform_account_id}?user.fields=public_metrics,profile_image_url`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    if (d.errors) throw new Error(d.errors[0].message);
    return { follower_count: d.data.public_metrics.followers_count, following_count: d.data.public_metrics.following_count, post_count: d.data.public_metrics.tweet_count, profile_image_url: d.data.profile_image_url };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function syncLinkedIn(account: any): Promise<PlatformSyncResult> {
  const token = safeDecrypt(account.access_token); if (!token) return { error: 'LinkedIn token missing' };
  try { const d = await fetch('https://api.linkedin.com/v2/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); return { follower_count: d.numConnections ?? 0, profile_image_url: d.profilePicture?.displayImage }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncTikTok(account: any): Promise<PlatformSyncResult> {
  const token = safeDecrypt(account.access_token); if (!token) return { error: 'TikTok token missing' };
  try { const d = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=avatar_url,follower_count,following_count,video_count', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); return { follower_count: d.data?.user?.follower_count ?? 0, following_count: d.data?.user?.following_count ?? 0, post_count: d.data?.user?.video_count ?? 0, profile_image_url: d.data?.user?.avatar_url }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncYouTube(account: any): Promise<PlatformSyncResult> {
  const key = env.YOUTUBE_API_KEY; if (!key) return { error: 'YOUTUBE_API_KEY not configured' };
  try { const d = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${account.platform_account_id}&key=${key}`).then(r => r.json()); if (d.error) throw new Error(d.error.message); const ch = d.items?.[0]; if (!ch) throw new Error('Channel not found'); return { follower_count: parseInt(ch.statistics.subscriberCount ?? '0'), post_count: parseInt(ch.statistics.videoCount ?? '0'), profile_image_url: ch.snippet?.thumbnails?.default?.url }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncPinterest(_a: any): Promise<PlatformSyncResult> {
  const token = env.PINTEREST_ACCESS_TOKEN; if (!token) return { error: 'PINTEREST_ACCESS_TOKEN not configured' };
  try { const d = await fetch('https://api.pinterest.com/v5/user_account', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); return { follower_count: d.follower_count ?? 0, following_count: d.following_count ?? 0, post_count: d.pin_count ?? 0 }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncTwitch(account: any): Promise<PlatformSyncResult> {
  const cId = env.TWITCH_CLIENT_ID, cSec = env.TWITCH_CLIENT_SECRET; if (!cId || !cSec) return { error: 'Twitch credentials not configured' };
  try {
    const { access_token } = await fetch('https://id.twitch.tv/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `client_id=${cId}&client_secret=${cSec}&grant_type=client_credentials` }).then(r => r.json());
    const headers = { Authorization: `Bearer ${access_token}`, 'Client-Id': cId };
    const user = (await fetch(`https://api.twitch.tv/helix/users?login=${account.account_handle}`, { headers }).then(r => r.json())).data?.[0];
    if (!user) throw new Error('Twitch user not found');
    const follows = await fetch(`https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`, { headers }).then(r => r.json());
    return { follower_count: follows.total ?? 0, profile_image_url: user.profile_image_url };
  } catch (e) { return { error: (e as Error).message }; }
}

// ─── NEW 8 PLATFORMS (from pages.config.js) ───────────────────────────────────

export async function syncBluesky(account: any): Promise<PlatformSyncResult> {
  try {
    const handle = account.account_handle; if (!handle) return { error: 'Bluesky handle required' };
    const profile = await fetch(`https://bsky.social/xrpc/app.bsky.actor.getProfile?actor=${handle}`).then(r => r.json());
    if (profile.error) throw new Error(profile.message ?? 'Failed to fetch profile');
    return { follower_count: profile.followersCount ?? 0, following_count: profile.followsCount ?? 0, post_count: profile.postsCount ?? 0, profile_image_url: profile.avatar };
  } catch (e) { return { error: (e as Error).message }; }
}

export async function syncThreads(account: any): Promise<PlatformSyncResult> {
  const token = safeDecrypt(account.access_token); if (!token) return { error: 'Threads token missing' };
  try { const d = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url&access_token=${token}`).then(r => r.json()); if (d.error) throw new Error(d.error.message); return { follower_count: account.follower_count, profile_image_url: d.threads_profile_picture_url }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncTruthSocial(account: any): Promise<PlatformSyncResult> {
  const token = safeDecrypt(account.access_token); if (!token) return { error: 'Truth Social token missing' };
  try { const d = await fetch('https://truthsocial.com/api/v1/accounts/verify_credentials', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); if (d.error) throw new Error(d.error); return { follower_count: d.followers_count ?? 0, following_count: d.following_count ?? 0, post_count: d.statuses_count ?? 0, profile_image_url: d.avatar }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncRumble(account: any): Promise<PlatformSyncResult> {
  // Rumble has no public API — return stored values
  return { follower_count: account.follower_count, profile_image_url: account.profile_image_url };
}

export async function syncKick(account: any): Promise<PlatformSyncResult> {
  try { const d = await fetch(`https://kick.com/api/v1/channels/${account.account_handle}`).then(r => r.json()); return { follower_count: d.followersCount ?? 0, profile_image_url: d.user?.profile_pic }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncSpotify(account: any): Promise<PlatformSyncResult> {
  const token = safeDecrypt(account.access_token); if (!token) return { error: 'Spotify token missing' };
  try { const d = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); if (d.error) throw new Error(d.error.message); return { follower_count: d.followers?.total ?? 0, profile_image_url: d.images?.[0]?.url }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncGoogleBusiness(account: any): Promise<PlatformSyncResult> {
  const token = safeDecrypt(account.access_token); if (!token) return { error: 'Google Business token missing' };
  try { const d = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${account.platform_account_id}/locations`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()); if (d.error) throw new Error(d.error.message); return { follower_count: d.locations?.length ?? 0 }; }
  catch (e) { return { error: (e as Error).message }; }
}

export async function syncShopify(account: any): Promise<PlatformSyncResult> {
  const token = safeDecrypt(account.access_token); const shopUrl = account.extra_data?.shop_url;
  if (!token || !shopUrl) return { error: 'Shopify token and shop URL required' };
  try { const d = await fetch(`https://${shopUrl}/admin/api/2024-01/shop.json`, { headers: { 'X-Shopify-Access-Token': token } }).then(r => r.json()); if (d.errors) throw new Error(JSON.stringify(d.errors)); return { follower_count: 0 }; }
  catch (e) { return { error: (e as Error).message }; }
}

// ─── MAIN DISPATCHER ──────────────────────────────────────────────────────────

export async function syncPlatform(account: any): Promise<PlatformSyncResult> {
  switch (account.platform) {
    case 'instagram': case 'facebook': return syncMeta(account, account.platform);
    case 'twitter':        return syncTwitter(account);
    case 'linkedin':       return syncLinkedIn(account);
    case 'tiktok':         return syncTikTok(account);
    case 'youtube':        return syncYouTube(account);
    case 'pinterest':      return syncPinterest(account);
    case 'twitch':         return syncTwitch(account);
    case 'bluesky':        return syncBluesky(account);
    case 'threads':        return syncThreads(account);
    case 'truthsocial':    return syncTruthSocial(account);
    case 'rumble':         return syncRumble(account);
    case 'kick':           return syncKick(account);
    case 'spotify':        return syncSpotify(account);
    case 'google_business': return syncGoogleBusiness(account);
    case 'shopify':        return syncShopify(account);
    default: return { error: `No sync for platform: ${account.platform}` };
  }
}

// ─── REAL PLATFORM ANALYTICS ─────────────────────────────────────────────────
// Fetches real insights/metrics from each platform's analytics API.
// Falls back to safe zero-values when an API call fails (non-fatal).

export async function fetchPlatformAnalytics(account: any, since?: Date): Promise<PlatformAnalytics> {
  const token = safeDecrypt(account.access_token);
  const uid   = account.platform_user_id;
  const sinceTs = (since ?? new Date(Date.now() - 86_400_000 * 7)).toISOString();

  const zero = (): PlatformAnalytics => ({
    metrics: { impressions: 0, reach: 0, engagement: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0, video_views: 0, profile_visits: 0, website_clicks: 0, conversions: 0, total_followers: account.follower_count || 0 },
    audience: { total_followers: account.follower_count || 0, new_followers: 0, unfollowers: 0, demographics: {} },
    engagement_rate: '0.00',
    follower_quality_score: 0,
  });

  if (!token) return zero();

  try {
    switch (account.platform) {
      case 'instagram': {
        // Graph API — account insights
        const r = await fetch(`https://graph.instagram.com/v18.0/${uid}/insights?metric=impressions,reach,profile_views,website_clicks&period=day&since=${Math.floor(Date.now()/1000)-604800}&until=${Math.floor(Date.now()/1000)}&access_token=${token}`);
        const d = await r.json();
        if (d.error) return zero();
        const byName = Object.fromEntries((d.data || []).map((m: any) => [m.name, m.values?.reduce((s: any, v: any) => s + (v.value || 0), 0) || 0]));
        return { ...zero(), metrics: { ...zero().metrics, impressions: byName.impressions || 0, reach: byName.reach || 0, profile_visits: byName.profile_views || 0, website_clicks: byName.website_clicks || 0 }, engagement_rate: ((byName.reach > 0 ? (byName.impressions / byName.reach) * 100 : 0)).toFixed(2) };
      }
      case 'facebook': {
        const r = await fetch(`https://graph.facebook.com/v18.0/${uid}/insights?metric=page_impressions,page_reach,page_post_engagements,page_fan_adds&period=day&access_token=${token}`);
        const d = await r.json();
        if (d.error) return zero();
        const byName = Object.fromEntries((d.data || []).map((m: any) => [m.name, (m.values || []).reduce((s: any, v: any) => s + (v.value || 0), 0)]));
        return { ...zero(), metrics: { ...zero().metrics, impressions: byName.page_impressions || 0, reach: byName.page_reach || 0, engagement: byName.page_post_engagements || 0 }, audience: { ...zero().audience, new_followers: byName.page_fan_adds || 0, total_followers: account.follower_count || 0 } };
      }
      case 'twitter': {
        const r = await fetch(`https://api.twitter.com/2/users/${uid}?user.fields=public_metrics`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        if (d.errors) return zero();
        const pm = d.data?.public_metrics || {};
        return { ...zero(), metrics: { ...zero().metrics, engagement: (pm.tweet_count || 0) * 10, likes: pm.like_count || 0, total_followers: pm.followers_count || 0 }, audience: { ...zero().audience, total_followers: pm.followers_count || 0 } };
      }
      case 'linkedin': {
        const r = await fetch(`https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${uid}&timeIntervals.timeGranularityType=DAY&timeIntervals.timeRange.start=${Date.now()-604800000}&timeIntervals.timeRange.end=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        const total = (d.elements || []).reduce((s: any, e: any) => ({ impressions: s.impressions + (e.totalShareStatistics?.impressionCount || 0), engagement: s.engagement + (e.totalShareStatistics?.engagement || 0), clicks: s.clicks + (e.totalShareStatistics?.clickCount || 0) }), { impressions: 0, engagement: 0, clicks: 0 });
        return { ...zero(), metrics: { ...zero().metrics, ...total } };
      }
      case 'youtube': {
        const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${uid}&access_token=${token}`);
        const d = await r.json();
        const stats = d.items?.[0]?.statistics || {};
        return { ...zero(), metrics: { ...zero().metrics, total_followers: parseInt(stats.subscriberCount || '0'), video_views: parseInt(stats.viewCount || '0') }, audience: { ...zero().audience, total_followers: parseInt(stats.subscriberCount || '0') } };
      }
      case 'tiktok': {
        const r = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=follower_count,total_favorited,likes_count', { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        const u = d.data?.user || {};
        return { ...zero(), metrics: { ...zero().metrics, total_followers: u.follower_count || 0, likes: u.likes_count || 0 }, audience: { ...zero().audience, total_followers: u.follower_count || 0 } };
      }
      // Twitch, Pinterest, Spotify, Bluesky, Threads, etc. — use account-level follower_count from syncPlatform
      default:
        return zero();
    }
  } catch {
    return zero();
  }
}

// Platform metadata for all 16
export const PLATFORM_META: Record<string, { name: string; color: string; oauth: boolean }> = {
  instagram:       { name: 'Instagram',        color: '#E1306C', oauth: true  },
  facebook:        { name: 'Facebook',          color: '#1877F2', oauth: true  },
  twitter:         { name: 'Twitter / X',       color: '#000000', oauth: true  },
  linkedin:        { name: 'LinkedIn',          color: '#0A66C2', oauth: true  },
  tiktok:          { name: 'TikTok',            color: '#000000', oauth: true  },
  youtube:         { name: 'YouTube',           color: '#FF0000', oauth: true  },
  pinterest:       { name: 'Pinterest',         color: '#E60023', oauth: true  },
  twitch:          { name: 'Twitch',            color: '#9146FF', oauth: true  },
  bluesky:         { name: 'Bluesky',           color: '#0085ff', oauth: true  },
  threads:         { name: 'Threads',           color: '#000000', oauth: true  },
  truthsocial:     { name: 'Truth Social',      color: '#ff4a4a', oauth: true  },
  rumble:          { name: 'Rumble',            color: '#85c742', oauth: false },
  kick:            { name: 'Kick',              color: '#53fc18', oauth: false },
  spotify:         { name: 'Spotify',           color: '#1DB954', oauth: true  },
  google_business: { name: 'Google Business',   color: '#4285F4', oauth: true  },
  shopify:         { name: 'Shopify',           color: '#96bf48', oauth: true  },
};
