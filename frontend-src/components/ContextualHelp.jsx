import React, { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { HelpCircle, Sparkles, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HelpTooltip({ children, content, side = 'top', variant = 'default' }) {
  const icons = {
    default: HelpCircle,
    ai: Sparkles,
    info: Info,
    tip: Lightbulb
  };

  const Icon = icons[variant] || icons.default;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center transition-colors",
              variant === 'ai' && "text-[#d4af37] hover:text-[#c49f2f]",
              variant === 'default' && "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300",
              variant === 'info' && "text-blue-500 hover:text-blue-600",
              variant === 'tip' && "text-amber-500 hover:text-amber-600"
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-800/50"
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function HelpPanel({ title, children, variant = 'default', className }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const variants = {
    default: {
      bg: 'bg-slate-50 dark:bg-slate-900/50',
      border: 'border-slate-200 dark:border-slate-800',
      icon: Info,
      iconColor: 'text-slate-600 dark:text-slate-400'
    },
    ai: {
      bg: 'bg-gradient-to-br from-[#d4af37]/5 to-[#f4cf47]/5',
      border: 'border-[#d4af37]/20',
      icon: Sparkles,
      iconColor: 'text-[#d4af37]'
    },
    tip: {
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Lightbulb,
      iconColor: 'text-amber-600 dark:text-amber-400'
    }
  };

  const config = variants[variant] || variants.default;
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-all",
      config.bg,
      config.border,
      className
    )}>
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={cn("flex-shrink-0 mt-0.5", config.iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm text-slate-900 dark:text-white mb-1">
            {title}
          </h4>
          {isExpanded && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {children}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
        >
          {isExpanded ? 'Less' : 'More'}
        </Button>
      </div>
    </div>
  );
}

export function QuickTip({ children, className }) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300",
      className
    )}>
      <Lightbulb className="w-4 h-4 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function AIFeatureBadge({ className }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#d4af37]/10 to-[#f4cf47]/10 border border-[#d4af37]/20 text-xs font-medium text-[#d4af37]",
      className
    )}>
      <Sparkles className="w-3 h-3" />
      AI-Powered
    </span>
  );
}