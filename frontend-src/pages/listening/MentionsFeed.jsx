/**
 * MentionsFeed.jsx — FIXED
 * Was: hardcoded sampleMentions array
 * Now: fetches real mentions from GET /mentions with live filtering
 */
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Reply, Heart, MessageSquare, Share2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useMentions, useMentionMutations } from '@/hooks';
import { toast } from 'sonner';

const PLATFORM_COLORS = { twitter:'bg-blue-100 text-blue-700', instagram:'bg-purple-100 text-purple-700', facebook:'bg-blue-100 text-blue-700', linkedin:'bg-blue-100 text-blue-700', tiktok:'bg-slate-100 text-slate-700' };
const SENTIMENT_COLORS = { positive:'text-green-600 bg-green-50', neutral:'text-slate-600 bg-slate-50', negative:'text-red-600 bg-red-50' };

export default function MentionsFeed() {
  const [filter, setFilter]  = useState('all');
  const [search, setSearch]  = useState('');

  const mentionFilters = {
    all:      {},
    unread:   { status: 'new' },
    positive: { sentiment: 'positive' },
    negative: { sentiment: 'negative' },
    crisis:   { is_crisis: true },
  };

  const { data: allMentions = [], isLoading } = useMentions(mentionFilters[filter] || {});
  const { update } = useMentionMutations();

  const filtered = search
    ? allMentions.filter(m => m.content?.toLowerCase().includes(search.toLowerCase()))
    : allMentions;

  const handleRespond = (mention) => {
    update.mutate({ id: mention.id, data: { status: 'reviewed' } });
    toast.info('Opening response panel...');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search mentions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="positive">Positive</TabsTrigger>
            <TabsTrigger value="negative">Negative</TabsTrigger>
            <TabsTrigger value="crisis">Crisis</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-3">
          {isLoading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />) :
          filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No mentions found</p>
            </div>
          ) :
          filtered.map(mention => {
            const author = typeof mention.author === 'object' ? mention.author : {};
            return (
              <Card key={mention.id} className={cn("transition-all hover:shadow-md", mention.is_crisis && "border-red-300 bg-red-50/30")}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-slate-200">{(author.display_name || '?')[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{author.display_name || 'Unknown'}</p>
                            {author.is_verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className={PLATFORM_COLORS[mention.platform] || 'bg-slate-100 text-slate-700'}>{mention.platform}</Badge>
                            <Badge className={SENTIMENT_COLORS[mention.sentiment] || ''}>{mention.sentiment}</Badge>
                            {mention.is_crisis && <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Crisis</Badge>}
                            <span className="text-xs text-slate-500">{moment(mention.mentioned_at).fromNow()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="text-xs">Influence: {mention.influence_score || 0}</Badge>
                          {mention.status === 'new' ? <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />New</Badge> : <Badge className="bg-green-100 text-green-700">Reviewed</Badge>}
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{mention.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{(mention.engagement?.likes)||0}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" />{(mention.engagement?.comments)||0}</span>
                          {mention.engagement?.shares && <span className="flex items-center gap-1"><Share2 className="w-4 h-4" />{mention.engagement.shares}</span>}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRespond(mention)}>
                          <Reply className="w-3 h-3 mr-1" />Respond
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
