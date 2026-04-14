import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Headphones, TrendingUp, Users, Play, ExternalLink, RefreshCw, Mic } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const _OLD_mockStats = [
  { label: 'Monthly Listeners', value: '48.2K', change: '+9.3%', positive: true, icon: Headphones },
  { label: 'Followers', value: '12.4K', change: '+4.1%', positive: true, icon: Users },
  { label: 'Streams This Month', value: '284K', change: '+18.7%', positive: true, icon: Play },
  { label: 'Podcasts', value: '3', change: '0', positive: true, icon: Mic },
];

const _OLD_mockTracks = [
  { title: 'Brand Story Podcast Ep. 12', type: 'podcast', streams: 18420, duration: '42:10' },
  { title: 'Summer Campaign Playlist', type: 'playlist', streams: 9840, duration: '1:12:30' },
  { title: 'Behind the Brand Ep. 8', type: 'podcast', streams: 7210, duration: '38:55' },
  { title: 'Product Launch Soundtrack', type: 'playlist', streams: 5930, duration: '52:20' },
];

export default function Spotify() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData, isLoading } = useQuery({
    queryKey: ['spotify-data', workspaceId],
    queryFn: async () => { 
      const [integration, analytics] = await Promise.all([
        base44.entities.Integration.filter({ workspace_id: workspaceId, integration_type: 'spotify' }).then(r => r[0] || null),
        base44.entities.Analytics.filter({ workspace_id: workspaceId, platform: 'spotify', period: '30d' }),
      ]);
      const totalStreams   = analytics.reduce((s,r) => s+(r.streams||r.reach||0), 0);
      const totalListeners = analytics.reduce((s,r) => s+(r.unique_listeners||0), 0);
      return {
        connected: !!integration,
        stats: [
          { label: 'Monthly Listeners', value: totalListeners.toLocaleString() || '—', change: '', positive: true },
          { label: 'Streams',           value: totalStreams.toLocaleString()    || '—', change: '', positive: true },
          { label: 'Followers',         value: integration?.settings?.follower_count?.toString() || '—', change: '', positive: true },
          { label: 'Status',            value: integration?.status || 'disconnected', change: '', positive: !!integration },
        ],
        tracks: integration?.settings?.top_tracks || [],
      };
         },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['spotify-integration', workspaceId],
    queryFn: async () => { 
      const integration = await base44.entities.Integration.filter({ workspace_id: workspaceId, integration_type: 'spotify' }).then(r => r[0] || null);
      return integration;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    base44.entities.Analytics.sync({ platform: 'spotify' })
      .catch(() => null)
      .finally(() => setSyncing(false));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1DB954]/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1DB954">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Spotify for Artists</h1>
            <p className="text-slate-500">Manage podcasts, playlists, and audience insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-[#1DB954]/10 text-[#1DB954] border-0">Connected</Badge>
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync
          </Button>
          <Button size="sm" className="bg-[#1DB954] hover:bg-[#1aa34a] text-white" asChild>
            <a href="https://artists.spotify.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Dashboard
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(_apiData?.stats || []).map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className={`text-xs font-medium mt-1 ${stat.positive ? 'text-green-600' : 'text-red-500'}`}>
                      {stat.change} this month
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-[#1DB954]/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#1DB954]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#1DB954]" />
            Top Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(_apiData?.tracks || []).map((track) => (
              <div key={track.title} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1DB954]/10 flex items-center justify-center">
                    {track.type === 'podcast' ? <Mic className="w-4 h-4 text-[#1DB954]" /> : <Music className="w-4 h-4 text-[#1DB954]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{track.title}</p>
                    <p className="text-xs text-slate-500">{track.streams.toLocaleString()} streams · {track.duration}</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className={track.type === 'podcast' ? 'bg-purple-100 text-purple-700 border-0' : 'bg-[#1DB954]/10 text-[#1DB954] border-0'}
                >
                  {track.type === 'podcast' ? 'Podcast' : 'Playlist'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Audience Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1DB954]" />
            Audience Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Top Country', value: 'United States', sub: '38% of listeners' },
              { label: 'Top Age Group', value: '25–34', sub: '42% of listeners' },
              { label: 'Top City', value: 'New York', sub: '12% of listeners' },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-lg border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className="text-base font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-[#1DB954] font-medium mt-0.5">{item.sub}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}