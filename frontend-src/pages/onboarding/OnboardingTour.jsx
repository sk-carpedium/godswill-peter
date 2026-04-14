import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Sparkles, Calendar, BarChart3, Users, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Nexus Social! 🎉',
    description: 'Let\'s take a quick tour to help you get started with managing your social media like a pro.',
    icon: Sparkles,
    position: 'center',
    highlight: null,
  },
  {
    id: 'create-post',
    title: 'Create Content with AI',
    description: 'Click here to create and schedule posts across all your social media platforms. Our AI can help you generate engaging content in seconds.',
    icon: Sparkles,
    position: 'top-right',
    highlight: '[data-tour="create-post"]',
    action: { text: 'Try it now', page: 'Content' },
  },
  {
    id: 'ai-calendar',
    title: 'Smart Content Calendar',
    description: 'View your scheduled posts and let AI suggest optimal posting times based on your audience engagement patterns.',
    icon: Calendar,
    position: 'left',
    highlight: '[data-tour="calendar"]',
    action: { text: 'View Calendar', page: 'AIContentCalendar' },
  },
  {
    id: 'analytics',
    title: 'Track Your Performance',
    description: 'Get deep insights into your content performance with AI-powered analytics and recommendations.',
    icon: BarChart3,
    position: 'left',
    highlight: '[data-tour="analytics"]',
    action: { text: 'See Analytics', page: 'AnalyticsDashboard' },
  },
  {
    id: 'team',
    title: 'Collaborate with Your Team',
    description: 'Invite team members, manage approvals, and collaborate seamlessly with AI-powered task management.',
    icon: Users,
    position: 'left',
    highlight: '[data-tour="team"]',
    action: { text: 'Invite Team', page: 'Collaboration' },
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'You\'re ready to start managing your social media like never before. Need help? Check out our Help Center anytime.',
    icon: Check,
    position: 'center',
    highlight: null,
  },
];

export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightPosition, setHighlightPosition] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentStep < tourSteps.length) {
      const step = tourSteps[currentStep];
      if (step.highlight) {
        const element = document.querySelector(step.highlight);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightPosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          // Scroll element into view
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setHighlightPosition(null);
      }
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleComplete = async () => {
    setIsVisible(false);
    try {
      await base44.auth.updateMe({ onboarding_completed: true });
      if (onComplete) onComplete();
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  const handleAction = (action) => {
    if (action && action.page) {
      navigate(createPageUrl(action.page));
      handleNext();
    }
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[100]"
        onClick={handleSkip}
      />

      {/* Highlight spotlight */}
      <AnimatePresence>
        {highlightPosition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-[101] pointer-events-none"
            style={{
              top: highlightPosition.top - 8,
              left: highlightPosition.left - 8,
              width: highlightPosition.width + 16,
              height: highlightPosition.height + 16,
            }}
          >
            <div className="w-full h-full rounded-xl border-4 border-violet-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed z-[102] ${
          step.position === 'center'
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
            : step.position === 'top-right'
            ? 'top-24 right-6'
            : step.position === 'left'
            ? 'top-1/2 left-6 -translate-y-1/2'
            : 'bottom-6 right-6'
        }`}
      >
        <Card className="w-[420px] p-6 shadow-2xl border-2 border-violet-200 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-violet-600" />
              </div>
              <div className="text-sm text-slate-500">
                Step {currentStep + 1} of {tourSteps.length}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
          <p className="text-slate-600 mb-6 leading-relaxed">{step.description}</p>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {step.action && (
                <Button
                  variant="outline"
                  onClick={() => handleAction(step.action)}
                  className="border-violet-200 text-violet-700 hover:bg-violet-50"
                >
                  {step.action.text}
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>

          {currentStep < tourSteps.length - 1 && (
            <button
              onClick={handleSkip}
              className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-4"
            >
              Skip tour
            </button>
          )}
        </Card>
      </motion.div>
    </>
  );
}