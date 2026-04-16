import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, MessageSquare, Send, FileText, Eye, ThumbsUp, ThumbsDown, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';

// approvalPosts replaced by real API data above
const _approvalPosts_OLD = [
  {
    id: '1',
    title: 'Summer Collection Launch',
    content: 'Introducing our vibrant summer collection! 🌺 Fresh styles, bold colors...',
    platforms: ['instagram', 'facebook'],
    status: 'pending_approval',
    stage: 1,
    totalStages: 3,
    currentApprover: { name: 'Sarah Johnson', role: 'Content Manager', email: 'sarah@company.com' },
    submittedBy: { name: 'John Doe', role: 'Content Creator' },
    submittedAt: new Date(Date.now() - 7200000).toISOString(),
    approvalChain: [
      { name: 'Sarah Johnson', role: 'Content Manager', status: 'pending' },
      { name: 'Michael Chen', role: 'Marketing Director', status: 'waiting' },
      { name: 'Emily Davis', role: 'Brand Manager', status: 'waiting' }
    ],
    comments: [
      { user: 'John Doe', comment: 'Please review the hashtag strategy', time: '2h ago' }
    ],
    priority: 'high'
  },
  {
    id: '2',
    title: 'Product Feature Spotlight',
    content: 'Check out the amazing features of our latest product release...',
    platforms: ['linkedin', 'twitter'],
    status: 'pending_approval',
    stage: 2,
    totalStages: 3,
    currentApprover: { name: 'Michael Chen', role: 'Marketing Director', email: 'michael@company.com' },
    submittedBy: { name: 'Jane Smith', role: 'Product Marketing' },
    submittedAt: new Date(Date.now() - 14400000).toISOString(),
    approvalChain: [
      { name: 'Sarah Johnson', role: 'Content Manager', status: 'approved', time: '3h ago' },
      { name: 'Michael Chen', role: 'Marketing Director', status: 'pending' },
      { name: 'Emily Davis', role: 'Brand Manager', status: 'waiting' }
    ],
    comments: [
      { user: 'Sarah Johnson', comment: 'Approved with minor edits to tone', time: '3h ago' }
    ],
    priority: 'medium'
  }
];

const _approvalHistory_OLD = [
  {
    id: '1',
    title: 'Weekend Sale Announcement',
    status: 'approved',
    finalApprover: 'Emily Davis',
    approvedAt: new Date(Date.now() - 86400000).toISOString(),
    totalTime: '2h 15m'
  },
  {
    id: '2',
    title: 'Customer Testimonial',
    status: 'rejected',
    rejectedBy: 'Michael Chen',
    rejectedAt: new Date(Date.now() - 172800000).toISOString(),
    reason: 'Need updated brand guidelines compliance'
  }
];

export default function WorkflowApprovals() {
  const { workspaceId } = useWorkspace();
  const { data: approvalData, isLoading } = useQuery({
    queryKey: ['approvals', workspaceId],
    queryFn: async () => {
      const [posts, history] = await Promise.all([
        api.entities.Post.filter({ workspace_id: workspaceId, status: 'pending_approval' }),
        api.entities.Post.filter({ workspace_id: workspaceId, status: 'approved', sort: '-created_at', limit: 10 }),
      ]);
      return { posts, history };
    },
    enabled: !!workspaceId,
    staleTime: 30000,
  });
  const approvalPosts   = approvalData?.posts   || [];
  const approvalHistory = approvalData?.history || [];

  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const handleApprove = () => {
    console.log('Approved:', selectedPost?.id, comment);
    setComment('');
    setSelectedPost(null);
  };

  const handleReject = () => {
    console.log('Rejected:', selectedPost?.id, comment);
    setComment('');
    setSelectedPost(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Content Approvals</h1>
        <p className="text-slate-500 mt-1">Manage multi-stage approval workflows for your content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">12</p>
                <p className="text-sm text-slate-500 mt-1">Pending Approval</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">45</p>
                <p className="text-sm text-slate-500 mt-1">Approved This Week</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">3</p>
                <p className="text-sm text-slate-500 mt-1">Rejected</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">1.8h</p>
                <p className="text-sm text-slate-500 mt-1">Avg Approval Time</p>
              </div>
              <AlertCircle className="w-8 h-8 text-[#d4af37]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approval Queue */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pending">Pending ({approvalPosts.length})</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {approvalPosts.map((post) => (
                <Card key={post.id} className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedPost?.id === post.id && "ring-2 ring-[#d4af37]"
                )}
                onClick={() => setSelectedPost(post)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{post.title}</h3>
                          <Badge className={cn(
                            post.priority === 'high' ? 'bg-red-100 text-red-700' :
                            post.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {post.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{post.content}</p>
                      </div>
                    </div>

                    {/* Approval Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Stage {post.stage} of {post.totalStages}</span>
                        <span>{moment(post.submittedAt).fromNow()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.approvalChain.map((approver, i) => (
                          <React.Fragment key={i}>
                            <div className="flex-1 flex flex-col items-center">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center mb-1",
                                approver.status === 'approved' ? 'bg-green-500' :
                                approver.status === 'pending' ? 'bg-[#d4af37]' :
                                'bg-slate-200'
                              )}>
                                {approver.status === 'approved' ? (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                ) : approver.status === 'pending' ? (
                                  <Clock className="w-4 h-4 text-slate-950" />
                                ) : (
                                  <div className="w-3 h-3 rounded-full bg-slate-400" />
                                )}
                              </div>
                              <p className="text-xs text-center text-slate-600">{approver.name.split(' ')[0]}</p>
                              <p className="text-[10px] text-slate-400">{approver.role}</p>
                            </div>
                            {i < post.approvalChain.length - 1 && (
                              <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-slate-200 text-xs">
                            {post.submittedBy.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-500">
                          by {post.submittedBy.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {post.comments.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {post.comments.length}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {post.platforms.length} platforms
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {approvalHistory.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{item.title}</h3>
                          <Badge className={cn(
                            item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          )}>
                            {item.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {item.status === 'approved' ? (
                            <>Approved by {item.finalApprover} • {moment(item.approvedAt).fromNow()}</>
                          ) : (
                            <>Rejected by {item.rejectedBy} • {moment(item.rejectedAt).fromNow()}</>
                          )}
                        </p>
                        {item.reason && (
                          <p className="text-sm text-slate-600 mt-2">{item.reason}</p>
                        )}
                      </div>
                      {item.totalTime && (
                        <Badge variant="outline" className="text-xs">
                          {item.totalTime}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Approval Details & Actions */}
        <div className="space-y-6">
          {selectedPost ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Current Approver</p>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#d4af37]/10">
                      <Avatar>
                        <AvatarFallback className="bg-[#d4af37] text-slate-950">
                          {selectedPost.currentApprover.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900">{selectedPost.currentApprover.name}</p>
                        <p className="text-xs text-slate-500">{selectedPost.currentApprover.role}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Add Comment</p>
                    <Textarea
                      placeholder="Add feedback or notes..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={handleApprove}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={handleReject}
                    >
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Post
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comments ({selectedPost.comments.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedPost.comments.map((comment, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-900">{comment.user}</p>
                        <p className="text-xs text-slate-400">{comment.time}</p>
                      </div>
                      <p className="text-sm text-slate-600">{comment.comment}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a post to review</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}