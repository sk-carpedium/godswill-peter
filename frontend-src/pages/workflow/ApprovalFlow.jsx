import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, MessageSquare, Send, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const pendingPosts = [
{ id: '1', title: 'Summer Collection Launch', content: 'Excited to unveil our summer collection! 🌞', author: 'Sarah Marketing', created_at: new Date(Date.now() - 3600000), platforms: ['instagram', 'facebook'], status: 'pending', comments: [] },
{ id: '2', title: 'Customer Success Story', content: 'Amazing feedback from our client...', author: 'Mike Content', created_at: new Date(Date.now() - 7200000), platforms: ['linkedin'], status: 'pending', comments: [{ user: 'Lisa Manager', text: 'Can we add more details?', timestamp: new Date() }] }];


export default function ApprovalFlow() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['approval-flow', workspaceId],
    queryFn: async () => { 
      const posts = await api.entities.Post.filter({ workspace_id: workspaceId, status: 'pending_approval' });
      return posts;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedPost, setSelectedPost] = useState(pendingPosts[0]);
  const [comment, setComment] = useState('');
  const [clientFeedback, setClientFeedback] = useState({ rating: null, notes: '' });

  const handleApprove = () => {
    console.log('Approved with client feedback:', clientFeedback);
    toast.success('Post approved!');
    setClientFeedback({ rating: null, notes: '' });
  };

  const handleReject = () => {
    console.log('Rejected with client feedback:', clientFeedback);
    toast.error('Post rejected');
    setClientFeedback({ rating: null, notes: '' });
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    toast.success('Comment added');
    setComment('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {pendingPosts.map((post) =>
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)} className="bg-transparent text-slate-950 p-4 text-left w-full hover:bg-slate-50 transition-colors border-l-4 border-violet-600">


                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-slate-900">{post.title}</p>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    <Clock className="w-3 h-3 mr-1" />Pending
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 truncate mb-2">{post.content}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{post.author}</span>
                  <span>{moment(post.created_at).fromNow()}</span>
                </div>
              </button>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{selectedPost.title}</CardTitle>
              <p className="text-sm text-slate-500 mt-1">By {selectedPost.author} • {moment(selectedPost.created_at).fromNow()}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReject} className="text-red-600 hover:bg-red-50">
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button size="sm" onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 rounded-lg border-2 border-slate-200 bg-slate-50">
            <p className="text-slate-900">{selectedPost.content}</p>
            <div className="flex gap-2 mt-4">
              {selectedPost.platforms.map((platform) =>
              <Badge key={platform} variant="secondary">{platform}</Badge>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments & Feedback ({selectedPost.comments.length})
            </h4>
            <div className="space-y-3 mb-4">
              {selectedPost.comments.map((c, i) =>
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">{c.user.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{c.user}</p>
                    <p className="text-sm text-slate-600 mt-1">{c.text}</p>
                    <p className="text-xs text-slate-500 mt-1">{moment(c.timestamp).fromNow()}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Textarea placeholder="Add feedback or request changes..." value={comment} onChange={(e) => setComment(e.target.value)} className="flex-1" />
              <Button onClick={handleAddComment}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Client Feedback Section */}
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-medium text-slate-900">Client Feedback (Optional)</h4>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Rate this content:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setClientFeedback({ ...clientFeedback, rating: star })}
                    className="transition-colors"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        clientFeedback.rating && star <= clientFeedback.rating
                          ? 'fill-[#d4af37] text-[#d4af37]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {clientFeedback.rating && (
                <span className="text-sm text-slate-600 ml-2">
                  ({clientFeedback.rating}/5)
                </span>
              )}
            </div>

            <Textarea
              placeholder="Add feedback notes for the team (e.g., what you liked, what to improve)..."
              value={clientFeedback.notes}
              onChange={(e) => setClientFeedback({ ...clientFeedback, notes: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>);

}