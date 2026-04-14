import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Brain,
  Zap,
  TrendingDown,
  Users,
  Eye,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const _OLD_predictionHistory = [
  { 
    post: 'Summer Collection Launch',
    predicted: 2450,
    actual: 2680,
    accuracy: 109,
    date: '2024-01-10',
    platform: 'instagram'
  },
  { 
    post: 'Flash Sale Announcement',
    predicted: 1800,
    actual: 1650,
    accuracy: 92,
    date: '2024-01-08',
    platform: 'facebook'
  },
  { 
    post: 'Product Demo Video',
    predicted: 3200,
    actual: 3850,
    accuracy: 120,
    date: '2024-01-05',
    platform: 'tiktok'
  }
];

const _OLD_revenueFactors = [
  { factor: 'Content Quality', score: 92, impact: 'high' },
  { factor: 'Audience Demographics', score: 85, impact: 'high' },
  { factor: 'Posting Time', score: 78, impact: 'medium' },
  { factor: 'Platform Selection', score: 88, impact: 'high' },
  { factor: 'CTA Strength', score: 72, impact: 'medium' },
  { factor: 'Trend Alignment', score: 95, impact: 'high' }
];

const _OLD_optimizationSuggestions = [
  {
    type: 'pricing',
    title: 'Optimal Price Point',
    current: '$49',
    suggested: '$54',
    impact: '+$450 expected revenue',
    confidence: 87
  },
  {
    type: 'cta',
    title: 'Call-to-Action',
    current: 'Learn More',
    suggested: 'Shop Now - Limited Stock',
    impact: '+15% conversion rate',
    confidence: 92
  },
  {
    type: 'partner',
    title: 'Affiliate Partner',
    current: 'None',
    suggested: 'Partner with @fashioninfluencer',
    impact: '+30% reach, +$380 revenue',
    confidence: 78
  },
  {
    type: 'timing',
    title: 'Post Timing',
    current: '2:00 PM',
    suggested: '6:30 PM',
    impact: '+22% engagement',
    confidence: 94
  }
];

export default function PredictiveMonetization() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['predictive-monetization', workspaceId],
    queryFn: async () => { 
      const result = await base44.functions.invoke('predictiveMonetization', { workspace_id: workspaceId }).catch(() => ({}));
      return result;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [draftContent, setDraftContent] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const analyzeDraft = () => {
    setAnalyzing(true);
    // Real predictive analysis via backend AI
    base44.functions.invoke('predictiveMonetization', { workspace_id: workspaceId })
      .then(result => {
        if (result && Object.keys(result).length > 0) {
          setPredictionData(result);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Predictive monetization error:', err);
        setLoading(false);
      });
  };

  const avgAccuracy = predictionHistory.reduce((sum, p) => sum + p.accuracy, 0) / predictionHistory.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Predictive Monetization Engine</h1>
        <p className="text-slate-500 mt-1">AI-powered revenue predictions for your content before you publish</p>
      </div>

      {/* Prediction Accuracy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-[#d4af37]" />
              <Badge className={cn(
                avgAccuracy >= 95 ? "bg-green-100 text-green-700" : 
                avgAccuracy >= 85 ? "bg-blue-100 text-blue-700" : 
                "bg-amber-100 text-amber-700"
              )}>
                {avgAccuracy >= 95 ? 'Excellent' : avgAccuracy >= 85 ? 'Good' : 'Fair'}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">{avgAccuracy.toFixed(1)}%</p>
            <p className="text-sm text-slate-500 mt-1">Prediction Accuracy</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+$12.5K</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">$48.2K</p>
            <p className="text-sm text-slate-500 mt-1">Revenue from Optimized Posts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-blue-100 text-blue-700">42 Posts</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">38</p>
            <p className="text-sm text-slate-500 mt-1">Predictions Beat Target</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+18%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">+$8.5K</p>
            <p className="text-sm text-slate-500 mt-1">vs. Non-Optimized</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="predict" className="space-y-6">
        <TabsList>
          <TabsTrigger value="predict">Revenue Predictor</TabsTrigger>
          <TabsTrigger value="history">Prediction History</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="predict" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#d4af37]" />
                  Analyze Draft Content
                </CardTitle>
                <CardDescription>Paste your draft content to get AI-powered revenue predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Paste your draft post content here..."
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 flex-1"
                    onClick={analyzeDraft}
                    disabled={!draftContent || analyzing}
                  >
                    {analyzing ? (
                      <>
                        <Brain className="w-4 h-4 mr-2 animate-pulse" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Predict Revenue
                      </>
                    )}
                  </Button>
                </div>

                {prediction && (
                  <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-[#d4af37]/10 to-amber-50 border-2 border-[#d4af37]/30">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">Predicted Revenue</h3>
                        <p className="text-3xl font-bold text-[#d4af37]">${prediction.revenue.toLocaleString()}</p>
                      </div>
                      <Badge className="bg-[#d4af37] text-slate-950">
                        {prediction.confidence}% Confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Expected Engagement</p>
                        <p className="text-lg font-semibold text-slate-900">{prediction.engagement.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Predicted Reach</p>
                        <p className="text-lg font-semibold text-slate-900">{(prediction.reach / 1000).toFixed(1)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 mb-1">Conversion Rate</p>
                        <p className="text-lg font-semibold text-slate-900">{prediction.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Optimization Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {prediction ? (
                  <>
                    {optimizationSuggestions.map((suggestion, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 hover:border-[#d4af37]/30 transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm text-slate-900">{suggestion.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.confidence}%
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          Current: <span className="font-medium">{suggestion.current}</span>
                        </p>
                        <p className="text-xs text-green-700 mb-2 font-medium">
                          → {suggestion.suggested}
                        </p>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {suggestion.impact}
                        </Badge>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Analyze content to see recommendations
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {prediction && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Factor Analysis</CardTitle>
                <CardDescription>What's driving your predicted revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={[
                    { factor: 'Content Quality', score: prediction.factors.contentQuality },
                    { factor: 'Audience Match', score: prediction.factors.audienceMatch },
                    { factor: 'Timing', score: prediction.factors.timing },
                    { factor: 'Trend Alignment', score: prediction.factors.trendAlignment },
                    { factor: 'Competitive Edge', score: prediction.factors.competitorBenchmark }
                  ]}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="factor" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Radar dataKey="score" stroke="#d4af37" fill="#d4af37" fillOpacity={0.5} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Prediction Performance</CardTitle>
                  <CardDescription>Track prediction accuracy over time</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {avgAccuracy.toFixed(0)}% Avg Accuracy
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictionHistory.map((item, i) => (
                  <div key={i} className="p-4 rounded-lg border border-slate-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{item.post}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Badge variant="outline">{item.platform}</Badge>
                          <span>{moment(item.date).format('MMM D, YYYY')}</span>
                        </div>
                      </div>
                      <Badge className={cn(
                        item.accuracy >= 100 ? "bg-green-100 text-green-700" :
                        item.accuracy >= 90 ? "bg-blue-100 text-blue-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {item.accuracy}% Accurate
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Predicted</p>
                        <p className="text-lg font-semibold text-slate-900">${item.predicted}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Actual</p>
                        <p className="text-lg font-semibold text-slate-900">${item.actual}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Difference</p>
                        <div className="flex items-center gap-1">
                          {item.actual > item.predicted ? (
                            <>
                              <ArrowUpRight className="w-4 h-4 text-green-600" />
                              <p className="text-lg font-semibold text-green-600">
                                +${item.actual - item.predicted}
                              </p>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-4 h-4 text-amber-600" />
                              <p className="text-lg font-semibold text-amber-600">
                                -${item.predicted - item.actual}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Optimal Posting Times</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Posts published between 6-8 PM generate 42% more revenue on average. Our AI has identified this as your audience's peak buying window.
                    </p>
                    <Badge className="bg-[#d4af37]/20 text-[#d4af37]">High Impact</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Price Point Optimization</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Products priced between $45-$60 have the highest conversion rate (7.2%) for your audience. Consider adjusting pricing strategy.
                    </p>
                    <Badge className="bg-blue-100 text-blue-700">Medium Impact</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">Audience Segments</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Your 25-34 age demographic generates 3x more revenue per post. Consider creating more content tailored to this segment.
                    </p>
                    <Badge className="bg-purple-100 text-purple-700">High Impact</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-2">CTA Effectiveness</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      Posts with urgency-based CTAs ("Limited Time", "Only Today") convert 28% better than generic ones. Update your CTA strategy.
                    </p>
                    <Badge className="bg-amber-100 text-amber-700">Medium Impact</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}