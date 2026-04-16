import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Sparkles,
  Calendar,
  BarChart3,
  MessageSquare,
  Zap,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to SocialHub',
    description: 'Your AI-powered social media command center',
    icon: Sparkles,
    gradient: 'from-purple-500 to-pink-500',
    content: (
      <div className="space-y-6">
        <div className="relative w-32 h-32 mx-auto">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/21753122d_image.png" 
            alt="Nexus Social Logo" 
            className="w-32 h-32 object-contain animate-pulse"
          />
        </div>
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Let's Get Started
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            In just 3 minutes, you'll learn how to harness the power of AI to revolutionize your social media strategy.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-100 dark:border-blue-900">
            <Calendar className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Content</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900">
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Analytics</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-100 dark:border-green-900">
            <MessageSquare className="w-8 h-8 text-green-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Smart Inbox</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-100 dark:border-orange-900">
            <Zap className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Automation</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'ai-content',
    title: 'AI Content Generation',
    description: 'Create engaging content in seconds with AI',
    icon: Calendar,
    gradient: 'from-blue-500 to-cyan-500',
    content: (
      <div className="space-y-6">
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">Simply tell the AI what you want:</p>
                <div className="inline-block px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm">
                  "Create a post about our new product launch"
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Generate posts instantly</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">AI creates optimized content for each platform</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Smart scheduling</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Post at the perfect time for maximum engagement</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Multi-platform ready</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically adapted for Instagram, Twitter, LinkedIn & more</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Get actionable insights powered by AI',
    icon: BarChart3,
    gradient: 'from-purple-500 to-pink-500',
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">+247%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Engagement</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">2.4M</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Reach</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">8.2%</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">Growth</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">AI-powered insights</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Get recommendations on what content performs best</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Predictive analytics</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Know which posts will go viral before you publish</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Real-time monitoring</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Track performance across all platforms in one place</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'inbox',
    title: 'Smart Inbox',
    description: 'Manage all conversations in one place',
    icon: MessageSquare,
    gradient: 'from-green-500 to-emerald-500',
    content: (
      <div className="space-y-6">
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
              JD
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">John Doe</p>
              <p className="text-xs text-slate-500">Instagram • 2m ago</p>
            </div>
            <div className="px-2 py-1 rounded-full bg-green-500 text-white text-xs">New</div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            "Love your latest post! When will this product be available?"
          </p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Reply
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Reply
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Unified inbox</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">All messages from every platform in one place</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">AI-suggested replies</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Smart responses generated instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Priority sorting</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Important messages highlighted automatically</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'automation',
    title: 'Smart Automation',
    description: 'Automate repetitive tasks with AI',
    icon: Zap,
    gradient: 'from-orange-500 to-amber-500',
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800">
            <Zap className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">Auto-posting</p>
            <p className="text-xs text-slate-500 mt-1">Schedule posts to publish automatically</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800">
            <Sparkles className="w-8 h-8 text-orange-600 mb-2" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">Smart replies</p>
            <p className="text-xs text-slate-500 mt-1">AI responds to common questions</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Workflow automation</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Set up triggers and actions to automate tasks</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Smart scheduling</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">AI finds the best time to post for your audience</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Content recycling</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically repost top-performing evergreen content</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'ready',
    title: 'You\'re All Set!',
    description: 'Time to supercharge your social media',
    icon: Rocket,
    gradient: 'from-green-500 to-emerald-500',
    content: (
      <div className="space-y-6 text-center">
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <Rocket className="w-16 h-16 text-white" />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Ready to Launch!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            You're now equipped with everything you need to dominate social media. Let's create your first AI-powered post!
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Quick Tips:</p>
            <ul className="text-left text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Connect your social accounts in Settings</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Try the AI Assistant for instant help</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Look for the <Sparkles className="w-3 h-3 inline text-[#d4af37]" /> icon for AI features</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleComplete = async () => {
    try {
      await api.auth.updateMe({ onboarding_completed: true });
      navigate('/Dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
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

  const handleSkip = () => {
    handleComplete();
  };

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69630c5321dd411923f5e524/fe677119b_image.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain animate-pulse"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              SocialHub
            </span>
          </div>
          <Progress value={progress} className="h-2 bg-slate-200 dark:bg-slate-800" />
          <p className="text-xs text-slate-500 mt-2">
            Step {currentStep + 1} of {onboardingSteps.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-8 lg:p-12 shadow-2xl"
          >
            <div className="mb-8 text-center">
              <div className={cn(
                "inline-flex w-16 h-16 rounded-2xl mb-4 items-center justify-center bg-gradient-to-br",
                `from-${step.gradient.split(' ')[0].replace('from-', '')} to-${step.gradient.split(' ')[1].replace('to-', '')}`
              )}>
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {step.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {step.description}
              </p>
            </div>

            {step.content}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Skip Tour
          </Button>

          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-[#d4af37] to-[#f4cf47] hover:from-[#c49f2f] hover:to-[#e4bf37] text-slate-950 shadow-lg shadow-[#d4af37]/20 gap-2"
          >
            <span>{currentStep === onboardingSteps.length - 1 ? 'Get Started' : 'Next'}</span>
            {currentStep === onboardingSteps.length - 1 ? (
              <Rocket className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}