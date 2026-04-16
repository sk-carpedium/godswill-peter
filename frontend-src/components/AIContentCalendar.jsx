import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Sparkles, TrendingUp, Clock, Zap, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const _OLD_aiSuggestions = [
  { id: '1', date: '2026-01-13', time: '10:00 AM', type: 'Best Time', content: 'Share industry insights or thought leadership', reason: 'High engagement window based on your audience', score: 95, platforms: ['linkedin', 'twitter'] },
  { id: '2', date: '2026-01-14', time: '2:00 PM', type: 'Trending Topic', content: 'Join #TechTuesday conversation', reason: 'Trending in your industry with 15K+ mentions', score: 88, platforms: ['twitter', 'instagram'] },
  { id: '3', date: '2026-01-15', time: '6:00 PM', type: 'Optimal Post', content: 'Behind-the-scenes content or team spotlight', reason: 'Visual content performs 3x better at this time', score: 92, platforms: ['instagram', 'facebook'] },
];

const _OLD_existingPosts = [
  { id: '1', date: '2026-01-12', time: '9:00 AM', title: 'Product Update', platforms: ['twitter'], status: 'scheduled' },
  { id: '2', date: '2026-01-14', time: '3:00 PM', title: 'Customer Success Story', platforms: ['linkedin'], status: 'scheduled' },
];

export default function AIContentCalendar() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['ai-calendar', workspaceId],
    queryFn: async () => { 
      const posts = await api.entities.Post.filter({ workspace_id: workspaceId, sort: 'scheduled_at', limit: 50 });
      const suggestions = await api.integrations.Core.InvokeLLM({
        prompt: 'Generate 5 content ideas for the next week based on trending topics. Return JSON array of {date, platform, type, topic, caption, hashtags}.',
        response_json_schema: { type:'object', properties:{ suggestions: { type:'array' } } }
      }).catch(() => ({ suggestions: [] }));
      return { posts, suggestions: suggestions.suggestions || [] };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [currentDate, setCurrentDate] = useState(moment());
  const [viewMode, setViewMode] = useState('week');

  const weekDays = Array.from({ length: 7 }, (_, i) => moment(currentDate).startOf('week').add(i, 'days'));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Content Calendar</h1>
            <p className="text-slate-500">Smart scheduling with AI-powered recommendations</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-violet-600" />
              <p className="text-sm font-medium text-slate-600">AI Suggestions</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{aiSuggestions.length}</p>
            <p className="text-sm text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-slate-600">Scheduled</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">{existingPosts.length}</p>
            <p className="text-sm text-slate-500 mt-1">Ready to publish</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium text-slate-600">Optimal Times</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">12</p>
            <p className="text-sm text-slate-500 mt-1">Identified</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <p className="text-sm font-medium text-slate-600">Coverage</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">85%</p>
            <p className="text-sm text-slate-500 mt-1">This week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Weekly Schedule</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(moment(currentDate).subtract(1, 'week'))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium px-4">{currentDate.format('MMMM YYYY')}</span>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(moment(currentDate).add(1, 'week'))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => {
              const dayStr = day.format('YYYY-MM-DD');
              const suggestions = aiSuggestions.filter(s => s.date === dayStr);
              const posts = existingPosts.filter(p => p.date === dayStr);
              const isToday = day.isSame(moment(), 'day');

              return (
                <div key={i} className={cn("min-h-[300px] rounded-lg border-2 p-3", isToday ? "border-violet-300 bg-violet-50" : "border-slate-200")}>
                  <div className="text-center mb-3">
                    <p className="text-xs font-medium text-slate-500">{day.format('ddd')}</p>
                    <p className={cn("text-2xl font-bold", isToday ? "text-violet-600" : "text-slate-900")}>{day.format('D')}</p>
                  </div>

                  <div className="space-y-2">
                    {posts.map(post => (
                      <div key={post.id} className="p-2 rounded bg-blue-100 border border-blue-200">
                        <p className="text-xs font-medium text-blue-900">{post.time}</p>
                        <p className="text-xs text-blue-700 mt-1">{post.title}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">Scheduled</Badge>
                      </div>
                    ))}

                    {suggestions.map(suggestion => (
                      <div key={suggestion.id} className="p-2 rounded bg-violet-100 border border-violet-200">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-violet-600" />
                          <p className="text-xs font-medium text-violet-900">{suggestion.time}</p>
                        </div>
                        <p className="text-xs text-violet-700">{suggestion.content}</p>
                        <Badge variant="secondary" className="mt-1 text-xs bg-violet-200 text-violet-700">AI: {suggestion.score}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiSuggestions.map(suggestion => (
              <div key={suggestion.id} className="flex items-start gap-4 p-4 rounded-lg border-2 border-violet-200 bg-violet-50/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-violet-600">{suggestion.type}</Badge>
                    <Badge variant="secondary">Score: {suggestion.score}</Badge>
                    <span className="text-sm text-slate-500">{moment(suggestion.date).format('MMM D')} at {suggestion.time}</span>
                  </div>
                  <p className="font-medium text-slate-900 mb-1">{suggestion.content}</p>
                  <p className="text-sm text-slate-600 mb-3">{suggestion.reason}</p>
                  <div className="flex gap-2">
                    {suggestion.platforms.map(p => (
                      <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-3 h-3 mr-1" />
                  Schedule
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}