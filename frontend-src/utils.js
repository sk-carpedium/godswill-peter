/**
 * utils.js — Frontend utility functions
 *
 * createPageUrl(pageName) — converts page name to URL path.
 * Used by: Layout, ConnectedAccounts, MultiWorkspaceDashboard, Pricing, etc.
 *
 * Place at: src/utils.js
 */

/**
 * Convert a page name to a URL path.
 * Examples:
 *   createPageUrl('Dashboard')          → '/Dashboard'
 *   createPageUrl('AnalyticsDashboard') → '/AnalyticsDashboard'
 *   createPageUrl('CampaignDetails')    → '/CampaignDetails'
 */
export function createPageUrl(pageName) {
  if (!pageName) return '/';
  // Handle special cases where the page is the home page
  if (pageName === 'Dashboard' || pageName === 'Home') return '/';
  return `/${pageName}`;
}

/** Safe in-app path from ?return= (blocks open redirects). */
export function sanitizeReturnPath(raw) {
  if (raw == null || typeof raw !== 'string') return '/';
  try {
    const decoded = decodeURIComponent(raw.trim());
    if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
      const p = decoded || '/';
      const seg = p.split('?')[0];
      if (/^\/login$/i.test(seg) || /^\/Landing$/i.test(seg)) return '/';
      return p;
    }
  } catch (_) {}
  return '/';
}

/**
 * Format a number for display (1234 → 1.2K, 1234567 → 1.2M)
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '—';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

/**
 * Format currency
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount || 0);
}

/**
 * Truncate text to a max length
 */
export function truncate(str, maxLength = 100) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '…' : str;
}

/**
 * Get platform color
 */
export const PLATFORM_COLORS = {
  instagram: '#E1306C', facebook: '#1877F2', twitter: '#1DA1F2',
  linkedin: '#0A66C2', tiktok: '#000000', youtube: '#FF0000',
  pinterest: '#E60023', threads: '#000000', bluesky: '#0085FF',
  twitch: '#9146FF', spotify: '#1DB954', shopify: '#96BF48',
  google_business: '#4285F4', kick: '#53FC18', rumble: '#85C742',
  truth_social: '#5448EE',
};

export function getPlatformColor(platform) {
  return PLATFORM_COLORS[platform?.toLowerCase()] || '#d4af37';
}
