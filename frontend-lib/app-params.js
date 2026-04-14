/**
 * app-params.js  — Nexus Social frontend configuration
 *
 * REPLACES the original @base44/sdk app-params that held:
 *   appId, token, functionsVersion, appBaseUrl  (Base44 platform credentials)
 *
 * Now holds only the Nexus backend URL, read from Vite env vars.
 *
 * Usage in .env:
 *   VITE_API_URL=http://localhost:4000/v1       (development)
 *   VITE_API_URL=https://api.yourdomain.com/v1  (production)
 *
 * Place at: src/lib/app-params.js
 */

const apiUrl = (() => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL.replace(/\/$/, '');
  }
  return 'http://localhost:4000/v1';
})();

export const appParams = {
  /** Full API base URL — used by AuthContext and base44Client */
  apiUrl,

  /** Alias used by some components */
  appBaseUrl: apiUrl,

  /** Not used by Nexus backend — kept for component compatibility */
  appId:            'nexus-social',
  token:            null,            // Tokens are stored in localStorage, not here
  functionsVersion: 'v1',
};

export default appParams;
