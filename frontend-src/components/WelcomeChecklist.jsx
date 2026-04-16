import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  X,
  Sparkles,
  Link as LinkIcon,
  Calendar,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';


const checklistItems = [
  {
    id: 'connect_account',
    title: 'Connect your first social account',
    description: 'Link Instagram, Twitter, or any platform',
    icon: LinkIcon,
    link: 'Settings',
    points: 30
  },
  {
    id: 'create_post',
    title: 'Create your first AI post',
    description: 'Let AI generate engaging content',
    icon: Calendar,
    link: 'Content',
    points: 25
  },
  {
    id: 'view_analytics',
    title: 'Check your analytics',
    description: 'Understand your performance',
    icon: BarChart3,
    link: 'AdvancedAnalytics',
    points: 20
  },
  {
    id: 'try_ai_assistant',
    title: 'Chat with AI Assistant',
    description: 'Get instant help and recommendations',
    icon: Sparkles,
    link: 'AIAssistant',
    points: 25
  }
];

export function WelcomeChecklist() {
  const [isVisible, setIsVisible] = useState(true);
  const [completedItems, setCompletedItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);
      setCompletedItems(userData.checklist_completed || []);
      
      // Hide if user dismissed it
      if (userData.checklist_dismissed) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const handleDismiss = async () => {
    try {
      await api.auth.updateMe({ checklist_dismissed: true });
      setIsVisible(false);
    } catch (error) {
      console.error('Error dismissing checklist:', error);
    }
  };

  const markComplete = async (itemId) => {
    const updated = [...completedItems, itemId];
    setCompletedItems(updated);
    try {
      await api.auth.updateMe({ checklist_completed: updated });
    } catch (error) {
      console.error('Error updating checklist:', error);
    }
  };

  if (!isVisible) return null;

  const completionPercentage = (completedItems.length / checklistItems.length) * 100;
  const totalPoints = checklistItems.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = checklistItems
    .filter(item => completedItems.includes(item.id))
    .reduce((sum, item) => sum + item.points, 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50 border-slate-200/50 dark:border-slate-800/50 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#f4cf47] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <CardTitle className="text-lg">Get Started with SocialHub</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Complete tasks to unlock the full potential
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDismiss}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  {completedItems.length} of {checklistItems.length} completed
                </span>
                <span className="font-semibold text-[#d4af37]">
                  {earnedPoints}/{totalPoints} points
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <div className="space-y-2">
              {checklistItems.map((item) => {
                const isCompleted = completedItems.includes(item.id);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    to={createPageUrl(item.link)}
                    onClick={() => !isCompleted && markComplete(item.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      isCompleted
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#d4af37]/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          "font-medium text-sm",
                          isCompleted && "line-through text-slate-500"
                        )}>
                          {item.title}
                        </h4>
                        <span className="text-xs text-[#d4af37] font-semibold">
                          +{item.points}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}