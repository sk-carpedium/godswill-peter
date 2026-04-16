import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Send,
  ArrowRight,
  User,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';


const approvalData = [
  {
    id: '1',
    post: {
      title: 'Summer Sale Campaign Launch',
      content: '🌞 Summer vibes are here! Get 40% off on all products...',
      platforms: ['instagram', 'facebook'],
      scheduled_at: new Date(Date.now() + 86400000).toISOString()
    },
    status: 'pending',
    stage: 'content_review',
    workflow: [
      { stage: 'content_review', approver: 'sarah@example.com', status: 'pending', required: true },
      { stage: 'legal_review', approver: 'legal@example.com', status: 'waiting', required: true },
      { stage: 'client_approval', approver: 'client@example.com', status: 'waiting', required: false }
    ],
    created_by: 'john@example.com',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    comments: [
      {
        user: 'john@example.com',
        comment: 'Ready for review. Please check the hashtags.',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ]
  },
  {
    id: '2',
    post: {
      title: 'Product Feature Announcement',
      content: '🚀 Introducing our latest feature...',
      platforms: ['linkedin', 'twitter'],
      scheduled_at: new Date(Date.now() + 172800000).toISOString()
    },
    status: 'approved',
    stage: 'completed',
    workflow: [
      { stage: 'content_review', approver: 'sarah@example.com', status: 'approved', required: true, approved_at: new Date(Date.now() - 7200000).toISOString() },
      { stage: 'legal_review', approver: 'legal@example.com', status: 'approved', required: true, approved_at: new Date(Date.now() - 3600000).toISOString() }
    ],
    created_by: 'emily@example.com',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    post: {
      title: 'Weekly Newsletter',
      content: '📰 This week in tech...',
      platforms: ['twitter'],
      scheduled_at: new Date(Date.now() + 259200000).toISOString()
    },
    status: 'rejected',
    stage: 'content_review',
    workflow: [
      { 
        stage: 'content_review', 
        approver: 'sarah@example.com', 
        status: 'rejected', 
        required: true,
        feedback: 'Please update the tone to be more professional and add data sources.',
        rejected_at: new Date(Date.now() - 1800000).toISOString()
      }
    ],
    created_by: 'mike@example.com',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
];

const platformIcons = {
  instagram: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>,
  facebook: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  linkedin: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  twitter: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="#d4af37"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
};

export default function ApprovalWorkflow() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['approval-workflow', workspaceId],
    queryFn: async () => { 
      const posts = await api.entities.Post.filter({ workspace_id: workspaceId, status: 'pending_approval' });
      return posts;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [filter, setFilter] = useState('pending');

  const filteredPosts = approvalData.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleApprove = () => {
    console.log('Approved:', selectedPost?.id);
    setSelectedPost(null);
  };

  const handleReject = () => {
    console.log('Rejected:', selectedPost?.id);
    setSelectedPost(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Approval Workflow</h1>
          <p className="text-slate-500 mt-1">Review and approve content before publishing</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {approvalData.filter(p => p.status === 'pending').length} Pending
          </Badge>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({approvalData.filter(p => p.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvalData.filter(p => p.status === 'approved').length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({approvalData.filter(p => p.status === 'rejected').length})</TabsTrigger>
          <TabsTrigger value="all">All ({approvalData.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post List */}
        <div className="lg:col-span-1 space-y-4">
          {filteredPosts.map((item) => (
            <Card 
              key={item.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedPost?.id === item.id && "ring-2 ring-[#d4af37]"
              )}
              onClick={() => setSelectedPost(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 text-sm">{item.post.title}</h3>
                  <Badge className={cn(
                    "text-xs",
                    item.status === 'pending' && "bg-amber-100 text-amber-800",
                    item.status === 'approved' && "bg-green-100 text-green-800",
                    item.status === 'rejected' && "bg-red-100 text-red-800"
                  )}>
                    {item.status}
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                  {item.post.content}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1">
                    {item.post.platforms.map((platform, i) => (
                      <div key={i} className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center ring-2 ring-white">
                        {platformIcons[platform]}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">
                    {moment(item.created_at).fromNow()}
                  </span>
                </div>

                {/* Workflow Progress */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {item.workflow.map((stage, i) => (
                      <React.Fragment key={i}>
                        <div className={cn(
                          "flex-1 h-1 rounded-full",
                          stage.status === 'approved' && "bg-green-500",
                          stage.status === 'rejected' && "bg-red-500",
                          stage.status === 'pending' && "bg-[#d4af37]",
                          stage.status === 'waiting' && "bg-slate-200"
                        )} />
                        {i < item.workflow.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-slate-300" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No {filter} posts</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-2">
          {selectedPost ? (
            <div className="space-y-6">
              {/* Post Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedPost.post.title}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        Created by {selectedPost.created_by} • {moment(selectedPost.created_at).fromNow()}
                      </p>
                    </div>
                    <Badge className={cn(
                      selectedPost.status === 'pending' && "bg-amber-100 text-amber-800",
                      selectedPost.status === 'approved' && "bg-green-100 text-green-800",
                      selectedPost.status === 'rejected' && "bg-red-100 text-red-800"
                    )}>
                      {selectedPost.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Content:</p>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-slate-900">{selectedPost.post.content}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Platforms:</p>
                    <div className="flex gap-2">
                      {selectedPost.post.platforms.map((platform, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                          {platformIcons[platform]}
                          <span className="text-sm capitalize">{platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Scheduled for:</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      {moment(selectedPost.post.scheduled_at).format('MMM D, YYYY [at] h:mm A')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Stages */}
              <Card>
                <CardHeader>
                  <CardTitle>Approval Workflow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedPost.workflow.map((stage, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                          stage.status === 'approved' && "bg-green-100",
                          stage.status === 'rejected' && "bg-red-100",
                          stage.status === 'pending' && "bg-[#d4af37]/20",
                          stage.status === 'waiting' && "bg-slate-100"
                        )}>
                          {stage.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                          {stage.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                          {stage.status === 'pending' && <Clock className="w-5 h-5 text-[#d4af37]" />}
                          {stage.status === 'waiting' && <User className="w-5 h-5 text-slate-400" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-slate-900 capitalize">
                              {stage.stage.replace('_', ' ')}
                            </h4>
                            {stage.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                            <Badge className={cn(
                              "text-xs",
                              stage.status === 'approved' && "bg-green-100 text-green-800",
                              stage.status === 'rejected' && "bg-red-100 text-red-800",
                              stage.status === 'pending' && "bg-amber-100 text-amber-800",
                              stage.status === 'waiting' && "bg-slate-100 text-slate-800"
                            )}>
                              {stage.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 mb-2">{stage.approver}</p>
                          
                          {stage.feedback && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-900">{stage.feedback}</p>
                              </div>
                            </div>
                          )}

                          {stage.approved_at && (
                            <p className="text-xs text-slate-400 mt-1">
                              Approved {moment(stage.approved_at).fromNow()}
                            </p>
                          )}
                          {stage.rejected_at && (
                            <p className="text-xs text-slate-400 mt-1">
                              Rejected {moment(stage.rejected_at).fromNow()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Comments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPost.comments?.map((c, i) => (
                    <div key={i} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37] text-xs">
                          {c.user.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">{c.user}</span>
                          <span className="text-xs text-slate-400">{moment(c.timestamp).fromNow()}</span>
                        </div>
                        <p className="text-sm text-slate-600">{c.comment}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mb-3"
                    />
                    <Button 
                      size="sm" 
                      className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                      disabled={!comment.trim()}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              {selectedPost.status === 'pending' && (
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApprove}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Approve & Continue
                  </Button>
                  <Button 
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleReject}
                  >
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Select a post to review</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}