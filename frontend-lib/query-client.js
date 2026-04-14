/**
 * query-client.js  — React Query Configuration
 *
 * Provides a configured QueryClient instance for the entire app.
 * Used by: App.jsx → <QueryClientProvider client={queryClientInstance}>
 *
 * Configuration:
 *   staleTime: 30s   — data is fresh for 30s, no refetch on focus/remount
 *   gcTime:    5min  — cached data kept for 5 min after last use
 *   retry: 1         — retry once on failure (not on 401/403/404)
 *   refetchOnWindowFocus: false — prevents aggressive background refetches
 *
 * Place at: src/lib/query-client.js
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 30 seconds
      staleTime: 30 * 1000,
      // Keep unused cached data for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry once on network errors, but not on auth/not-found errors
      retry: (failureCount, error) => {
        if (failureCount >= 1) return false;
        const status = error?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return true;
      },
      // Don't refetch just because user switched tabs
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect (user can manually refresh)
      refetchOnReconnect: false,
    },
    mutations: {
      // Don't retry mutations — they may have side effects
      retry: false,
    },
  },
});

export default queryClientInstance;
