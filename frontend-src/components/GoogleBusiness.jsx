import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CommentsManager from '@/components/social/CommentsManager';
import DirectMessages from '@/components/social/DirectMessages';
import PlatformAnalytics from '@/components/social/PlatformAnalytics';
import AudienceEngagement from '@/components/social/AudienceEngagement';
import ReviewsManager from '@/components/social/ReviewsManager';
import { MessageSquare, Send, BarChart3, Users, Star } from 'lucide-react';

export default function GoogleBusiness() {
  const [activeTab, setActiveTab] = useState('reviews');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#d4af37"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Google Business Management</h1>
          <p className="text-slate-500">Manage reviews, messages, analytics, and customer insights</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="reviews" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Star className="w-4 h-4" />Reviews</TabsTrigger>
          <TabsTrigger value="comments" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><MessageSquare className="w-4 h-4" />Q&A</TabsTrigger>
          <TabsTrigger value="messages" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Send className="w-4 h-4" />Messages</TabsTrigger>
          <TabsTrigger value="analytics" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><BarChart3 className="w-4 h-4" />Insights</TabsTrigger>
          <TabsTrigger value="audience" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"><Users className="w-4 h-4" />Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="mt-6"><ReviewsManager platformName="Google Business" platformColor="blue" /></TabsContent>
        <TabsContent value="comments" className="mt-6"><CommentsManager platformName="Google Business" platformColor="blue" /></TabsContent>
        <TabsContent value="messages" className="mt-6"><DirectMessages platformName="Google Business" platformColor="blue" /></TabsContent>
        <TabsContent value="analytics" className="mt-6"><PlatformAnalytics platformName="Google Business" platformColor="blue" /></TabsContent>
        <TabsContent value="audience" className="mt-6"><AudienceEngagement platformName="Google Business" platformColor="blue" /></TabsContent>
      </Tabs>
    </div>
  );
}