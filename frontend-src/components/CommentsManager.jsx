import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Reply, ThumbsUp, Heart, Send, Search, Trash2, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


// sampleComments removed — real data from API
const _OLD_sampleComments = [
{ id: '1', author: 'Emma Wilson', comment: 'Love this post! 🔥', likes: 42, timestamp: new Date(Date.now() - 3600000), postTitle: 'New Product Launch', sentiment: 'positive', replied: false },
{ id: '2', author: 'James Brown', comment: 'This is amazing! When will it be available?', likes: 28, timestamp: new Date(Date.now() - 7200000), postTitle: 'Summer Collection', sentiment: 'positive', replied: true },
{ id: '3', author: 'Sofia Garcia', comment: 'Not sure about this one...', likes: 5, timestamp: new Date(Date.now() - 10800000), postTitle: 'New Product Launch', sentiment: 'negative', replied: false }];


export default function CommentsManager({ platformName, platformColor = 'violet' }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['comments-mgr', workspaceId],
    queryFn: async () => { 
      const mentions = await api.entities.Mention.filter({ workspace_id: workspaceId, type: 'comment', status: 'new', sort: '-mentioned_at', limit: 50 });
      return mentions;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [filter, setFilter] = useState('all');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const comments = (_apiData || []);  // real data from useQuery
    if (filter === 'positive' && c.sentiment !== 'positive') return false;
    if (searchQuery && !c.comment.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleReply = () => {
    if (!replyText.trim()) return;
    toast.success('Reply posted!');
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Comments</CardTitle>
              <Badge variant="secondary">{comments.length} comments</Badge>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search comments..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="unreplied">Unreplied</TabsTrigger>
                  <TabsTrigger value="positive">Positive</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {comments.map((comment) =>
                <div key={comment.id} className={cn("p-4 rounded-xl border-2", replyingTo === comment.id ? "border-violet-300 bg-violet-50/50" : "border-slate-200")}>
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-slate-200 text-[#d4af37] rounded-full flex h-full w-full items-center justify-center">
                          {comment.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="font-medium text-slate-900">{comment.author}</p>
                            <p className="text-xs text-slate-500">{moment(comment.timestamp).fromNow()} • {comment.postTitle}</p>
                          </div>
                          <div className="flex gap-1">
                            {comment.replied && <Badge className="text-xs bg-green-50 text-green-700">Replied</Badge>}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{comment.comment}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <Heart className="w-4 h-4" />
                            <span>{comment.likes}</span>
                          </div>
                          {replyingTo === comment.id ?
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-7 text-xs">Cancel</Button> :

                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)} className="h-7 text-xs">
                              <Reply className="w-3 h-3 mr-1" />Reply
                            </Button>
                        }
                          <Button variant="ghost" size="sm" className="h-7 text-xs"><Pin className="w-3 h-3 mr-1" />Pin</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                        {replyingTo === comment.id &&
                      <div className="mt-3 pt-3 border-t space-y-2">
                            <Textarea placeholder="Write reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-[80px]" />
                            <Button size="sm" onClick={handleReply} className={cn(`bg-${platformColor}-600`, `hover:bg-${platformColor}-700`)}>
                              <Send className="w-3 h-3 mr-1" />Send
                            </Button>
                          </div>
                      }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-600">Total</span><span className="font-semibold">248</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Unreplied</span><span className="font-semibold text-amber-600">32</span></div>
            <div className="flex justify-between"><span className="text-slate-600">Avg Response</span><span className="font-semibold">1.8h</span></div>
          </CardContent>
        </Card>
      </div>
    </div>);

}