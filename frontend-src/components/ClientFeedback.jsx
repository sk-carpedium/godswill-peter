import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Clock,
  Calendar,
  Image as ImageIcon,
  Star,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import moment from 'moment';
import {
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';

  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const _OLD_pendingApprovals = [
  {
    id: '1',
    type: 'post',
    title: 'Spring Collection Launch',
    content: 'Excited to announce our new spring collection! 🌸 Fresh styles, vibrant colors, and sustainable materials.',
    platforms: ['Instagram', 'Facebook'],
    media: ['https://ui-avatars.com/api/?name=Client&background=d4af37&color=000&size=128'],
    scheduled_at: new Date(Date.now() + 86400000 * 2),
    submitted_by: 'Sarah Johnson',
    submitted_at: new Date(Date.now() - 3600000 * 3),
    comments: []
  },
  {
    id: '2',
    type: 'report',
    title: 'Q1 Performance Report',
    content: 'Quarterly analytics and insights report',
    submitted_by: 'Mike Chen',
    submitted_at: new Date(Date.now() - 86400000),
    comments: [
      { user: 'Client', text: 'Looks great! Can we add competitor data?', timestamp: new Date() }
    ]
  }
];

export default function ClientFeedback({ primaryColor }) {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['client-feedback', workspaceId],
    queryFn: async () => { 
      const posts = await base44.entities.Post.filter({ workspace_id: workspaceId, status: 'pending_approval', sort: '-created_at' });
      return posts;
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedItem, setSelectedItem] = useState(pendingApprovals[0]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const handleApprove = () => {
    toast.success('Approved! Your feedback has been sent to the team.');
    setShowFeedbackDialog(true);
  };

  const handleReject = () => {
    if (!comment.trim()) {
      toast.error('Please provide feedback on what needs to be changed');
      return;
    }
    toast.success('Feedback sent! The team will revise and resubmit.');
    setComment('');
  };

  const handleRequestChanges = () => {
    if (!comment.trim()) {
      toast.error('Please describe the changes needed');
      return;
    }
    toast.success('Change request sent to the team!');
    setComment('');
  };

  const handleAddComment = () => {
    if (!comment.trim()) return;
    toast.success('Comment added');
    setComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pending Approvals</h2>
          <p className="text-slate-500">Review and approve content before publishing</p>
        </div>
        <Badge className="text-white" style={{ backgroundColor: primaryColor }}>
          {pendingApprovals.length} Pending
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Items to Review</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {pendingApprovals.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "w-full p-4 text-left hover:bg-slate-50 transition-colors border-l-4",
                    selectedItem?.id === item.id ? "bg-slate-50" : "border-transparent"
                  )}
                  style={selectedItem?.id === item.id ? { borderLeftColor: primaryColor } : {}}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      item.type === 'post' ? 'bg-blue-50' : 'bg-violet-50'
                    )}>
                      {item.type === 'post' ? (
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-violet-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {moment(item.submitted_at).fromNow()}
                      </p>
                      {item.comments.length > 0 && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          {item.comments.length} comment{item.comments.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detail View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{selectedItem.title}</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Submitted by {selectedItem.submitted_by} • {moment(selectedItem.submitted_at).fromNow()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRequestChanges}
                  className="text-amber-600 hover:bg-amber-50"
                >
                  Request Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={handleApprove}
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content Preview */}
            <div className="p-6 rounded-lg border-2 border-slate-200 bg-slate-50">
              <p className="text-slate-900 mb-4">{selectedItem.content}</p>
              
              {selectedItem.platforms && (
                <div className="flex gap-2 mb-4">
                  {selectedItem.platforms.map((platform) => (
                    <Badge key={platform} variant="outline">{platform}</Badge>
                  ))}
                </div>
              )}

              {selectedItem.media && selectedItem.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {selectedItem.media.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {selectedItem.scheduled_at && (
                <div className="flex items-center gap-2 mt-4 text-sm text-slate-600">
                  <Clock className="w-4 h-4" />
                  Scheduled: {moment(selectedItem.scheduled_at).format('MMM D, YYYY [at] h:mm A')}
                </div>
              )}
            </div>

            {/* Feedback Section */}
            <div>
              <Label className="mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Feedback & Comments
              </Label>
              
              {selectedItem.comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {selectedItem.comments.map((c, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                          {c.user.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{c.user}</p>
                        <p className="text-sm text-slate-600 mt-1">{c.text}</p>
                        <p className="text-xs text-slate-500 mt-1">{moment(c.timestamp).fromNow()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Textarea
                  placeholder="Add your feedback, suggestions, or requested changes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
                <Button onClick={handleAddComment} className="self-end">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Your Experience</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-4">
                How satisfied are you with this content?
              </p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        star <= rating ? "fill-current" : ""
                      )}
                      style={star <= rating ? { color: primaryColor } : { color: '#cbd5e1' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Additional Comments (optional)</Label>
              <Textarea
                placeholder="Share your thoughts..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
                Skip
              </Button>
              <Button
                onClick={() => {
                  toast.success('Thank you for your feedback!');
                  setShowFeedbackDialog(false);
                  setRating(0);
                }}
                className="text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}