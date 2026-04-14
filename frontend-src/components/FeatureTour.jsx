import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FeatureTour({ steps, onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !steps || steps.length === 0) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkipTour = () => {
    setIsVisible(false);
    onSkip?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleSkipTour}
          />

          {/* Spotlight effect */}
          {step.target && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[51] pointer-events-none"
              style={{
                left: step.target.x - 8,
                top: step.target.y - 8,
                width: step.target.width + 16,
                height: step.target.height + 16,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
                borderRadius: '12px'
              }}
            />
          )}

          {/* Tour tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={cn(
              "fixed z-[52] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl p-6 max-w-sm",
              step.position === 'top' && "mb-4",
              step.position === 'bottom' && "mt-4",
              step.position === 'left' && "mr-4",
              step.position === 'right' && "ml-4"
            )}
            style={{
              left: step.x || '50%',
              top: step.y || '50%',
              transform: !step.x && !step.y ? 'translate(-50%, -50%)' : undefined
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#f4cf47] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {step.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkipTour}
                className="h-8 w-8 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {step.content && (
              <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                {step.content}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      idx === currentStep
                        ? "w-8 bg-[#d4af37]"
                        : "w-1.5 bg-slate-300 dark:bg-slate-700"
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipTour}
                  className="text-slate-500"
                >
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-[#d4af37] to-[#f4cf47] hover:from-[#c49f2f] hover:to-[#e4bf37] text-slate-950 gap-2"
                >
                  {currentStep === steps.length - 1 ? 'Done' : 'Next'}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook to trigger feature tours
export function useFeatureTour(tourKey) {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${tourKey}`);
    if (!hasSeenTour) {
      // Delay showing tour to allow page to render
      setTimeout(() => setShowTour(true), 500);
    }
  }, [tourKey]);

  const completeTour = () => {
    localStorage.setItem(`tour_${tourKey}`, 'true');
    setShowTour(false);
  };

  const skipTour = () => {
    localStorage.setItem(`tour_${tourKey}`, 'true');
    setShowTour(false);
  };

  return { showTour, completeTour, skipTour };
}