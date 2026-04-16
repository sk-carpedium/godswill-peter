/**
 * NavigationTracker.jsx  — Page Navigation Logger
 *
 * Tracks every page navigation for analytics.
 * Logs to POST /app-logs via api.appLogs.logUserInApp()
 *
 * Fix applied: the original passed pageName (string) directly.
 * Our SDK's logUserInApp expects { page, action, metadata }.
 * This version wraps the string correctly.
 *
 * Place at: src/lib/NavigationTracker.jsx
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from '@/api/client';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
  const location      = useLocation();
  const { isAuthenticated } = useAuth();
  const { Pages, mainPage } = pagesConfig;
  const mainPageKey   = mainPage ?? Object.keys(Pages)[0];

  useEffect(() => {
    const pathname = location.pathname;
    let pageName;

    if (pathname === '/' || pathname === '') {
      pageName = mainPageKey;
    } else {
      const pathSegment = pathname.replace(/^\//, '').split('/')[0];
      const pageKeys    = Object.keys(Pages);
      const matchedKey  = pageKeys.find(k => k.toLowerCase() === pathSegment.toLowerCase());
      pageName = matchedKey || pathSegment || null;
    }

    if (isAuthenticated && pageName) {
      // Fix: SDK expects { page, action, metadata }, not a bare string
      api.appLogs.logUserInApp({
        page:     pageName,
        action:   'navigate',
        metadata: { path: pathname, timestamp: new Date().toISOString() },
      }).catch(() => {
        // Silently fail — navigation logging should never break the app
      });
    }
  }, [location, isAuthenticated, Pages, mainPageKey]);

  return null;
}
