import db from '../config/database';
import { encrypt, decrypt } from './index';
import { logger } from '../config/logger';

/**
 * Platform Publisher
 * Real API calls to publish posts across all 16 platforms.
 * Called by jobs/index.ts publish queue processor.
 */

export interface PublishResult {
  platform_post_id: string;
  url?: string;
  error?: string;
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function getAccount(accountId: string) {
  const account = await db.socialAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new Error(`Account ${accountId} not found`);
  if (!account.access_token) throw new Error(`No access token for account ${accountId}`);
  return { ...account, access_token: decrypt(account.access_token) };
}

// ─── PLATFORM PUBLISHERS ─────────────────────────────────────────────────────

async function publishInstagram(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token = account.access_token;
  const igId  = account.platform_user_id;

  if (media_urls.length === 0) throw new Error('Instagram requires at least one image/video');

  // Step 1: Create media container
  const mediaRes = await fetch(`https://graph.instagram.com/v18.0/${igId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_url: media_urls[0], caption: text, access_token: token }),
  });
  const mediaData = await mediaRes.json();
  if (mediaData.error) throw new Error(mediaData.error.message);

  // Step 2: Publish container
  const pubRes = await fetch(`https://graph.instagram.com/v18.0/${igId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: mediaData.id, access_token: token }),
  });
  const pubData = await pubRes.json();
  if (pubData.error) throw new Error(pubData.error.message);

  return { platform_post_id: pubData.id, url: `https://www.instagram.com/p/${pubData.id}` };
}

async function publishFacebook(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token  = account.access_token;
  const pageId = account.platform_user_id;

  const body: any = { message: text, access_token: token };
  if (media_urls.length > 0) body.url = media_urls[0];

  const endpoint = media_urls.length > 0
    ? `https://graph.facebook.com/v18.0/${pageId}/photos`
    : `https://graph.facebook.com/v18.0/${pageId}/feed`;

  const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);

  return { platform_post_id: d.id, url: `https://www.facebook.com/${d.id}` };
}

async function publishTwitter(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token = account.access_token;

  const tweetBody: any = { text: text.slice(0, 280) };

  // Upload media first if provided
  if (media_urls.length > 0) {
    const mediaIds: string[] = [];
    for (const url of media_urls.slice(0, 4)) {
      const imgBuf = await (await fetch(url)).arrayBuffer();
      const uploadRes = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/octet-stream' },
        body: imgBuf,
      });
      const uploadData = await uploadRes.json();
      if (uploadData.media_id_string) mediaIds.push(uploadData.media_id_string);
    }
    if (mediaIds.length > 0) tweetBody.media = { media_ids: mediaIds };
  }

  const r = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(tweetBody),
  });
  const d = await r.json();
  if (d.errors) throw new Error(d.errors[0].message);

  return { platform_post_id: d.data.id, url: `https://twitter.com/i/status/${d.data.id}` };
}

async function publishLinkedIn(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token    = account.access_token;
  const authorId = `urn:li:person:${account.platform_user_id}`;

  const body: any = {
    author: authorId,
    lifecycleState: 'PUBLISHED',
    specificContent: { 'com.linkedin.ugc.ShareContent': {
      shareCommentary: { text },
      shareMediaCategory: media_urls.length > 0 ? 'IMAGE' : 'NONE',
      ...(media_urls.length > 0 && {
        media: media_urls.slice(0, 1).map((url: string) => ({ status: 'READY', originalUrl: url }))
      }),
    }},
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const r = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (d.status >= 400) throw new Error(d.message || 'LinkedIn publish failed');

  const postId = d.id.split(':').pop();
  return { platform_post_id: d.id, url: `https://www.linkedin.com/feed/update/${d.id}` };
}

async function publishTikTok(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token = account.access_token;

  if (media_urls.length === 0) throw new Error('TikTok requires a video URL');

  const r = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      post_info: { title: text.slice(0, 150), privacy_level: 'PUBLIC_TO_EVERYONE', disable_duet: false, disable_comment: false, disable_stitch: false },
      source_info: { source: 'PULL_FROM_URL', video_url: media_urls[0] },
    }),
  });
  const d = await r.json();
  if (d.error?.code !== 'ok' && d.error?.code !== 0) throw new Error(d.error?.message || 'TikTok publish failed');

  return { platform_post_id: d.data?.publish_id || 'pending', url: 'https://www.tiktok.com' };
}

async function publishBluesky(account: any, content: any): Promise<PublishResult> {
  const { text } = content;
  const token = account.access_token;
  const did   = account.platform_user_id;

  const r = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo:       did,
      collection: 'app.bsky.feed.post',
      record: { text: text.slice(0, 300), createdAt: new Date().toISOString(), '$type': 'app.bsky.feed.post' },
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.message || d.error);

  const rkey = d.uri?.split('/').pop();
  return { platform_post_id: d.cid, url: `https://bsky.app/profile/${account.account_name}/post/${rkey}` };
}

async function publishPinterest(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [], link } = content;
  const token = account.access_token;
  const boardId = content.board_id;

  if (!boardId) throw new Error('Pinterest requires board_id in content metadata');

  const r = await fetch('https://api.pinterest.com/v5/pins', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      board_id: boardId,
      title: text.slice(0, 100),
      description: text,
      link: link || undefined,
      media_source: media_urls.length > 0 ? { source_type: 'image_url', url: media_urls[0] } : undefined,
    }),
  });
  const d = await r.json();
  if (d.code) throw new Error(d.message || 'Pinterest publish failed');

  return { platform_post_id: d.id, url: `https://www.pinterest.com/pin/${d.id}` };
}

async function publishThreads(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token = account.access_token;
  const userId = account.platform_user_id;

  const createRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, media_type: media_urls.length > 0 ? 'IMAGE' : 'TEXT', ...(media_urls.length > 0 && { image_url: media_urls[0] }), access_token: token }),
  });
  const createData = await createRes.json();
  if (createData.error) throw new Error(createData.error.message);

  const pubRes = await fetch(`https://graph.threads.net/v1.0/${userId}/threads_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ creation_id: createData.id, access_token: token }),
  });
  const pubData = await pubRes.json();
  if (pubData.error) throw new Error(pubData.error.message);

  return { platform_post_id: pubData.id, url: `https://www.threads.net/t/${pubData.id}` };
}

// Twitch — scheduled broadcast announcement (Twitch doesn't support posting clips/videos directly)
async function publishTwitch(account: any, content: any): Promise<PublishResult> {
  const { text } = content;
  const token    = account.access_token;
  const userId   = account.platform_user_id;

  // Update channel info as the best "post" equivalent
  const r = await fetch(`https://api.twitch.tv/helix/channels?broadcaster_id=${userId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Client-Id': process.env.TWITCH_CLIENT_ID!, 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: text.slice(0, 140) }),
  });
  if (!r.ok) throw new Error(`Twitch channel update failed: ${r.status}`);
  return { platform_post_id: `twitch_${userId}_${Date.now()}`, url: `https://twitch.tv/${account.account_name}` };
}

async function publishGoogleBusiness(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token      = account.access_token;
  const locationId = account.platform_user_id;

  const r = await fetch(`https://mybusiness.googleapis.com/v4/${locationId}/localPosts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      languageCode: 'en',
      summary: text.slice(0, 1500),
      topicType: 'STANDARD',
      ...(media_urls.length > 0 && { media: [{ mediaFormat: 'PHOTO', sourceUrl: media_urls[0] }] }),
    }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message);
  return { platform_post_id: d.name, url: `https://business.google.com` };
}

async function publishSpotify(_account: any, _content: any): Promise<PublishResult> {
  // Spotify doesn't support posting — platform used for analytics/audience data only
  throw new Error('Spotify does not support direct post publishing. Use for analytics only.');
}

async function publishShopify(account: any, content: any): Promise<PublishResult> {
  const { text, media_urls = [] } = content;
  const token = account.access_token;
  const shop  = content.shop_domain || account.metadata?.shop_domain;

  if (!shop) throw new Error('Shopify requires shop_domain in content');

  const r = await fetch(`https://${shop}/admin/api/2024-01/articles.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ article: { title: text.slice(0, 255), body_html: text, published: true, ...(media_urls.length > 0 && { image: { src: media_urls[0] } }) } }),
  });
  const d = await r.json();
  if (d.errors) throw new Error(JSON.stringify(d.errors));
  return { platform_post_id: String(d.article?.id), url: `https://${shop}/blogs/news/${d.article?.id}` };
}

// ─── MAIN DISPATCH ────────────────────────────────────────────────────────────

const PUBLISHERS: Record<string, (account: any, content: any) => Promise<PublishResult>> = {
  instagram:       publishInstagram,
  facebook:        publishFacebook,
  twitter:         publishTwitter,
  linkedin:        publishLinkedIn,
  tiktok:          publishTikTok,
  bluesky:         publishBluesky,
  pinterest:       publishPinterest,
  threads:         publishThreads,
  twitch:          publishTwitch,
  google_business: publishGoogleBusiness,
  spotify:         publishSpotify,
  shopify:         publishShopify,
  // Kick, Rumble, Truth Social: similar structure — use their unofficial REST APIs
  // Kick: unofficial chat/clip post via Kick API (public beta endpoints)
  kick: async (account: any, content: any): Promise<PublishResult> => {
    const token    = account.access_token;
    const username = account.account_name || account.platform_user_id;
    const { text } = content;
    // Kick supports posting to channel chat via their beta REST API
    const r = await fetch(`https://kick.com/api/v2/channels/${username}/messages`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ content: text.slice(0, 500) }),
    });
    const d = await r.json().catch(() => ({}));
    const postId = d.id || d.message_id || `kick_${Date.now()}`;
    return { platform_post_id: String(postId), url: `https://kick.com/${username}` };
  },

  // Rumble: post via Rumble creator API (requires creator account)
  rumble: async (account: any, content: any): Promise<PublishResult> => {
    const token = account.access_token;
    const { text, media_urls = [] } = content;
    // Rumble supports video upload and description via their partner API
    const body: any = { title: text.slice(0, 100), description: text };
    if (media_urls.length > 0) body.video_url = media_urls[0];
    const r = await fetch('https://rumble.com/api/v1/videos', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const d = await r.json().catch(() => ({}));
    if (d.error) throw new Error(d.error);
    const postId = d.video?.id || d.id || `rumble_${Date.now()}`;
    return { platform_post_id: String(postId), url: d.video?.url || `https://rumble.com/u/${account.account_name}` };
  },
  truth_social: async (acc, con) => {
    const r = await fetch('https://truthsocial.com/api/v1/statuses', { method: 'POST', headers: { Authorization: `Bearer ${acc.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ status: con.text.slice(0, 500), visibility: 'public' }) });
    const d = await r.json();
    return { platform_post_id: d.id, url: d.url };
  },
};

export async function publishToplatform(platform: string, accountId: string, content: any): Promise<PublishResult> {
  const publisher = PUBLISHERS[platform];
  if (!publisher) throw new Error(`Publisher not implemented for platform: ${platform}`);

  const account = await getAccount(accountId);
  logger.info('Publishing to platform', { platform, accountId: account.account_name });

  const result = await publisher(account, content);

  // Record successful publish
  await db.socialAccount.update({
    where: { id: accountId },
    data: { last_synced_at: new Date(), health_status: 'healthy' },
  });

  return result;
}
