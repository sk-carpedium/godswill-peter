import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, HelpCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function FeatureTooltip({ title, description, children, className }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className={cn("max-w-xs p-3 bg-slate-900 text-white", className)}
        >
          <div className="space-y-1">
            {title && <p className="font-semibold text-sm">{title}</p>}
            <p className="text-xs text-slate-300">{description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ContextualHelp({ title, steps, trigger }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8"
      >
        {trigger || <HelpCircle className="w-4 h-4 text-[#d4af37]" />}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute right-0 top-10 z-50 w-80 shadow-xl border-2 border-[#d4af37]/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-[#d4af37]" />
                  <h4 className="font-semibold text-slate-900">{title}</h4>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-[#d4af37]">
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export function InlineHelp({ children, className }) {
  return (
    <div className={cn(
      "flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200",
      className
    )}>
      <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-blue-900">{children}</p>
    </div>
  );
}