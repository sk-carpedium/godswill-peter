import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Bell, Clock, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const platforms = [
  { id: 'youtube', name: 'YouTube', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  { id: 'twitch', name: 'Twitch', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg> },
  { id: 'kick', name: 'Kick', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.45 3.73L12 11.63 4.55 7.91 12 4.18zM4 9.68l7 3.5v7.64l-7-3.5V9.68zm9 11.14v-7.64l7-3.5v7.64l-7 3.5z"/></svg> },
  { id: 'rumble', name: 'Rumble', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> },
  { id: 'instagram', name: 'Instagram', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg> },
  { id: 'facebook', name: 'Facebook', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { id: 'twitter', name: 'Twitter/X', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  { id: 'tiktok', name: 'TikTok', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  { id: 'pinterest', name: 'Pinterest', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg> },
  { id: 'threads', name: 'Threads', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.129-.73-1.818-1.857-1.818-3.336 0-1.501.697-2.748 1.98-3.549.932-.582 2.106-.873 3.408-.846.896.017 1.727.178 2.508.488v-.695c0-1.173-.394-2.02-1.174-2.522-.651-.418-1.527-.59-2.612-.518-1.256.085-2.29.423-3.074.998l-.546-1.938c.968-.684 2.297-1.134 3.952-1.243 1.443-.097 2.718.13 3.796.676 1.326.672 2.015 1.854 2.048 3.512v2.254c1.175.584 2.09 1.428 2.697 2.49.739 1.29.883 3.008-.235 4.855-1.26 2.082-3.5 3.136-6.848 3.213z"/></svg> },
  { id: 'google_business', name: 'Google Business', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg> },
  { id: 'linkedin', name: 'LinkedIn', svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#d4af37"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
];

const contentTypes = [
  { id: 'posts', name: 'Posts', icon: '📝', description: 'Regular social media posts' },
  { id: 'stories', name: 'Stories', icon: '⭕', description: '24-hour stories' },
  { id: 'reels', name: 'Reels', icon: '🎬', description: 'Short-form vertical videos' },
  { id: 'shorts', name: 'Shorts', icon: '▶️', description: 'YouTube Shorts' },
  { id: 'videos', name: 'Full Videos', icon: '🎥', description: 'Long-form video content' },
  { id: 'live', name: 'Live Streams', icon: '🔴', description: 'Live streaming sessions' },
];

export default function LiveNotificationManager() {
  const [enabled, setEnabled] = useState(true);
  const [advanceTime, setAdvanceTime] = useState('15');
  const [useAI, setUseAI] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [platformSettings, setPlatformSettings] = useState({
    youtube: true,
    twitch: true,
    kick: true,
    rumble: true,
    instagram: true,
    facebook: true,
    twitter: true,
    tiktok: true,
    pinterest: true,
    threads: true,
    google_business: true,
    linkedin: true,
  });
  const [contentTypeSettings, setContentTypeSettings] = useState({
    posts: true,
    stories: true,
    reels: true,
    shorts: true,
    videos: true,
    live: true,
  });

  const handlePlatformToggle = (platformId) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platformId]: !prev[platformId]
    }));
  };

  const handleContentTypeToggle = (typeId) => {
    setContentTypeSettings(prev => ({
      ...prev,
      [typeId]: !prev[typeId]
    }));
  };

  const handleSaveSettings = () => {
    toast.success('Auto-notification settings saved!');
  };

  const enabledPlatforms = Object.entries(platformSettings).filter(([_, enabled]) => enabled).length;
  const enabledContentTypes = Object.entries(contentTypeSettings).filter(([_, enabled]) => enabled).length;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Content Notifications</CardTitle>
                  <CardDescription>Automatically notify followers about all scheduled content</CardDescription>
                </div>
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} className="scale-125" />
          </div>
        </CardHeader>
      </Card>

      {enabled && (
        <>
          {/* AI Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                AI Message Generation
              </CardTitle>
              <CardDescription>Let AI craft personalized notifications for each stream</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex-1">
                  <Label className="text-sm font-medium">Enable AI-Powered Messages</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    AI analyzes content, audience, and timing to create engaging notifications for each post type
                  </p>
                </div>
                <Switch checked={useAI} onCheckedChange={setUseAI} />
              </div>

              {!useAI && (
                <div className="space-y-2">
                  <Label>Custom Message Template</Label>
                  <Textarea
                    placeholder="e.g., 🔴 Going LIVE in {time}! Join me for {title}. Link: {url}"
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-slate-500">
                    Variables: {'{time}'}, {'{title}'}, {'{url}'}, {'{platform}'}
                  </p>
                </div>
              )}

              {useAI && (
                <div className="p-4 rounded-lg border border-violet-200 bg-violet-50">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-violet-600 mt-0.5" />
                    <div className="flex-1 space-y-2 text-sm">
                      <p className="font-medium text-violet-900">AI will automatically:</p>
                      <ul className="space-y-1 text-violet-700">
                        <li>• Analyze content type, title, and description</li>
                        <li>• Consider your audience preferences and behavior</li>
                        <li>• Optimize messaging for each platform and content type</li>
                        <li>• Include relevant emojis, hashtags, and calls-to-action</li>
                        <li>• Tailor notifications for posts, stories, reels, videos & live streams</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timing Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Notification Timing
              </CardTitle>
              <CardDescription>When to notify followers before content goes live</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Send notification before content publishes</Label>
                <Select value={advanceTime} onValueChange={setAdvanceTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">At publish time</SelectItem>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="10">10 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="120">2 hours before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Smart Timing</p>
                    <p className="text-blue-700 mt-1">
                      Notifications are automatically scheduled based on your calendar events
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Types Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Content Types
              </CardTitle>
              <CardDescription>
                Select which content types to notify about ({enabledContentTypes}/{contentTypes.length} enabled)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {contentTypes.map((type) => {
                  const isEnabled = contentTypeSettings[type.id];
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleContentTypeToggle(type.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                        isEnabled
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-slate-200 bg-slate-50 opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div className="text-left">
                          <p className="font-medium text-slate-900">{type.name}</p>
                          <p className="text-xs text-slate-500">{type.description}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        isEnabled ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                      )}>
                        {isEnabled && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Select which platforms to notify ({enabledPlatforms}/{platforms.length} enabled)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {platforms.map((platform) => {
                  const isEnabled = platformSettings[platform.id];
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformToggle(platform.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                        isEnabled
                          ? "border-violet-300 bg-violet-50"
                          : "border-slate-200 bg-slate-50 opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8">
                          {platform.svg}
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-slate-900">{platform.name}</p>
                          <p className="text-xs text-slate-500">
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        isEnabled ? "border-violet-600 bg-violet-600" : "border-slate-300"
                      )}>
                        {isEnabled && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Backend Setup Notice */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-amber-900">Backend Functions Required</p>
                  <p className="text-sm text-amber-700 mt-1">
                    To activate automatic notifications, backend functions must be enabled in your app settings. 
                    Once enabled, the system will monitor your calendar and send AI-generated notifications automatically.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSaveSettings} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </>
      )}
    </div>
  );
}