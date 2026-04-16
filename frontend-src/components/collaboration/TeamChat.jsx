/**
 * TeamChat.jsx — Real-time team messaging via agent conversations
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useWorkspace } from '@/hooks';
import moment from 'moment';

export default function TeamChat() {
  const { workspaceId, user } = useWorkspace();
  const [message, setMessage] = useState('');
  const scrollRef = useRef(null);
  const qc = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['team-chat', workspaceId],
    queryFn: () => api.entities.Conversation.filter({ workspace_id: workspaceId, type: 'team_chat', sort: '-updated_at', limit: 1 }),
    enabled: !!workspaceId,
    refetchInterval: 10000,
  });

  const conversation = conversations[0];

  const { data: messages = [] } = useQuery({
    queryKey: ['team-chat-messages', conversation?.id],
    queryFn: () => api.agents.getConversation(conversation.id),
    enabled: !!conversation?.id,
    refetchInterval: 5000,
    select: (d) => d?.messages || [],
  });

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMsg = useMutation({
    mutationFn: async (text) => {
      if (!conversation?.id) {
        const conv = await api.entities.Conversation.create({ workspace_id: workspaceId, type: 'team_chat', title: 'Team Chat' });
        return api.agents.addMessage(conv.id, text, user?.display_name || 'Team');
      }
      return api.agents.addMessage(conversation.id, text, user?.display_name || 'Team');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-chat'] }); qc.invalidateQueries({ queryKey: ['team-chat-messages'] }); },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMsg.mutate(message);
    setMessage('');
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4 text-[#d4af37]" />Team Chat
        </CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-4">
        {isLoading ? <Skeleton className="h-20 w-full" /> :
        messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500 py-8">No messages yet. Start the conversation!</p>
        ) : messages.map((msg, i) => (
          <div key={i} className="flex gap-3 mb-4">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-[#d4af37]/20 text-[#d4af37] text-xs">{(msg.role || 'U')[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-slate-900">{msg.role || 'Team'}</span>
                <span className="text-xs text-slate-400">{moment(msg.created_at).fromNow()}</span>
              </div>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg px-3 py-2">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input placeholder="Message your team..." value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
        <Button onClick={handleSend} disabled={!message.trim() || sendMsg.isPending} className="bg-[#d4af37] text-slate-950">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
