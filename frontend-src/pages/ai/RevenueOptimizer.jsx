import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  Target,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RevenueOptimizer({ postContent, platforms = [] }) {
  const [analysis, setAnalysis] = useState({
    revenueScore: 78,
    predictedRevenue: 2450,
    confidence: 89,
    strategies: [
      {
        type: 'affiliate',
        title: 'Add Affiliate Links',
        impact: '+$380 expected',
        difficulty: 'easy',
        priority: 'high',
        action: 'Add 2-3 relevant product links with tracking'
      },
      {
        type: 'sponsored',
        title: 'Tag Brand Partner',
        impact: '+$250 expected',
        difficulty: 'medium',
        priority: 'high',
        action: 'Reach out to @fashionbrand for collaboration'
      },
      {
        type: 'pricing',
        title: 'Optimize CTA Price Point',
        impact: '+15% conversion',
        difficulty: 'easy',
        priority: 'medium',
        action: 'Change from $49 to $54 based on audience data'
      },
      {
        type: 'upsell',
        title: 'Add Product Bundle',
        impact: '+$180 expected',
        difficulty: 'medium',
        priority: 'medium',
        action: 'Promote bundle offer in first comment'
      }
    ],
    dealRecommendations: [
      { brand: '@luxurylifestyle', fit: 92, avgPayout: '$500-800' },
      { brand: '@ecofashion', fit: 88, avgPayout: '$350-600' }
    ]
  });

  return (
    <Card className="border-2 border-[#d4af37]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            Revenue Optimization
          </CardTitle>
          <Badge className="bg-[#d4af37]/20 text-[#d4af37]">
            {analysis.confidence}% Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Revenue Score */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-[#d4af37]/10 to-amber-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-slate-600 mb-1">Predicted Revenue</p>
              <p className="text-3xl font-bold text-[#d4af37]">${analysis.predictedRevenue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-slate-900">{analysis.revenueScore}</div>
              <p className="text-xs text-slate-500">Revenue Score</p>
            </div>
          </div>
          <Progress value={analysis.revenueScore} className="h-2" />
        </div>

        {/* Monetization Strategies */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-3">AI-Recommended Strategies</h4>
          <div className="space-y-2">
            {analysis.strategies.map((strategy, i) => (
              <div 
                key={i}
                className={cn(
                  "p-3 rounded-lg border transition-all hover:border-[#d4af37]/50",
                  strategy.priority === 'high' ? "border-[#d4af37]/30 bg-[#d4af37]/5" : "border-slate-200"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm text-slate-900">{strategy.title}</h5>
                      <Badge variant="outline" className="text-xs capitalize">
                        {strategy.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{strategy.action}</p>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    strategy.priority === 'high' ? "bg-[#d4af37] text-slate-950" : "bg-blue-100 text-blue-700"
                  )}>
                    {strategy.impact}
                  </Badge>
                </div>
                <Button size="sm" className="w-full mt-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                  <Zap className="w-3 h-3 mr-2" />
                  Apply Strategy
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Deal Matches */}
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Recommended Brand Partnerships</h4>
          <div className="space-y-2">
            {analysis.dealRecommendations.map((deal, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-[#d4af37]/30 transition-all">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200" />
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{deal.brand}</p>
                    <p className="text-xs text-slate-500">{deal.avgPayout} avg payout</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  {deal.fit}% Match
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}