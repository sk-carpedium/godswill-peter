import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CommentsManager from '@/components/CommentsManager';
import DirectMessages from '@/components/DirectMessages';
import PlatformAnalytics from '@/components/PlatformAnalytics';
import AudienceEngagement from '@/components/AudienceEngagement';
import { MessageSquare, Send, BarChart3, Users } from 'lucide-react';

export default function LinkedIn() {
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#d4af37"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">LinkedIn Management</h1>
          <p className="text-slate-500">Manage comments, messages, analytics, and connections</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="comments" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><MessageSquare className="w-4 h-4" />Comments</TabsTrigger>
          <TabsTrigger value="messages" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Send className="w-4 h-4" />Messages</TabsTrigger>
          <TabsTrigger value="analytics" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><BarChart3 className="w-4 h-4" />Analytics</TabsTrigger>
          <TabsTrigger value="audience" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Users className="w-4 h-4" />Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-6"><CommentsManager platformName="LinkedIn" platformColor="blue" /></TabsContent>
        <TabsContent value="messages" className="mt-6"><DirectMessages platformName="LinkedIn" platformColor="blue" /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><PlatformAnalytics platformName="LinkedIn" platformColor="blue" /></TabsContent>
        <TabsContent value="audience" className="mt-6"><AudienceEngagement platformName="LinkedIn" platformColor="blue" /></TabsContent>
      </Tabs>
    </div>
  );
}