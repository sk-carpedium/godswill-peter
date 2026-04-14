import { Router, Request, Response } from 'express';
import db from '../../config/database';
import { env } from '../../config/env';
import { ok, fail } from '../../utils';
import { authenticate } from '../../middleware/auth';
import { encrypt } from '../../utils';
import { logger } from '../../config/logger';

/**
 * OAuth Callback Module
 * Handles OAuth 2.0 callback flows for all 16 supported platforms.
 *
 * SUPPORTED PLATFORMS (with their OAuth grant types):
 *   instagram      → OAuth 2.0 (Graph API)
 *   facebook       → OAuth 2.0
 *   twitter        → OAuth 2.0 (v2) + OAuth 1.0a (legacy)
 *   linkedin       → OAuth 2.0
 *   tiktok         → OAuth 2.0
 *   youtube        → OAuth 2.0 (Google)
 *   pinterest      → OAuth 2.0
 *   threads        → OAuth 2.0 (Meta / Instagram)
 *   bluesky        → AT Protocol (username + app password, not OAuth)
 *   google_business → OAuth 2.0 (Google)
 *   twitch         → OAuth 2.0
 *   kick           → OAuth 2.0 (unofficial/custom)
 *   rumble         → API key (no OAuth)
 *   truth_social   → Mastodon OAuth 2.0
 *   shopify        → OAuth 2.0
 *   spotify        → OAuth 2.0
 *
 * FLOW:
 *   1. Frontend calls GET /auth/connect/:platform?workspace_id=X&brand_id=Y
 *   2. Backend redirects to platform authorization URL
 *   3. Platform redirects to GET /auth/callback/:platform?code=X&state=Y
 *   4. Backend exchanges code for tokens, saves SocialAccount record
 *   5. Backend redirects to frontend success page
 */

const router = Router();

// ─── AUTHORIZATION URL BUILDERS ──────────────────────────────────────────────

function buildAuthUrl(platform: string, state: string): string {
  const redirect = `${env.APP_URL}/v1/oauth/callback/${platform}`;

  const urls: Record<string, string> = {
    instagram: `https://api.instagram.com/oauth/authorize?client_id=${env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=user_profile,user_media&response_type=code&state=${state}`,

    facebook: `https://www.facebook.com/v18.0/dialog/oauth?client_id=${env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,read_insights&state=${state}`,

    twitter: `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${env.TWITTER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=tweet.read+tweet.write+users.read+offline.access&state=${state}&code_challenge=challenge&code_challenge_method=plain`,

    linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=r_liteprofile+r_emailaddress+w_member_social+rw_organization_admin&state=${state}`,

    tiktok: `https://www.tiktok.com/v2/auth/authorize?client_key=${env.TIKTOK_CLIENT_KEY}&redirect_uri=${encodeURIComponent(redirect)}&scope=user.info.basic,video.list,video.publish&response_type=code&state=${state}`,

    youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=https://www.googleapis.com/auth/youtube+https://www.googleapis.com/auth/youtube.upload+https://www.googleapis.com/auth/yt-analytics.readonly&response_type=code&access_type=offline&state=${state}`,

    pinterest: `https://www.pinterest.com/oauth/?client_id=${env.PINTEREST_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=boards:read,boards:write,pins:read,pins:write,user_accounts:read,ads:read&state=${state}`,

    threads: `https://api.instagram.com/oauth/authorize?client_id=${env.THREADS_CLIENT_ID || env.INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=threads_basic,threads_content_publish,threads_manage_insights&response_type=code&state=${state}`,

    google_business: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&scope=https://www.googleapis.com/auth/business.manage&response_type=code&access_type=offline&state=${state}`,

    twitch: `https://id.twitch.tv/oauth2/authorize?client_id=${env.TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=channel:manage:broadcast+channel:read:stream_key+user:read:email&state=${state}`,

    spotify: `https://accounts.spotify.com/authorize?client_id=${env.SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=user-read-private+user-read-email+playlist-modify-public+user-top-read&state=${state}`,

    shopify: `https://${state.split('|')[2] || 'store'}.myshopify.com/admin/oauth/authorize?client_id=${env.SHOPIFY_CLIENT_ID}&scope=read_products,write_products,read_orders,read_analytics&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`,

    truth_social: `https://truthsocial.com/oauth/authorize?client_id=${env.TRUTH_SOCIAL_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=read+write&state=${state}`,

    // Kick and Rumble use API keys, not OAuth — handled separately
    kick:   '',
    rumble: '',
    bluesky: '',
  };

  return urls[platform] || '';
}

// ─── TOKEN EXCHANGE ───────────────────────────────────────────────────────────

async function exchangeCodeForTokens(platform: string, code: string, redirectUri: string): Promise<{
  access_token: string; refresh_token?: string; expires_in?: number; scope?: string; raw?: object;
}> {
  const exchanges: Record<string, () => Promise<any>> = {
    instagram: async () => {
      const r = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: env.INSTAGRAM_CLIENT_ID!, client_secret: env.INSTAGRAM_CLIENT_SECRET!, grant_type: 'authorization_code', redirect_uri: redirectUri, code }),
      });
      return r.json();
    },
    facebook: async () => {
      const r = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${env.FACEBOOK_APP_ID}&client_secret=${env.FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`);
      return r.json();
    },
    twitter: async () => {
      const creds = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString('base64');
      const r = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, grant_type: 'authorization_code', redirect_uri: redirectUri, code_verifier: 'challenge' }),
      });
      return r.json();
    },
    linkedin: async () => {
      const r = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: env.LINKEDIN_CLIENT_ID!, client_secret: env.LINKEDIN_CLIENT_SECRET! }),
      });
      return r.json();
    },
    tiktok: async () => {
      const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_key: env.TIKTOK_CLIENT_KEY!, client_secret: env.TIKTOK_CLIENT_SECRET!, code, grant_type: 'authorization_code', redirect_uri: redirectUri }),
      });
      return r.json();
    },
    youtube: async () => {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
      });
      return r.json();
    },
    google_business: async () => {
      const r = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
      });
      return r.json();
    },
    pinterest: async () => {
      const r = await fetch('https://api.pinterest.com/v5/oauth/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${Buffer.from(`${env.PINTEREST_CLIENT_ID}:${env.PINTEREST_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
      });
      return r.json();
    },
    twitch: async () => {
      const r = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: env.TWITCH_CLIENT_ID!, client_secret: env.TWITCH_CLIENT_SECRET!, code, grant_type: 'authorization_code', redirect_uri: redirectUri }),
      });
      return r.json();
    },
    threads: async () => {
      const r = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: env.THREADS_CLIENT_ID || env.INSTAGRAM_CLIENT_ID || '', client_secret: env.THREADS_CLIENT_SECRET || env.INSTAGRAM_CLIENT_SECRET || '', grant_type: 'authorization_code', redirect_uri: redirectUri, code }),
      });
      return r.json();
    },
    spotify: async () => {
      const r = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, redirect_uri: redirectUri, grant_type: 'authorization_code' }),
      });
      return r.json();
    },
    truth_social: async () => {
      const r = await fetch('https://truthsocial.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: env.TRUTH_SOCIAL_CLIENT_ID!, client_secret: env.TRUTH_SOCIAL_CLIENT_SECRET!, code, grant_type: 'authorization_code', redirect_uri: redirectUri }),
      });
      return r.json();
    },
    shopify: async () => {
      const r = await fetch(`https://store.myshopify.com/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: env.SHOPIFY_CLIENT_ID, client_secret: env.SHOPIFY_CLIENT_SECRET, code }),
      });
      return r.json();
    },
    // Kick: uses OAuth 2.0 PKCE flow (kick.com developer platform)
    kick: async () => {
      const r = await fetch('https://id.kick.com/oauth/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code', code,
          redirect_uri: redirectUri,
          client_id:     (env as any).KICK_CLIENT_ID    || '',
          client_secret: (env as any).KICK_CLIENT_SECRET || '',
        }),
      });
      return r.json();
    },
    // Rumble: API key + creator authentication (Rumble partner program)
    rumble: async () => {
      const r = await fetch('https://rumble.com/oauth2/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code', code,
          redirect_uri: redirectUri,
          client_id:     (env as any).RUMBLE_CLIENT_ID    || '',
          client_secret: (env as any).RUMBLE_CLIENT_SECRET || '',
        }),
      });
      return r.json();
    },
  };

  const fn = exchanges[platform];
  if (!fn) throw new Error(`Token exchange not implemented for ${platform}`);
  const data = await fn();

  return {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_in:    data.expires_in,
    scope:         data.scope,
    raw:           data,
  };
}

// ─── ACCOUNT INFO FETCHER ─────────────────────────────────────────────────────

async function fetchAccountInfo(platform: string, accessToken: string): Promise<{
  platform_user_id: string; account_name: string; avatar_url?: string; follower_count?: number;
}> {
  const fetchers: Record<string, () => Promise<any>> = {
    instagram: async () => {
      const r = await fetch(`https://graph.instagram.com/me?fields=id,username,followers_count,profile_picture_url&access_token=${accessToken}`);
      const d = await r.json();
      return { platform_user_id: d.id, account_name: d.username, avatar_url: d.profile_picture_url, follower_count: d.followers_count };
    },
    facebook: async () => {
      const r = await fetch(`https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`);
      const d = await r.json();
      return { platform_user_id: d.id, account_name: d.name, avatar_url: d.picture?.data?.url };
    },
    twitter: async () => {
      const r = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url,public_metrics', { headers: { Authorization: `Bearer ${accessToken}` } });
      const d = await r.json();
      return { platform_user_id: d.data?.id, account_name: d.data?.username, avatar_url: d.data?.profile_image_url, follower_count: d.data?.public_metrics?.followers_count };
    },
    linkedin: async () => {
      const r = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~digitalmediaAsset:playableStreams))', { headers: { Authorization: `Bearer ${accessToken}` } });
      const d = await r.json();
      return { platform_user_id: d.id, account_name: `${d.localizedFirstName} ${d.localizedLastName}` };
    },
    tiktok: async () => {
      const r = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count', { headers: { Authorization: `Bearer ${accessToken}` } });
      const d = await r.json();
      return { platform_user_id: d.data?.user?.open_id, account_name: d.data?.user?.display_name, avatar_url: d.data?.user?.avatar_url, follower_count: d.data?.user?.follower_count };
    },
    youtube: async () => {
      const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true&access_token=${accessToken}`);
      const d = await r.json();
      const ch = d.items?.[0];
      return { platform_user_id: ch?.id, account_name: ch?.snippet?.title, avatar_url: ch?.snippet?.thumbnails?.default?.url, follower_count: parseInt(ch?.statistics?.subscriberCount || '0') };
    },
    twitch: async () => {
      const r = await fetch('https://api.twitch.tv/helix/users', { headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': env.TWITCH_CLIENT_ID! } });
      const d = await r.json();
      const u = d.data?.[0];
      return { platform_user_id: u?.id, account_name: u?.display_name || u?.login, avatar_url: u?.profile_image_url };
    },
    spotify: async () => {
      const r = await fetch('https://api.spotify.com/v1/me', { headers: { Authorization: `Bearer ${accessToken}` } });
      const d = await r.json();
      return { platform_user_id: d.id, account_name: d.display_name || d.id, avatar_url: d.images?.[0]?.url, follower_count: d.followers?.total };
    },
  };

  const fn = fetchers[platform];
  if (!fn) return { platform_user_id: 'unknown', account_name: platform };
  return fn();
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Step 1: Initiate OAuth — GET /oauth/connect/:platform?workspace_id=X&brand_id=Y
router.get('/connect/:platform', async (req: Request, res: Response): Promise<void> => {
  const { platform } = req.params;
  const { workspace_id, brand_id } = req.query as Record<string, string>;

  if (!workspace_id) { res.status(400).json({ error: 'workspace_id required' }); return; }

  const state = `${workspace_id}|${brand_id || ''}|${Date.now()}`;
  const authUrl = buildAuthUrl(platform, state);

  if (!authUrl) {
    res.status(400).json({ error: `Platform ${platform} does not support OAuth. Use API key connection instead.` });
    return;
  }

  logger.info('OAuth connect initiated', { platform, workspace_id });
  res.redirect(authUrl);
});

// Step 2: OAuth callback — GET /oauth/callback/:platform?code=X&state=Y
router.get('/callback/:platform', async (req: Request, res: Response): Promise<void> => {
  const { platform } = req.params;
  const { code, state, error, error_description } = req.query as Record<string, string>;
  const FRONTEND = env.FRONTEND_URL || env.APP_URL || 'http://localhost:3000';

  // Handle OAuth denial
  if (error) {
    logger.warn('OAuth denied', { platform, error, error_description });
    res.redirect(`${FRONTEND}/Settings?oauth_error=${encodeURIComponent(error_description || error)}&platform=${platform}`);
    return;
  }

  if (!code || !state) {
    res.redirect(`${FRONTEND}/Settings?oauth_error=missing_code&platform=${platform}`);
    return;
  }

  const [workspace_id, brand_id] = state.split('|');
  const redirectUri = `${env.APP_URL}/v1/oauth/callback/${platform}`;

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(platform, code, redirectUri);

    // Fetch account info
    const accountInfo = await fetchAccountInfo(platform, tokens.access_token);

    // Upsert SocialAccount
    const existing = await db.socialAccount.findFirst({ where: { workspace_id, platform: platform as any, platform_user_id: accountInfo.platform_user_id } });

    const accountData = {
      workspace_id,
      brand_id:           brand_id || null,
      platform:           platform as any,
      platform_user_id:   accountInfo.platform_user_id,
      account_name:       accountInfo.account_name,
      avatar_url:         accountInfo.avatar_url,
      follower_count:     accountInfo.follower_count || 0,
      access_token:       tokens.access_token,
      refresh_token:      tokens.refresh_token || null,
      token_expires_at:   tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
      scopes:             tokens.scope ? tokens.scope.split(/[, +]+/) : [],
      status:             'active',
      health_status:      'healthy',
      last_synced_at:     new Date(),
    };

    const account = existing
      ? await db.socialAccount.update({ where: { id: existing.id }, data: accountData })
      : await db.socialAccount.create({ data: accountData });

    // Update workspace connected_accounts_count
    const connectedCount = await db.socialAccount.count({ where: { workspace_id, status: 'active' } });
    await db.workspace.update({ where: { id: workspace_id }, data: { connected_accounts_count: connectedCount } });

    logger.info('OAuth connected successfully', { platform, accountName: accountInfo.account_name, workspace_id });
    res.redirect(`${FRONTEND}/Settings?oauth_success=true&platform=${platform}&account=${encodeURIComponent(accountInfo.account_name)}`);
  } catch (e) {
    logger.error('OAuth callback error', { platform, error: e });
    res.redirect(`${FRONTEND}/Settings?oauth_error=${encodeURIComponent((e as Error).message)}&platform=${platform}`);
  }
});

// ─── API KEY / DIRECT CONNECTION (Bluesky, Rumble, Kick) ─────────────────────

router.post('/connect-apikey', async (req: Request, res: Response): Promise<void> => {
  const { platform, workspace_id, brand_id, api_key, username, password } = req.body;

  if (!platform || !workspace_id) { res.status(400).json({ error: 'platform + workspace_id required' }); return; }

  let platform_user_id = username || 'api_user';
  let account_name = username || platform;
  let access_token = api_key || '';

  // Bluesky: use DID from username lookup
  if (platform === 'bluesky' && username && password) {
    try {
      const r = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: username, password }),
      });
      const d = await r.json();
      platform_user_id = d.did;
      account_name     = d.handle;
      access_token     = d.accessJwt;
    } catch (e) {
      logger.warn('Bluesky auth failed', { error: e });
    }
  }

  await db.socialAccount.upsert({
    where:  { id: `${workspace_id}_${platform}` },
    create: { id: `${workspace_id}_${platform}`, workspace_id, brand_id: brand_id || null, platform: platform as any, platform_user_id, account_name, access_token: encrypt(access_token), status: 'active', health_status: 'healthy', last_synced_at: new Date() },
    update: { access_token: encrypt(access_token), status: 'active', health_status: 'healthy', last_synced_at: new Date() },
  });

  ok(res, { connected: true, platform, account_name });
});

// ─── TOKEN REFRESH ────────────────────────────────────────────────────────────

router.post('/refresh/:accountId', authenticate, async (req: Request, res: Response): Promise<void> => {
  const account = await db.socialAccount.findUnique({ where: { id: req.params.accountId } });
  if (!account?.refresh_token) { res.status(400).json({ error: 'No refresh token available' }); return; }

  const refreshers: Record<string, () => Promise<any>> = {
    youtube:        async () => { const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: account.refresh_token!, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET! }) }); return r.json(); },
    google_business: async () => { const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: account.refresh_token!, client_id: env.GOOGLE_CLIENT_ID!, client_secret: env.GOOGLE_CLIENT_SECRET! }) }); return r.json(); },
    twitter:        async () => { const creds = Buffer.from(`${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`).toString('base64'); const r = await fetch('https://api.twitter.com/2/oauth2/token', { method: 'POST', headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: account.refresh_token! }) }); return r.json(); },
    linkedin:       async () => { const r = await fetch('https://www.linkedin.com/oauth/v2/accessToken', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: account.refresh_token!, client_id: env.LINKEDIN_CLIENT_ID!, client_secret: env.LINKEDIN_CLIENT_SECRET! }) }); return r.json(); },
    spotify:        async () => { const r = await fetch('https://accounts.spotify.com/api/token', { method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: account.refresh_token! }) }); return r.json(); },
    tiktok:         async () => { const r = await fetch('https://open.tiktokapis.com/v2/oauth/token/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ client_key: env.TIKTOK_CLIENT_KEY!, client_secret: env.TIKTOK_CLIENT_SECRET!, grant_type: 'refresh_token', refresh_token: account.refresh_token! }) }); return r.json(); },
  };

  const fn = refreshers[account.platform as string];
  if (!fn) { res.status(400).json({ error: `Token refresh not supported for ${account.platform}` }); return; }

  try {
    const data = await fn();
    await db.socialAccount.update({
      where: { id: account.id },
      data: {
        access_token:    data.access_token,
        refresh_token:   data.refresh_token || account.refresh_token,
        token_expires_at: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : null,
        health_status:   'healthy',
      },
    });
    ok(res, { refreshed: true });
  } catch (e) {
    logger.error('Token refresh failed', { accountId: account.id, error: e });
    await db.socialAccount.update({ where: { id: account.id }, data: { health_status: 'error', status: 'disconnected' } });
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
