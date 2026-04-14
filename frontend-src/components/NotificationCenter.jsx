import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Bell, Users, Radio, Send, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function NotificationCenter({ platform, platformName, platformColor }) {
  const [uploadNotifications, setUploadNotifications] = useState(true);
  const [liveStreamAlerts, setLiveStreamAlerts] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [scheduledLiveTitle, setScheduledLiveTitle] = useState('');

  const colorMap = {
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    green: 'bg-green-600 hover:bg-green-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700'
  };

  const handleSendNotification = () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a notification message');
      return;
    }
    toast.success('Notification sent to all followers!');
    setCustomMessage('');
  };

  const handleScheduleLive = () => {
    if (!scheduledLiveTitle.trim()) {
      toast.error('Please enter a stream title');
      return;
    }
    toast.success('Live stream scheduled and followers will be notified!');
    setScheduledLiveTitle('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage how you notify your followers on {platformName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <Bell className={cn("w-5 h-5 mt-0.5", `text-${platformColor}-600`)} />
                  <div>
                    <Label className="text-sm font-medium">Video Upload Notifications</Label>
                    <p className="text-xs text-slate-500 mt-1">Notify followers when you upload a new video</p>
                  </div>
                </div>
                <Switch checked={uploadNotifications} onCheckedChange={setUploadNotifications} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                <div className="flex items-start gap-3">
                  <Radio className={cn("w-5 h-5 mt-0.5", `text-${platformColor}-600`)} />
                  <div>
                    <Label className="text-sm font-medium">Live Stream Alerts</Label>
                    <p className="text-xs text-slate-500 mt-1">Send alerts when you go live</p>
                  </div>
                </div>
                <Switch checked={liveStreamAlerts} onCheckedChange={setLiveStreamAlerts} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Custom Notification</CardTitle>
            <CardDescription>Send a custom message to all your followers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Notification Message</Label>
              <Textarea placeholder="Enter your message..." value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} className="mt-2 min-h-[100px]" maxLength={200} />
              <p className="text-xs text-slate-500 mt-1">{customMessage.length}/200</p>
            </div>
            <Button onClick={handleSendNotification} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
              <Send className="w-4 h-4 mr-2" />
              Send to All Followers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule Live Stream</CardTitle>
            <CardDescription>Schedule a stream and notify followers in advance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Stream Title</Label>
              <Input placeholder="Enter live stream title..." value={scheduledLiveTitle} onChange={(e) => setScheduledLiveTitle(e.target.value)} className="mt-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input type="date" className="mt-2" />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" className="mt-2" />
              </div>
            </div>
            <Button onClick={handleScheduleLive} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md">
              <Radio className="w-4 h-4 mr-2" />
              Schedule & Notify
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Follower Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <p className="text-3xl font-bold text-slate-900">12.5K</p>
              <p className="text-sm text-slate-500 mt-1">Total Followers</p>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Notifications On</span>
                <span className="font-semibold">8.2K</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Avg. Open Rate</span>
                <span className={cn("font-semibold", `text-${platformColor}-600`)}>72%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
              { text: 'New video upload', time: '2 hours ago', count: '8.2K' },
              { text: 'Live stream started', time: '1 day ago', count: '5.5K' }].
              map((notification, i) =>
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", `text-${platformColor}-600`)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{notification.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-slate-500">{notification.time}</p>
                      <span className="text-xs text-slate-400">•</span>
                      <Badge variant="secondary" className="text-xs">{notification.count} sent</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);

}