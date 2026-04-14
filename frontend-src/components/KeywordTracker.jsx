import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, TrendingDown, Hash, Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const keywords = [
  { id: '1', keyword: 'YourBrand', category: 'brand', mentions_today: 245, total_mentions: 8920, avg_sentiment: 0.7, trending_score: 85, alert_enabled: true, platforms: ['twitter', 'instagram', 'linkedin'] },
  { id: '2', keyword: 'AI automation', category: 'industry', mentions_today: 1820, total_mentions: 45200, avg_sentiment: 0.4, trending_score: 92, alert_enabled: true, platforms: ['twitter', 'linkedin'] },
  { id: '3', keyword: 'social media management', category: 'industry', mentions_today: 892, total_mentions: 28400, avg_sentiment: 0.3, trending_score: 68, alert_enabled: false, platforms: ['twitter', 'facebook', 'linkedin'] },
  { id: '4', keyword: 'CompetitorX', category: 'competitor', mentions_today: 156, total_mentions: 6230, avg_sentiment: 0.5, trending_score: 45, alert_enabled: true, platforms: ['twitter', 'instagram'] },
];

const categoryColors = {
  brand: 'bg-violet-100 text-violet-700',
  industry: 'bg-blue-100 text-blue-700',
  competitor: 'bg-orange-100 text-orange-700',
  campaign: 'bg-green-100 text-green-700',
};

export default function KeywordTracker() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tracked Keywords</h3>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />Add Keyword
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-violet-300 bg-violet-50/30">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input placeholder="Enter keyword or phrase..." className="flex-1" />
              <Button onClick={() => { toast.success('Keyword added!'); setShowAddForm(false); }}>Add</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {keywords.map((kw) => (
          <Card key={kw.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-slate-400" />
                  <h4 className="font-semibold text-slate-900">{kw.keyword}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={categoryColors[kw.category]}>{kw.category}</Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {kw.alert_enabled ? <Bell className="w-4 h-4 text-violet-600" /> : <BellOff className="w-4 h-4 text-slate-400" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Today</p>
                  <p className="text-2xl font-bold text-slate-900">{kw.mentions_today}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{kw.total_mentions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Sentiment</p>
                  <div className="flex items-center gap-1">
                    <p className={cn("text-2xl font-bold", kw.avg_sentiment > 0 ? "text-green-600" : kw.avg_sentiment < 0 ? "text-red-600" : "text-slate-600")}>
                      {(kw.avg_sentiment * 100).toFixed(0)}
                    </p>
                    <span className="text-xs">%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Trending Score</span>
                  <div className="flex items-center gap-1">
                    {kw.trending_score > 70 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-slate-400" />}
                    <span className="font-medium">{kw.trending_score}/100</span>
                  </div>
                </div>
                <Progress value={kw.trending_score} className="h-2" />
              </div>

              <div className="flex items-center gap-2 mt-4">
                {kw.platforms.map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">{platform}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}