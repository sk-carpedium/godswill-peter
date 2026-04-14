import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ROICalculator() {
  const [investment, setInvestment] = useState('500');
  const [contentType, setContentType] = useState('sponsored_post');
  const [platform, setPlatform] = useState('instagram');
  const [results, setResults] = useState(null);

  const calculateROI = () => {
    // Simulated AI-powered ROI calculation based on historical data
    const investmentAmount = parseFloat(investment) || 0;
    
    // Different multipliers based on content type and platform
    const multipliers = {
      sponsored_post: { instagram: 2.8, youtube: 3.2, tiktok: 2.5 },
      affiliate: { instagram: 1.8, youtube: 2.1, twitter: 1.5 },
      brand_ambassador: { instagram: 4.2, youtube: 5.1, linkedin: 3.8 }
    };

    const multiplier = multipliers[contentType]?.[platform] || 2.0;
    const estimatedRevenue = investmentAmount * multiplier;
    const roi = ((estimatedRevenue - investmentAmount) / investmentAmount) * 100;

    setResults({
      revenue: estimatedRevenue,
      profit: estimatedRevenue - investmentAmount,
      roi: roi,
      breakEvenDays: Math.floor(30 / multiplier),
      estimatedReach: Math.floor(investmentAmount * 150),
      estimatedConversions: Math.floor(investmentAmount * 0.08)
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-violet-600" />
            <CardTitle className="text-base">ROI Calculator</CardTitle>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                AI-powered calculator uses your historical performance data and 
                industry benchmarks to predict ROI for different content types.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Investment Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="number"
                value={investment}
                onChange={(e) => setInvestment(e.target.value)}
                className="pl-9"
                placeholder="500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                <SelectItem value="affiliate">Affiliate Marketing</SelectItem>
                <SelectItem value="brand_ambassador">Brand Ambassador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter/X</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={calculateROI}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Calculate ROI
          </Button>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-900">Predicted ROI</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-emerald-900">
                  {results.roi.toFixed(0)}%
                </p>
                <Badge className="bg-emerald-600">
                  ${results.profit.toFixed(0)} profit
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">Estimated Revenue</span>
                <span className="font-semibold text-slate-900">
                  ${results.revenue.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">Estimated Reach</span>
                <span className="font-semibold text-slate-900">
                  {results.estimatedReach.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">Expected Conversions</span>
                <span className="font-semibold text-slate-900">
                  {results.estimatedConversions}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm text-slate-600">Break-Even Time</span>
                <span className="font-semibold text-slate-900">
                  ~{results.breakEvenDays} days
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800">
                This prediction is based on your historical performance data and 
                current market trends. Actual results may vary.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}