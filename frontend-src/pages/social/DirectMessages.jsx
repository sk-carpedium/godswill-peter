import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send, Paperclip, Smile, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const conversations = [
{ id: '1', name: 'Sarah Johnson', lastMessage: 'Thanks for the quick response!', timestamp: new Date(Date.now() - 300000), unread: 2, status: 'online' },
{ id: '2', name: 'Mike Chen', lastMessage: 'When will you restock?', timestamp: new Date(Date.now() - 3600000), unread: 0, status: 'offline' },
{ id: '3', name: 'Lisa Anderson', lastMessage: 'Love your products! ❤️', timestamp: new Date(Date.now() - 7200000), unread: 1, status: 'online' }];


const messages = [
{ id: '1', text: 'Hi! I have a question about your product', sender: 'them', timestamp: new Date(Date.now() - 600000) },
{ id: '2', text: 'Of course! How can I help you?', sender: 'me', timestamp: new Date(Date.now() - 300000) },
{ id: '3', text: 'Thanks for the quick response!', sender: 'them', timestamp: new Date(Date.now() - 60000) }];


export default function DirectMessages({ platformName, platformColor = 'violet' }) {
  const [selectedConvo, setSelectedConvo] = useState(conversations[0]);
  const [messageText, setMessageText] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="grid grid-cols-12 gap-6 h-[700px]">
      <Card className="col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Messages</CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search messages..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[580px]">
            {conversations.map((convo) =>
            <button
              key={convo.id}
              onClick={() => setSelectedConvo(convo)}
              className={cn("w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-l-4", selectedConvo.id === convo.id ? "bg-violet-50 border-violet-600" : "border-transparent")}>

                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-slate-200 text-[#d4af37] rounded-full flex h-full w-full items-center justify-center">{convo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {convo.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900">{convo.name}</p>
                    <span className="text-xs text-slate-500">{moment(convo.timestamp).format('h:mm A')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-600 truncate">{convo.lastMessage}</p>
                    {convo.unread > 0 && <Badge className={cn("ml-2", `bg-${platformColor}-600`)}>{convo.unread}</Badge>}
                  </div>
                </div>
              </button>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="col-span-8 flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className={cn(`bg-${platformColor}-100`, `text-${platformColor}-600`)}>{selectedConvo.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedConvo.name}</p>
                <p className="text-xs text-slate-500">{selectedConvo.status === 'online' ? 'Active now' : 'Offline'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <ScrollArea className="h-[480px] pr-4">
            <div className="space-y-4">
              {messages.map((msg) =>
              <div key={msg.id} className={cn("flex", msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                  <div className={cn("max-w-[70%] rounded-2xl px-4 py-2", msg.sender === 'me' ? `bg-${platformColor}-600 text-white` : 'bg-slate-100 text-slate-900')}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={cn("text-xs mt-1", msg.sender === 'me' ? 'text-white/70' : 'text-slate-500')}>{moment(msg.timestamp).format('h:mm A')}</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Paperclip className="w-4 h-4" /></Button>
            <Input placeholder="Type a message..." value={messageText} onChange={(e) => setMessageText(e.target.value)} className="flex-1" />
            <Button variant="ghost" size="icon"><Smile className="w-4 h-4" /></Button>
            <Button size="icon" className={cn(`bg-${platformColor}-600`, `hover:bg-${platformColor}-700`)}><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </Card>
    </div>);

}