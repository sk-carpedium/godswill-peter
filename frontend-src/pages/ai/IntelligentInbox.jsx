import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquare,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Bot,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import moment from 'moment';

const conversations = [
  {
    id: '1',
    contact: { name: 'Sarah Johnson', avatar: 'SJ', vip: true },
    platform: 'instagram',
    lastMessage: 'When will my order ship?',
    sentiment: 'neutral',
    priority: 'high',
    aiCategory: 'shipping_inquiry',
    unread: true,
    timestamp: '5m ago',
    suggestedReply: 'Hi Sarah! Your order is being processed and will ship within 24 hours. Tracking details will be sent to your email. Thank you for your patience! 📦'
  },
  {
    id: '2',
    contact: { name: 'Mike Chen', avatar: 'MC', vip: false },
    platform: 'twitter',
    lastMessage: 'This product is amazing! Best purchase ever!',
    sentiment: 'positive',
    priority: 'medium',
    aiCategory: 'positive_feedback',
    unread: true,
    timestamp: '12m ago',
    suggestedReply: 'Thank you so much, Mike! 🌟 We\'re thrilled you love it! Would you mind sharing your experience with others? We\'d love to feature your story!'
  },
  {
    id: '3',
    contact: { name: 'Emily Davis', avatar: 'ED', vip: false },
    platform: 'facebook',
    lastMessage: 'Very disappointed with the quality. Not what I expected.',
    sentiment: 'negative',
    priority: 'urgent',
    aiCategory: 'complaint',
    unread: true,
    timestamp: '2m ago',
    suggestedReply: 'Hi Emily, I\'m sorry to hear about your experience. We take quality seriously. I\'d like to make this right - could you DM me your order number? We\'ll arrange a replacement or full refund immediately.'
  },
  {
    id: '4',
    contact: { name: 'Alex Rivera', avatar: 'AR', vip: true },
    platform: 'instagram',
    lastMessage: 'Do you offer wholesale pricing?',
    sentiment: 'neutral',
    priority: 'high',
    aiCategory: 'sales_opportunity',
    unread: true,
    timestamp: '18m ago',
    suggestedReply: 'Hi Alex! Yes, we do offer wholesale pricing for bulk orders. I\'d love to discuss this with you. Could you share more about your needs? Let\'s schedule a quick call!'
  }
];

export default function IntelligentInbox() {
  const [selectedConv, setSelectedConv] = useState(null);
  const [customReply, setCustomReply] = useState('');
  const [autoTriageEnabled, setAutoTriageEnabled] = useState(true);

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-[#d4af37]/20 text-[#d4af37]';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Conversation List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Inbox</CardTitle>
            <Badge className="bg-[#d4af37]/20 text-[#d4af37]">
              {conversations.filter(c => c.unread).length} New
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all border",
                selectedConv?.id === conv.id 
                  ? "bg-[#d4af37]/10 border-[#d4af37]" 
                  : "hover:bg-slate-50 border-transparent",
                conv.priority === 'urgent' && "border-red-200"
              )}
            >
              <div className="flex items-start gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-200 text-xs">
                    {conv.contact.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <p className="font-semibold text-sm text-slate-900 truncate">
                      {conv.contact.name}
                    </p>
                    {conv.contact.vip && (
                      <Badge className="bg-purple-100 text-purple-700 text-xs px-1">VIP</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate mb-1">{conv.lastMessage}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-xs", getPriorityColor(conv.priority))}>
                      {conv.priority}
                    </Badge>
                    <span className="text-xs text-slate-400">{conv.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conversation Detail */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#d4af37]" />
              AI-Powered Response
            </CardTitle>
            {selectedConv && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {selectedConv.aiCategory.replace('_', ' ')}
                </Badge>
                <Badge className={cn("text-xs", getSentimentColor(selectedConv.sentiment))}>
                  {selectedConv.sentiment}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedConv ? (
            <>
              {/* AI Analysis */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-slate-900 mb-2">AI Analysis</h4>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>• <strong>Sentiment:</strong> {selectedConv.sentiment} (AI detected)</p>
                      <p>• <strong>Category:</strong> {selectedConv.aiCategory.replace('_', ' ')}</p>
                      <p>• <strong>Priority:</strong> {selectedConv.priority} - 
                        {selectedConv.priority === 'urgent' && ' Requires immediate response'}
                        {selectedConv.priority === 'high' && ' VIP customer or sales opportunity'}
                        {selectedConv.priority === 'medium' && ' Standard response time'}
                      </p>
                      {selectedConv.contact.vip && (
                        <p>• <strong>VIP Customer:</strong> High-value relationship</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Suggested Reply */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#d4af37]" />
                  AI-Suggested Reply
                </Label>
                <div className="p-3 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/30">
                  <p className="text-sm text-slate-700">{selectedConv.suggestedReply}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                    onClick={() => setCustomReply(selectedConv.suggestedReply)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Use This Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Alternative
                  </Button>
                </div>
              </div>

              {/* Custom Reply */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your Reply</Label>
                <Textarea
                  placeholder="Type your custom response or edit the AI suggestion..."
                  value={customReply}
                  onChange={(e) => setCustomReply(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Quick Actions:</span> Add emoji, Insert product link, Attach image
                  </div>
                  <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>

              {/* Auto-Triage Info */}
              {autoTriageEnabled && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 text-xs text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>This conversation was automatically prioritized and categorized by AI</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>Select a conversation to see AI-powered insights</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}