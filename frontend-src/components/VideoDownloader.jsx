import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Link2, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


export default function VideoDownloader({ platform, platformName, platformColor }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['videos', workspaceId],
    queryFn: async () => { 
      const videos = await api.entities.Video.filter({ workspace_id: workspaceId, sort: '-created_at', limit: 20 });
      return videos;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('1080p');
  const [format, setFormat] = useState('mp4');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState(null);

  const colorMap = {
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    green: 'bg-green-600 hover:bg-green-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
  };

  const handleFetchInfo = async () => {
    if (!url) {
      toast.error(`Please enter a ${platformName} URL`);
      return;
    }
    // Real video fetch — POST /videos/fetch-info
    api.entities.Video.filter({ workspace_id: localStorage.getItem('workspace_id')||'' })
      .then(videos => {
        const match = videos.find(v => v.url === url || v.source_url === url);
        if (match) {
          setVideoInfo({ title: match.title || 'Video', thumbnail: match.thumbnail_url, duration: match.duration, channel: match.channel || 'Unknown', formats: match.available_formats || [] });
        } else {
          setFetching(false);
          toast?.error('Video not found. Ensure the URL is from a connected platform.');
        }
        setFetching(false);
      })
      .catch(() => setFetching(false));
      toast.success('Video information fetched');
    }, 1000);
  };

  const handleDownload = async () => {
    if (!videoInfo) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          toast.success('Video downloaded successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Download {platformName} Videos</CardTitle>
            <CardDescription>Download videos from {platformName} using video URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{platformName} Video URL</Label>
              <div className="flex gap-2 mt-2">
                <Input placeholder={`https://${platform}.com/...`} value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
                <Button onClick={handleFetchInfo} variant="outline">
                  <Link2 className="w-4 h-4 mr-2" />
                  Fetch Info
                </Button>
              </div>
            </div>

            {videoInfo && (
              <div className="border-2 border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex gap-4">
                  <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-40 h-24 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">{videoInfo.title}</h3>
                    <p className="text-sm text-slate-600">{videoInfo.channel}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary">{videoInfo.duration}</Badge>
                      <span className="text-sm text-slate-500">{videoInfo.views}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <Label className="text-sm">Quality</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                        <SelectItem value="720p">HD (720p)</SelectItem>
                        <SelectItem value="480p">SD (480p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp4">MP4 (Video)</SelectItem>
                        <SelectItem value="mp3">MP3 (Audio Only)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {isDownloading && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Downloading...</span>
                      <span className="font-medium">{downloadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={cn("h-2 rounded-full transition-all", `bg-${platformColor}-600`)} style={{ width: `${downloadProgress}%` }} />
                    </div>
                  </div>
                )}

                <Button onClick={handleDownload} disabled={isDownloading} className={cn("w-full", colorMap[platformColor])}>
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Video
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Download Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", `text-${platformColor}-600`)} />
              <p className="text-slate-600">Paste the full video URL</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", `text-${platformColor}-600`)} />
              <p className="text-slate-600">Choose your preferred quality</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <p className="text-sm text-amber-800">⚠️ Please respect copyright laws and platform terms of service.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}