import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  AlertCircle,
  Clock,
  MessageSquare,
  User,
  CheckCircle2,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

export default function PriorityInbox({ conversations = [], onSelectConversation }) {
  const [activeTab, setActiveTab] = useState('vip');
  const [searchQuery, setSearchQuery] = useState('');

  const vipConversations = conversations.filter(c => c.is_vip);
  const urgentConversations = conversations.filter(c => 
    c.priority === 'urgent' || c.priority === 'high'
  );
  const slaBreached = conversations.filter(c => c.sla?.breached);
  const needsResponse = conversations.filter(c => 
    c.status === 'new' || c.status === 'open'
  );

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return null;
    const now = moment();
    const due = moment(dueDate);
    const diff = due.diff(now, 'minutes');
    
    if (diff < 0) return { text: 'Overdue', color: 'text-red-600', urgent: true };
    if (diff < 60) return { text: `${diff}m`, color: 'text-red-600', urgent: true };
    if (diff < 240) return { text: `${Math.floor(diff / 60)}h`, color: 'text-amber-600', urgent: false };
    return { text: `${Math.floor(diff / 60)}h`, color: 'text-slate-500', urgent: false };
  };

  const renderConversation = (conv) => {
    const timeRemaining = getTimeRemaining(conv.sla?.response_due_at);
    
    return (
      <div
        key={conv.id}
        onClick={() => onSelectConversation?.(conv)}
        className={cn(
          "p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer",
          conv.sla?.breached ? "border-red-200 bg-red-50/50" : "border-slate-200 hover:border-[#d4af37]",
          conv.status === 'new' && "bg-blue-50/30"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {conv.is_vip && (
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              )}
              <p className="font-medium text-slate-900 truncate">
                {conv.participant?.username || 'Unknown User'}
              </p>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  conv.priority === 'urgent' && "bg-red-100 text-red-700",
                  conv.priority === 'high' && "bg-orange-100 text-orange-700",
                  conv.priority === 'normal' && "bg-slate-100 text-slate-700"
                )}
              >
                {conv.priority}
              </Badge>
            </div>
            
            <p className="text-sm text-slate-600 truncate mb-2">
              {conv.messages?.[conv.messages.length - 1]?.content || 'No messages'}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {conv.platform}
              </span>
              <span>•</span>
              <span>{moment(conv.last_message_at).fromNow()}</span>
              {conv.assigned_to && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {conv.assigned_to.split('@')[0]}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {timeRemaining && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs font-mono",
                  timeRemaining.urgent ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                )}
              >
                <Clock className="w-3 h-3 mr-1" />
                {timeRemaining.text}
              </Badge>
            )}
            {conv.sla?.breached && (
              <Badge className="bg-red-500 text-white text-xs">
                SLA Breached
              </Badge>
            )}
            {conv.status === 'new' && (
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Star className="w-5 h-5 text-[#d4af37]" />
          Priority Inbox
        </h2>
        <div className="flex items-center gap-2">
          <Badge className="bg-red-100 text-red-700">
            {slaBreached.length} SLA Breach
          </Badge>
          <Badge className="bg-amber-100 text-amber-700">
            {urgentConversations.length} Urgent
          </Badge>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vip" className="gap-2">
            <Star className="w-4 h-4" />
            VIPs ({vipConversations.length})
          </TabsTrigger>
          <TabsTrigger value="urgent" className="gap-2">
            <AlertCircle className="w-4 h-4" />
            Urgent ({urgentConversations.length})
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-2">
            <Clock className="w-4 h-4" />
            SLA ({slaBreached.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            All ({needsResponse.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vip" className="mt-4 space-y-3">
          {vipConversations.length > 0 ? (
            vipConversations.map(renderConversation)
          ) : (
            <Card className="py-8">
              <div className="text-center">
                <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No VIP conversations</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="urgent" className="mt-4 space-y-3">
          {urgentConversations.length > 0 ? (
            urgentConversations.map(renderConversation)
          ) : (
            <Card className="py-8">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-slate-500">All urgent items handled</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sla" className="mt-4 space-y-3">
          {slaBreached.length > 0 ? (
            slaBreached.map(renderConversation)
          ) : (
            <Card className="py-8">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-slate-500">No SLA breaches</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-3">
          {needsResponse.length > 0 ? (
            needsResponse.map(renderConversation)
          ) : (
            <Card className="py-8">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto mb-3" />
                <p className="text-slate-500">Inbox zero achieved!</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}