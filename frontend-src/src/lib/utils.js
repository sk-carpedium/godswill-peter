/**
 * lib/utils.js — shadcn/ui utility helpers
 *
 * CRITICAL: 105 components import { cn } from '@/lib/utils'.
 * Without this file the entire app crashes on load.
 *
 * Place at: src/lib/utils.js
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * cn() — merge Tailwind classes safely, resolving conflicts.
 * Used by every shadcn/ui component and most feature components.
 *
 * Example:
 *   cn("px-4 py-2", isActive && "bg-blue-500", className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default cn;
