import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CommentsManager from '@/components/CommentsManager';
import DirectMessages from '@/components/DirectMessages';
import PlatformAnalytics from '@/components/PlatformAnalytics';
import AudienceEngagement from '@/components/AudienceEngagement';
import { MessageSquare, Send, BarChart3, Users } from 'lucide-react';

export default function Threads() {
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#d4af37"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.129-.73-1.818-1.857-1.818-3.336 0-1.501.697-2.748 1.98-3.549.932-.582 2.106-.873 3.408-.846.896.017 1.727.178 2.508.488v-.695c0-1.173-.394-2.02-1.174-2.522-.651-.418-1.527-.59-2.612-.518-1.256.085-2.29.423-3.074.998l-.546-1.938c.968-.684 2.297-1.134 3.952-1.243 1.443-.097 2.718.13 3.796.676 1.326.672 2.015 1.854 2.048 3.512v2.254c1.175.584 2.09 1.428 2.697 2.49.739 1.29.883 3.008-.235 4.855-1.26 2.082-3.5 3.136-6.848 3.213z"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Threads Management</h1>
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

        <TabsContent value="comments" className="mt-6"><CommentsManager platformName="Threads" platformColor="slate" /></TabsContent>
        <TabsContent value="messages" className="mt-6"><DirectMessages platformName="Threads" platformColor="slate" /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><PlatformAnalytics platformName="Threads" platformColor="slate" /></TabsContent>
        <TabsContent value="audience" className="mt-6"><AudienceEngagement platformName="Threads" platformColor="slate" /></TabsContent>
      </Tabs>
    </div>
  );
}