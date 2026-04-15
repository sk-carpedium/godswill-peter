/**
 * AppearanceContext.jsx  — Nexus Social Appearance Provider
 *
 * Provides: darkMode, primaryColor, sidebarStyle, fontSize
 * Storage:  localStorage (immediate, no flash)
 * Backend:  Workspace white-label settings override localStorage on mount.
 *           Reads from: appPublicSettings.primary_color (via AuthContext)
 *
 * CSS variables set on <html>:
 *   --app-primary   → hex color used by inline styles
 *   --primary       → HSL for Tailwind/shadcn Button, rings, focus
 *   --app-font-size → body font size
 *   data-sidebar-style → sidebar layout variant
 *
 * Place at: src/lib/AppearanceContext.jsx
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'app_appearance';

const DEFAULTS = {
  darkMode:     false,
  primaryColor: '#d4af37',
  sidebarStyle: 'default',
  fontSize:     'medium',
};

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6;                break;
      case b: h = ((r - g) / d + 4) / 6;                break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyAppearance(settings) {
  const root = document.documentElement;
  // Dark mode
  settings.darkMode ? root.classList.add('dark') : root.classList.remove('dark');
  // Primary color — raw hex for inline styles
  root.style.setProperty('--app-primary', settings.primaryColor);
  // Tailwind --primary in HSL for shadcn components (Button default, rings, focus)
  const hsl = hexToHsl(settings.primaryColor);
  root.style.setProperty('--primary', hsl);
  const lightness = parseFloat(hsl.split(' ')[2]);
  root.style.setProperty('--primary-foreground', lightness > 55 ? '0 0% 9%' : '0 0% 98%');
  // Font size
  const sizes = { small: '13px', medium: '14px', large: '16px' };
  root.style.setProperty('--app-font-size', sizes[settings.fontSize] || '14px');
  root.style.fontSize = sizes[settings.fontSize] || '14px';
  // Sidebar style
  root.setAttribute('data-sidebar-style', settings.sidebarStyle || 'default');
}

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const { appPublicSettings } = useAuth();

  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // When workspace public settings load, merge white-label branding as the base color.
  // localStorage overrides take priority unless they equal the default — meaning
  // if a user never customised, the workspace brand color is used.
  useEffect(() => {
    if (!appPublicSettings) return;
    const backendColor = appPublicSettings.primary_color;
    if (!backendColor) return;

    setSettings(prev => {
      // Only override if user hasn't changed from the default
      const userChangedColor = prev.primaryColor !== DEFAULTS.primaryColor;
      if (userChangedColor) return prev;
      return { ...prev, primaryColor: backendColor };
    });
  }, [appPublicSettings]);

  // Apply CSS variables whenever settings change
  useEffect(() => {
    applyAppearance(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (patch) => setSettings(prev => ({ ...prev, ...patch }));

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be inside AppearanceProvider');
  return ctx;
}
