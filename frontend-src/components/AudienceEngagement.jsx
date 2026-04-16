import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Users, MapPin, Clock, Smartphone } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


export default function AudienceEngagement({ platformName, platformColor = 'violet' }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['audience-engagement', workspaceId],
    queryFn: async () => { 
      const hourly = await api.entities.Analytics.filter({ workspace_id: workspaceId, period: '30d', group_by: 'hour' });
      // Build 7x24 heatmap grid
      const grid = Array.from({length:7}, () => Array.from({length:24}, () => 0));
      if (Array.isArray(hourly)) {
        hourly.forEach(r => { const h = r.hour||0; if (h<24) { const day = new Date(r.date||Date.now()).getDay(); grid[day][h] += r.engagement||0; } });
      }
      return grid;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const demographics = [
    { age: '18-24', percentage: 28, color: 'bg-violet-500' },
    { age: '25-34', percentage: 45, color: 'bg-indigo-500' },
    { age: '35-44', percentage: 18, color: 'bg-blue-500' },
    { age: '45+', percentage: 9, color: 'bg-slate-500' },
  ];

  const locations = [
    { city: 'New York, USA', percentage: 24 },
    { city: 'London, UK', percentage: 18 },
    { city: 'Toronto, Canada', percentage: 15 },
    { city: 'Sydney, Australia', percentage: 12 },
  ];

  const topFollowers = [
    { name: 'Sarah Miller', followers: '125K', engagement: 'High' },
    { name: 'James Wilson', followers: '98K', engagement: 'High' },
    { name: 'Emma Davis', followers: '76K', engagement: 'Medium' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Audience Demographics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Age Distribution</h4>
              {demographics.map((demo, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{demo.age} years</span>
                    <span className="font-medium">{demo.percentage}%</span>
                  </div>
                  <Progress value={demo.percentage} className="h-2" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Gender Split</h4>
              <div className="flex gap-4">
                <div className="flex-1 p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-2xl font-bold text-blue-700">58%</p>
                  <p className="text-sm text-blue-600">Female</p>
                </div>
                <div className="flex-1 p-4 rounded-lg bg-violet-50 border border-violet-200">
                  <p className="text-2xl font-bold text-violet-700">42%</p>
                  <p className="text-sm text-violet-600">Male</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Best Times to Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-slate-500 mb-2">{day}</p>
                  <div className="space-y-1">
                    {[9, 12, 18, 21].map((hour, j) => (
                      <div key={j} className={`h-6 rounded ${(_apiData && _apiData[i] && _apiData[i][j] > 0) ? "bg-violet-500" : "bg-slate-200"}`} title={`${hour}:00`} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-violet-500" />
                <span className="text-slate-600">High engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-200" />
                <span className="text-slate-600">Low engagement</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Top Locations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {locations.map((loc, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{loc.city}</span>
                <Badge variant="secondary">{loc.percentage}%</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Top Followers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topFollowers.map((follower, i) => (
              <div key={i} className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-violet-100 text-violet-600">{follower.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">{follower.name}</p>
                  <p className="text-xs text-slate-500">{follower.followers} followers</p>
                </div>
                <Badge variant="secondary" className={follower.engagement === 'High' ? 'bg-green-100 text-green-700' : ''}>{follower.engagement}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Device Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Mobile</span>
              <span className="font-medium">72%</span>
            </div>
            <Progress value={72} className="h-2" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Desktop</span>
              <span className="font-medium">28%</span>
            </div>
            <Progress value={28} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}