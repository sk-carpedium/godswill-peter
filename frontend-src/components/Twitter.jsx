import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CommentsManager from '@/components/CommentsManager';
import DirectMessages from '@/components/DirectMessages';
import PlatformAnalytics from '@/components/PlatformAnalytics';
import AudienceEngagement from '@/components/AudienceEngagement';
import { MessageSquare, Send, BarChart3, Users } from 'lucide-react';

export default function Twitter() {
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#d4af37"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">X (Twitter) Management</h1>
          <p className="text-slate-500">Manage replies, DMs, analytics, and followers</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="comments" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><MessageSquare className="w-4 h-4" />Replies</TabsTrigger>
          <TabsTrigger value="messages" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Send className="w-4 h-4" />Messages</TabsTrigger>
          <TabsTrigger value="analytics" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><BarChart3 className="w-4 h-4" />Analytics</TabsTrigger>
          <TabsTrigger value="audience" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Users className="w-4 h-4" />Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-6"><CommentsManager platformName="X" platformColor="slate" /></TabsContent>
        <TabsContent value="messages" className="mt-6"><DirectMessages platformName="X" platformColor="slate" /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><PlatformAnalytics platformName="X" platformColor="slate" /></TabsContent>
        <TabsContent value="audience" className="mt-6"><AudienceEngagement platformName="X" platformColor="slate" /></TabsContent>
      </Tabs>
    </div>
  );
}