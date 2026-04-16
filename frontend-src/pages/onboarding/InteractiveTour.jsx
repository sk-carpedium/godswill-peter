import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';

const tourSteps = [
  {
    id: 'dashboard',
    page: 'Dashboard',
    title: 'Welcome to Your Dashboard',
    description: 'Your central hub for monitoring all your social media activity, performance metrics, and quick actions.',
    position: 'center',
    highlight: null
  },
  {
    id: 'social-listening',
    page: 'SocialListening',
    title: 'Social Listening & Brand Monitoring',
    description: 'Track brand mentions, analyze sentiment in real-time, and get instant alerts for crisis situations or sentiment shifts.',
    position: 'center',
    highlight: null,
    actions: ['Set up your first keyword to track', 'View real-time mentions dashboard']
  },
  {
    id: 'ai-assistant',
    page: 'AIAssistant',
    title: 'Your AI-Powered Assistant',
    description: 'Generate content, get posting time recommendations, create A/B test variations, and build complete content calendars with AI.',
    position: 'center',
    highlight: null,
    actions: ['Try the AI chat', 'Generate a content calendar', 'Create A/B test variations']
  },
  {
    id: 'content-calendar',
    page: 'Content',
    title: 'Content Calendar & Scheduling',
    description: 'Plan, schedule, and manage all your social media posts in one place. Use the calendar view or list view.',
    position: 'center',
    highlight: null,
    actions: ['Create your first post', 'View calendar', 'Set up auto-scheduling']
  },
  {
    id: 'analytics',
    page: 'AnalyticsDashboard',
    title: 'Analytics & Insights',
    description: 'Track performance metrics, engagement rates, audience growth, and revenue across all platforms.',
    position: 'center',
    highlight: null
  },
  {
    id: 'integrations',
    page: 'Integrations',
    title: 'Connect Your Tools',
    description: 'Integrate with marketing tools like Mailchimp, Salesforce, HubSpot, and more to unify your workflow.',
    position: 'center',
    highlight: null,
    actions: ['Connect social accounts', 'Add marketing integrations']
  }
];

export default function InteractiveTour({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tourSteps.length - 1;

  useEffect(() => {
    // Navigate to the page for current step
    if (step && step.page) {
      navigate(createPageUrl(step.page));
    }
  }, [currentStep, step, navigate]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsVisible(false);
    if (onComplete) {
      await onComplete();
    }
  };

  const handleSkip = async () => {
    setIsVisible(false);
    if (onSkip) {
      await onSkip();
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" />

      {/* Tour Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <Card className="w-full max-w-2xl pointer-events-auto shadow-2xl border-2 border-[#d4af37]">
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#d4af37]/10">
                  <Sparkles className="w-6 h-6 text-[#d4af37]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="text-sm text-slate-500">Step {currentStep + 1} of {tourSteps.length}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-6">
              <div
                className="bg-[#d4af37] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="space-y-4 mb-6">
              <p className="text-slate-700 leading-relaxed">{step.description}</p>

              {step.actions && step.actions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">What you can do here:</p>
                  <ul className="space-y-2">
                    {step.actions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Badge className="bg-[#d4af37]/10 text-[#d4af37] mt-0.5">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm text-slate-600">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                )}
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Skip Tour
                </Button>
              </div>

              <Button
                onClick={handleNext}
                className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]"
              >
                {isLastStep ? 'Complete Tour' : 'Next'}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}