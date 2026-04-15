import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Smile, Frown, Meh } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SentimentChart({ mentions = [], workspaceId }) {
  // Calculate sentiment data from real mentions
  const sentimentData = React.useMemo(() => {
    if (mentions.length === 0) {
      return Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        positive: 150,
        neutral: 100,
        negative: 20,
      }));
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date, i) => {
      const dayMentions = mentions.filter(m => 
        m.mentioned_at?.startsWith(date) || new Date(m.mentioned_at).toISOString().split('T')[0] === date
      );

      return {
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        positive: dayMentions.filter(m => m.sentiment === 'positive').length,
        neutral: dayMentions.filter(m => m.sentiment === 'neutral').length,
        negative: dayMentions.filter(m => m.sentiment === 'negative').length,
      };
    });
  }, [mentions]);

  const pieData = React.useMemo(() => {
    if (mentions.length === 0) {
      return [
        { name: 'Positive', value: 68, color: '#10b981' },
        { name: 'Neutral', value: 22, color: '#64748b' },
        { name: 'Negative', value: 10, color: '#ef4444' },
      ];
    }

    const total = mentions.length;
    const positive = mentions.filter(m => m.sentiment === 'positive').length;
    const neutral = mentions.filter(m => m.sentiment === 'neutral').length;
    const negative = mentions.filter(m => m.sentiment === 'negative').length;

    return [
      { name: 'Positive', value: Math.round((positive / total) * 100), color: '#10b981' },
      { name: 'Neutral', value: Math.round((neutral / total) * 100), color: '#64748b' },
      { name: 'Negative', value: Math.round((negative / total) * 100), color: '#ef4444' },
    ];
  }, [mentions]);

  const stats = React.useMemo(() => {
    const positive = mentions.filter(m => m.sentiment === 'positive').length;
    const neutral = mentions.filter(m => m.sentiment === 'neutral').length;
    const negative = mentions.filter(m => m.sentiment === 'negative').length;

    return { positive, neutral, negative };
  }, [mentions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Sentiment Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#64748b" fill="#64748b" fillOpacity={0.6} />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sentiment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>

            {mentions.length > 0 && (
              <div className="mt-4 p-3 bg-[#d4af37]/10 rounded-lg">
                <p className="text-xs text-slate-600 font-medium">
                  Based on {mentions.length} real mentions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-green-600" />
                <span className="text-sm text-slate-600">Positive</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{stats.positive}</p>
                <p className="text-xs text-green-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+12%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Meh className="w-5 h-5 text-slate-600" />
                <span className="text-sm text-slate-600">Neutral</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{stats.neutral}</p>
                <p className="text-xs text-slate-500">±0%</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Frown className="w-5 h-5 text-red-600" />
                <span className="text-sm text-slate-600">Negative</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">{stats.negative}</p>
                <p className="text-xs text-red-600 flex items-center gap-1"><TrendingDown className="w-3 h-3" />-5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}