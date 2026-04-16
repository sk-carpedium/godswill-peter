import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send,
  Sparkles,
  MoreHorizontal,
  Star,
  Archive,
  Tag,
  User,
  ExternalLink,
  Clock,
  CheckCheck,
  Paperclip,
  Smile,
  ChevronDown } from
'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { toast } from 'sonner';
import { api } from '@/api/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PLATFORM_CONFIG = {
  instagram: { color: '#E1306C', label: 'Instagram' },
  facebook: { color: '#1877F2', label: 'Facebook' },
  twitter: { color: '#000000', label: 'X (Twitter)' },
  linkedin: { color: '#0A66C2', label: 'LinkedIn' },
  tiktok: { color: '#010101', label: 'TikTok' },
  youtube: { color: '#FF0000', label: 'YouTube' },
  threads: { color: '#000000', label: 'Threads' },
  pinterest: { color: '#E60023', label: 'Pinterest' },
  twitch: { color: '#9146FF', label: 'Twitch' },
  bluesky: { color: '#0085FF', label: 'Bluesky' },
  google_business: { color: '#4285F4', label: 'Google Business' },
  kick: { color: '#53FC18', label: 'Kick' },
  rumble: { color: '#85C742', label: 'Rumble' },
  truth_social: { color: '#5448EE', label: 'Truth Social' },
};

export default function ConversationView({ conversation, onSendMessage, onUpdateStatus }) {
  const [message, setMessage] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message);
      setMessage('');
      
      // Auto-update SLA if first response
      if (conversation?.sla && !conversation.sla.first_response_at) {
        onUpdateStatus?.({
          ...conversation,
          sla: {
            ...conversation.sla,
            first_response_at: new Date().toISOString()
          }
        });
      }
    }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    // Real AI reply via POST /ai/invoke-llm
    api.integrations.Core.InvokeLLM({
      prompt: `Generate a helpful, professional reply to this customer message: "${message}"`,
      response_json_schema: { type: 'object', properties: { reply: { type: 'string' } } }
    }).then(result => {
      setMessage(result?.reply || '');
      setIsGeneratingAI(false);
    }).catch(() => {
      setIsGeneratingAI(false);
    });
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Select a conversation</h3>
          <p className="text-slate-500">Choose a conversation from the list to view messages</p>
        </div>
      </div>);

  }

  const sampleMessages = conversation.messages?.length > 0 ? conversation.messages : [
  { id: '1', direction: 'inbound', content: 'Hi! I love your products. Do you ship internationally?', sent_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', direction: 'outbound', content: 'Hello Sarah! Thank you for your interest. Yes, we ship to many countries!', sent_at: new Date(Date.now() - 3000000).toISOString(), sent_by: 'you' },
  { id: '3', direction: 'inbound', content: 'That\'s great! What are the shipping costs to Canada?', sent_at: new Date(Date.now() - 1800000).toISOString() }];


  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={conversation.participant?.profile_image_url} />
              <AvatarFallback className="bg-slate-200">
                {conversation.participant?.display_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-white text-[8px] flex items-center justify-center ring-2 ring-white font-bold"
              style={{ backgroundColor: PLATFORM_CONFIG[conversation.platform]?.color || '#94a3b8' }}
            >
              {conversation.platform?.[0]?.toUpperCase()}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">
                {conversation.participant?.display_name}
              </span>
              {conversation.is_vip &&
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              }
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>{conversation.participant?.username}</span>
              <span>•</span>
              <span>{PLATFORM_CONFIG[conversation.platform]?.label || conversation.platform}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.sla?.response_due_at && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs",
                conversation.sla.breached ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              )}
            >
              <Clock className="w-3 h-3 mr-1" />
              SLA: {moment(conversation.sla.response_due_at).fromNow()}
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-1" />
            View Profile
          </Button>
          <Button variant="outline" size="sm">
            <Tag className="w-4 h-4 mr-1" />
            Add Label
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                onUpdateStatus?.({ ...conversation, is_vip: !conversation.is_vip });
                toast.success(conversation.is_vip ? 'Removed from VIP' : 'Marked as VIP');
              }}>
                <Star className="w-4 h-4 mr-2" />
                {conversation.is_vip ? 'Remove VIP Status' : 'Mark as VIP'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in {conversation.platform}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {sampleMessages.map((msg, index) => {
            const isOutbound = msg.direction === 'outbound';

            return (
              <div
                key={msg.id || index}
                className={cn(
                  "flex",
                  isOutbound ? "justify-end" : "justify-start"
                )}>

                <div className={cn(
                  "max-w-[70%] space-y-1"
                )}>
                  <div className="bg-[#ead485] text-slate-950 px-3 py-2 text-xs font-medium rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground h-8 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">





                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs text-slate-400",
                    isOutbound ? "justify-end" : "justify-start"
                  )}>
                    <span>{moment(msg.sent_at).format('h:mm A')}</span>
                    {isOutbound &&
                    <CheckCheck className="w-3 h-3 text-violet-400" />
                    }
                    {msg.is_ai_generated &&
                    <Badge variant="outline" className="text-[10px] ml-1">
                        <Sparkles className="w-2 h-2 mr-1" />
                        AI
                      </Badge>
                    }
                  </div>
                </div>
              </div>);

          })}
        </div>
      </ScrollArea>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs text-slate-500 shrink-0">Quick replies:</span>
          {[
          "Thanks for reaching out!",
          "Let me check on that",
          "Happy to help!",
          "Can you provide more details?"].
          map((reply, i) =>
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="text-xs shrink-0"
            onClick={() => setMessage(reply)}>

              {reply}
            </Button>
          )}
        </div>
      </div>

      {/* Compose Area */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              placeholder="Type your reply..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[80px] pr-12 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }} />

            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={handleAIGenerate}
              disabled={isGeneratingAI}
              className="gap-2">

              <Sparkles className={cn("w-4 h-4", isGeneratingAI && "animate-spin")} />
              AI Reply
            </Button>
            <Button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950 shadow-md"

            onClick={handleSend}
            disabled={!message.trim()}>

              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>);

}