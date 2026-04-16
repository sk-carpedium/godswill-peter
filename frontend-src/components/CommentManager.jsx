import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Reply, ThumbsUp, Send, Heart, AlertCircle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


// sampleComments removed — real data from API
const _OLD_sampleComments = [
  { id: '1', author: 'John Doe', comment: 'Great content! Keep it up!', likes: 24, timestamp: new Date(Date.now() - 3600000), sentiment: 'positive', replied: false },
  { id: '2', author: 'Sarah Chen', comment: 'Really helpful, thanks!', likes: 15, timestamp: new Date(Date.now() - 7200000), sentiment: 'positive', replied: true },
  { id: '3', author: 'Mike Smith', comment: 'Could you explain more about this?', likes: 8, timestamp: new Date(Date.now() - 10800000), sentiment: 'neutral', replied: false },
];

export default function CommentManager({ platform, platformName, platformColor }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['comments', workspaceId],
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
    if (filter === 'positive' && comment.sentiment !== 'positive') return false;
    if (searchQuery && !comment.comment.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleReply = () => {
    if (!replyText.trim()) return;
    toast.success('Reply posted successfully!');
    setReplyingTo(null);
    setReplyText('');
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return `text-${platformColor}-600 bg-${platformColor}-50`;
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const colorMap = {
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    green: 'bg-green-600 hover:bg-green-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{platformName} Comments</CardTitle>
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
                {comments.map((comment) => (
                  <div key={comment.id} className={cn("p-4 rounded-xl border-2 transition-all", replyingTo === comment.id ? "border-violet-300 bg-violet-50/50" : "border-slate-200")}>
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className={cn(`bg-${platformColor}-100`, `text-${platformColor}-600`)}>
                          {comment.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <p className="font-medium text-slate-900">{comment.author}</p>
                            <p className="text-xs text-slate-500">{moment(comment.timestamp).fromNow()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className={cn("text-xs", getSentimentColor(comment.sentiment))}>
                              {comment.sentiment === 'positive' ? <Heart className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                              <span className="ml-1 capitalize">{comment.sentiment}</span>
                            </Badge>
                            {comment.replied && <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">Replied</Badge>}
                          </div>
                        </div>
                        
                        <p className="text-sm text-slate-700 mb-3">{comment.comment}</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-slate-500">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{comment.likes}</span>
                          </div>
                          {replyingTo === comment.id ? (
                            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-7 text-xs">Cancel</Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(comment.id)} className="h-7 text-xs gap-1">
                              <Reply className="w-3 h-3" />
                              Reply
                            </Button>
                          )}
                        </div>

                        {replyingTo === comment.id && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <Textarea placeholder="Write your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-[80px]" />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button size="sm" onClick={handleReply} className={colorMap[platformColor]}>
                                <Send className="w-3 h-3 mr-1" />
                                Send Reply
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comment Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Comments</span>
              <span className="font-semibold">127</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Unreplied</span>
              <span className="font-semibold text-amber-600">23</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Response Time</span>
              <span className="font-semibold">2.4 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}