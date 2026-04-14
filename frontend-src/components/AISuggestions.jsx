import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const suggestions = [
  {
    category: 'What to Post',
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50',
    items: [
      { text: 'Video content performs 3.2x better than images', priority: 'high', impact: '+320% engagement' },
      { text: 'Behind-the-scenes content drives authentic engagement', priority: 'medium', impact: '+180% engagement' },
      { text: 'User-generated content increases trust by 85%', priority: 'medium', impact: '+85% trust' },
      { text: 'Educational "how-to" posts generate high shares', priority: 'high', impact: '+240% shares' }
    ]
  },
  {
    category: 'What NOT to Post',
    icon: XCircle,
    color: 'text-red-600 bg-red-50',
    items: [
      { text: 'Avoid posting more than 3x per day - causes unfollows', priority: 'high', impact: '-15% followers' },
      { text: 'Stock photos reduce engagement by 45%', priority: 'medium', impact: '-45% engagement' },
      { text: 'Sales-heavy content without value decreases reach', priority: 'high', impact: '-30% reach' },
      { text: 'Low-quality mobile videos hurt brand perception', priority: 'medium', impact: '-25% trust' }
    ]
  },
  {
    category: 'When to Post',
    icon: Clock,
    color: 'text-blue-600 bg-blue-50',
    items: [
      { text: 'Tuesday-Thursday 9-11 AM: Peak engagement window', priority: 'high', impact: '+65% engagement' },
      { text: 'Sunday evenings (7-9 PM): Best for storytelling', priority: 'medium', impact: '+42% engagement' },
      { text: 'Avoid Monday mornings - low attention span', priority: 'medium', impact: '-35% engagement' },
      { text: 'Friday 3-5 PM: High conversion rates', priority: 'high', impact: '+55% conversions' }
    ]
  },
  {
    category: 'Content Strategy',
    icon: TrendingUp,
    color: 'text-violet-600 bg-violet-50',
    items: [
      { text: 'Use 3-5 relevant hashtags per post', priority: 'high', impact: '+70% reach' },
      { text: 'Include CTAs in every post for 2x engagement', priority: 'high', impact: '+200% engagement' },
      { text: 'Respond to comments within 1 hour for algorithm boost', priority: 'medium', impact: '+40% reach' },
      { text: 'Repurpose top content across platforms', priority: 'medium', impact: '+150% efficiency' }
    ]
  }
];

const priorityColors = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-700'
};

export default function AISuggestions() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-600" />
          <CardTitle>AI-Powered Recommendations</CardTitle>
          <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white ml-auto">
            Updated Daily
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {suggestions.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn('p-2 rounded-lg', section.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900">{section.category}</h3>
              </div>
              <div className="space-y-2 ml-2 pl-4 border-l-2 border-slate-200">
                {section.items.map((item, j) => (
                  <div key={j} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-700 flex-1">{item.text}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline" className={priorityColors[item.priority]}>
                          {item.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {item.impact}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}