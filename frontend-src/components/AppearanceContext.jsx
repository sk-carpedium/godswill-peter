import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'app_appearance';

const DEFAULTS = {
  darkMode: false,
  primaryColor: '#d4af37',
  sidebarStyle: 'default',
  fontSize: 'medium',
};

// Convert a hex color to HSL string for CSS variables
function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyAppearance(settings) {
  const root = document.documentElement;

  // ── Dark mode ──────────────────────────────────────────────────────────────
  if (settings.darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // ── Primary color ──────────────────────────────────────────────────────────
  // Set the raw hex var used by inline styles throughout the app
  root.style.setProperty('--app-primary', settings.primaryColor);

  // Also override the Tailwind --primary HSL token so shadcn components
  // (Button default variant, rings, etc.) pick up the chosen color.
  const hsl = hexToHsl(settings.primaryColor);
  root.style.setProperty('--primary', hsl);
  // Keep foreground readable: use dark text on light colors, white on dark
  const [, , l] = hsl.split(' ').map(v => parseFloat(v));
  const foregroundHsl = l > 55 ? '0 0% 9%' : '0 0% 98%';
  root.style.setProperty('--primary-foreground', foregroundHsl);

  // ── Font size ──────────────────────────────────────────────────────────────
  const fontSizeMap = { small: '13px', medium: '14px', large: '16px' };
  root.style.setProperty('--app-font-size', fontSizeMap[settings.fontSize] || '14px');
  root.style.fontSize = fontSizeMap[settings.fontSize] || '14px';

  // ── Sidebar style ──────────────────────────────────────────────────────────
  root.setAttribute('data-sidebar-style', settings.sidebarStyle || 'default');
}

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULTS, ...JSON.parse(stored) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  // Apply on mount + whenever settings change
  useEffect(() => {
    applyAppearance(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (patch) => setSettings((prev) => ({ ...prev, ...patch }));

  return (
    <AppearanceContext.Provider value={{ settings, updateSettings }}>
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used inside AppearanceProvider');
  return ctx;
}