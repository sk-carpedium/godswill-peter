import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, Reply, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { toast } from 'sonner';

const reviews = [
  { id: '1', author: 'Jennifer Lee', rating: 5, text: 'Excellent service! Highly recommend. The team was professional and delivered beyond expectations.', helpful: 24, timestamp: new Date(Date.now() - 86400000), replied: true },
  { id: '2', author: 'Robert Taylor', rating: 4, text: 'Good overall experience, minor issues with delivery timing but quality was great.', helpful: 12, timestamp: new Date(Date.now() - 172800000), replied: false },
  { id: '3', author: 'Maria Garcia', rating: 5, text: 'Outstanding! Will definitely come back. Customer service was amazing!', helpful: 18, timestamp: new Date(Date.now() - 259200000), replied: true },
  { id: '4', author: 'David Kim', rating: 3, text: 'Average experience. Could be better in terms of communication.', helpful: 5, timestamp: new Date(Date.now() - 345600000), replied: false },
];

export default function ReviewsManager({ platformName, platformColor = 'violet' }) {
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  const handleReply = () => {
    if (!replyText.trim()) return;
    toast.success('Response posted!');
    setReplyingTo(null);
    setReplyText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className={cn("p-4 rounded-xl border-2", replyingTo === review.id ? "border-violet-300 bg-violet-50/50" : "border-slate-200")}>
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className={cn(`bg-${platformColor}-100`, `text-${platformColor}-600`)}>{review.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{review.author}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={cn("w-4 h-4", i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">{moment(review.timestamp).fromNow()}</span>
                        </div>
                      </div>
                      {review.replied && <Badge className="bg-green-50 text-green-700">Responded</Badge>}
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{review.text}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Helpful ({review.helpful})
                      </Button>
                      {replyingTo === review.id ? (
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="h-7 text-xs">Cancel</Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(review.id)} className="h-7 text-xs">
                          <Reply className="w-3 h-3 mr-1" />Respond
                        </Button>
                      )}
                    </div>
                    {replyingTo === review.id && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <Textarea placeholder="Write your response..." value={replyText} onChange={(e) => setReplyText(e.target.value)} className="min-h-[80px]" />
                        <Button size="sm" onClick={handleReply} className={cn(`bg-${platformColor}-600`, `hover:bg-${platformColor}-700`)}>
                          <Send className="w-3 h-3 mr-1" />Post Response
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-slate-900">{avgRating}</p>
              <div className="flex justify-center my-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-5 h-5", i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                ))}
              </div>
              <p className="text-sm text-slate-500">{reviews.length} reviews</p>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = (count / reviews.length) * 100;
                return (
                  <div key={star} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600 w-8">{star}★</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-slate-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Reviews</span>
              <span className="font-semibold">{reviews.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pending Response</span>
              <span className="font-semibold text-amber-600">{reviews.filter(r => !r.replied).length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Avg Response Time</span>
              <span className="font-semibold">3.2 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}