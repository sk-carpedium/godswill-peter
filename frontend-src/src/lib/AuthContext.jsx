/**
 * AuthContext — Nexus Social session (JWT access + refresh via `@/api/client`).
 *
 * Boot: GET /app/public-settings (optional Bearer) → GET /auth/me when a token exists.
 *
 * authError.type === 'auth_required'       → redirect to /login
 * authError.type === 'user_not_registered' → UserNotRegisteredError
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api, getAccessToken } from '@/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,                    setUser]                    = useState(null);
  const [isAuthenticated,         setIsAuthenticated]         = useState(false);
  const [isLoadingAuth,           setIsLoadingAuth]           = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError,               setAuthError]               = useState(null);
  const [appPublicSettings,       setAppPublicSettings]       = useState(null);

  useEffect(() => { checkAppState(); }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);

      // GET /app/public-settings — public endpoint on our Express backend.
      // If a token exists in localStorage, the backend validates it and
      // returns workspace-specific branding + features.
      const apiUrl = (() => {
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
          return import.meta.env.VITE_API_URL.replace(/\/$/, '');
        return 'http://localhost:4000/v1';
      })();

      const token = typeof localStorage !== 'undefined' ? getAccessToken() : null;

      const res = await fetch(`${apiUrl}/app/public-settings`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Backend returns 403 + extra_data.reason for auth-related errors
        const reason = data?.extra_data?.reason;
        if (res.status === 403 && reason) {
          setAuthError({ type: reason, message: data?.error || 'Access denied' });
        } else {
          setAuthError({ type: 'unknown', message: data?.error || `HTTP ${res.status}` });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        return;
      }

      const publicSettings = data?.data || data;
      setAppPublicSettings(publicSettings);
      setIsLoadingPublicSettings(false);

      // Step 2 — If a token exists, validate it and get the user profile
      if (token) {
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('[AuthContext] checkAppState error:', err);
      // Network errors or unexpected issues — still allow the app to render
      // so users can at least see the login page
      setAuthError({ type: 'unknown', message: err.message || 'Failed to load app settings' });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  /**
   * Step 2 — Validate existing token and load the user profile.
   * Called after public settings are loaded successfully.
   */
  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      // GET /auth/me — returns user if token is valid, throws on 401/403
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('[AuthContext] checkUserAuth error:', err);
      setIsAuthenticated(false);
      if (err.status === 401 || err.status === 403) {
        try {
          localStorage.removeItem('nexus_access_token');
          localStorage.removeItem('nexus_refresh_token');
          localStorage.removeItem('base44_access_token');
          localStorage.removeItem('token');
        } catch (_) { /* ignore */ }
        const reason = err.extra_data?.reason || 'auth_required';
        setAuthError({ type: reason, message: err.message || 'Authentication required' });
      }
    } finally {
      setIsLoadingAuth(false);
    }
  };

  /**
   * Logout — clears tokens, redirects to /login.
   * Layout.jsx:  logout(true) or logout()
   * AuthContext internal: logout(false) skips redirect
   */
  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      api.auth.logout(window.location.href);
    } else {
      api.auth.logout();
    }
  };

  /** Redirect to /login, preserving current URL for post-login return */
  const navigateToLogin = () => {
    api.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
