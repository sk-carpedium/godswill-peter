import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  Info,
  ChevronRight,
  Target,
  Users,
  Clock,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ProfitabilityCard({ analysis, onOptimize }) {
  if (!analysis) return null;

  const { 
    profitability_score = 0, 
    predicted_revenue = 0, 
    revenue_confidence = 'medium',
    factors = {},
    optimal_monetization = []
  } = analysis;

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-500' };
    if (score >= 60) return { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-500' };
    if (score >= 40) return { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-500' };
    return { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-500' };
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const scoreColors = getScoreColor(profitability_score);

  const factorIcons = {
    content_quality: Target,
    engagement_rate: TrendingUp,
    timing: Clock,
    trending_topics: Hash,
    audience_demographics: Users,
  };

  return (
    <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base">AI Profitability Score</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Revenue prediction for this post</p>
            </div>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                AI analyzes your historical data, audience behavior, trending topics, and timing 
                to predict revenue potential before you publish.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center ring-4",
              scoreColors.bg,
              scoreColors.ring
            )}>
              <div className="text-center">
                <p className={cn("text-2xl font-bold", scoreColors.text)}>
                  {Math.round(profitability_score)}
                </p>
                <p className="text-[10px] text-slate-500">/ 100</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-2xl font-bold text-slate-900">
                ${predicted_revenue.toFixed(2)}
              </p>
              <Badge className={getConfidenceColor(revenue_confidence)}>
                {revenue_confidence} confidence
              </Badge>
            </div>
            <p className="text-sm text-slate-600">Predicted revenue from this post</p>
          </div>
        </div>

        {/* Status Message */}
        <div className={cn(
          "flex items-start gap-2 p-3 rounded-lg",
          profitability_score >= 70 ? "bg-emerald-50" : "bg-amber-50"
        )}>
          {profitability_score >= 70 ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-900">High revenue potential!</p>
                <p className="text-xs text-emerald-700">This content is optimized for monetization</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Room for improvement</p>
                <p className="text-xs text-amber-700">
                  {profitability_score < 50 
                    ? 'Consider optimizing for better revenue potential' 
                    : 'Good potential, can be enhanced further'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Performance Factors */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Analysis Factors
          </p>
          {Object.entries(factors).map(([key, value]) => {
            const Icon = factorIcons[key] || Target;
            const score = (value || 0) * 100;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Icon className="w-3 h-3" />
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-medium">{Math.round(score)}%</span>
                </div>
                <Progress value={score} className="h-1.5" />
              </div>
            );
          })}
        </div>

        {/* Monetization Recommendations */}
        {optimal_monetization.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">Top Monetization Methods</p>
            {optimal_monetization.slice(0, 3).map((method, i) => (
              <div 
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">
                    {method.method?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-slate-500">{method.recommendation}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    ${method.potential_revenue?.toFixed(0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant="outline" 
          className="w-full border-violet-300 hover:bg-violet-50"
          onClick={onOptimize}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Optimize for Revenue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}