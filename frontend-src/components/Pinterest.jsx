import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CommentsManager from '@/components/CommentsManager';
import DirectMessages from '@/components/DirectMessages';
import PlatformAnalytics from '@/components/PlatformAnalytics';
import AudienceEngagement from '@/components/AudienceEngagement';
import { MessageSquare, Send, BarChart3, Users } from 'lucide-react';

export default function Pinterest() {
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#d4af37"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pinterest Management</h1>
          <p className="text-slate-500">Manage comments, messages, analytics, and followers</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="comments" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><MessageSquare className="w-4 h-4" />Comments</TabsTrigger>
          <TabsTrigger value="messages" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Send className="w-4 h-4" />Messages</TabsTrigger>
          <TabsTrigger value="analytics" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><BarChart3 className="w-4 h-4" />Analytics</TabsTrigger>
          <TabsTrigger value="audience" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Users className="w-4 h-4" />Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-6"><CommentsManager platformName="Pinterest" platformColor="red" /></TabsContent>
        <TabsContent value="messages" className="mt-6"><DirectMessages platformName="Pinterest" platformColor="red" /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><PlatformAnalytics platformName="Pinterest" platformColor="red" /></TabsContent>
        <TabsContent value="audience" className="mt-6"><AudienceEngagement platformName="Pinterest" platformColor="red" /></TabsContent>
      </Tabs>
    </div>
  );
}