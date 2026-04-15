import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CommentsManager from '@/components/CommentsManager';
import DirectMessages from '@/components/DirectMessages';
import PlatformAnalytics from '@/components/PlatformAnalytics';
import AudienceEngagement from '@/components/AudienceEngagement';
import { MessageSquare, Send, BarChart3, Users } from 'lucide-react';

export default function Bluesky() {
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#d4af37">
            <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.579 6.87-1.5 7.823-4.308.953 2.808 2.81 9.886 7.823 4.308 4.558-5.073 1.082-6.498-2.83-7.078-.14-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bluesky Management</h1>
          <p className="text-slate-500">Manage comments, DMs, analytics, and audience</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="comments" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Comments
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <Send className="w-4 h-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="audience" className="gap-2">
            <Users className="w-4 h-4" />
            Audience
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-6">
          <CommentsManager platformName="Bluesky" platformColor="blue" />
        </TabsContent>
        <TabsContent value="messages" className="mt-6">
          <DirectMessages platformName="Bluesky" platformColor="blue" />
        </TabsContent>
        <TabsContent value="analytics" className="mt-6">
          <PlatformAnalytics platformName="Bluesky" platformColor="blue" />
        </TabsContent>
        <TabsContent value="audience" className="mt-6">
          <AudienceEngagement platformName="Bluesky" platformColor="blue" />
        </TabsContent>
      </Tabs>
    </div>
  );
}