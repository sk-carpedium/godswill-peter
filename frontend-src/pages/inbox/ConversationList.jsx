import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  Star,
  MoreHorizontal,
  MessageSquare,
  AtSign,
  Heart,
  AlertCircle } from
'lucide-react';
import { cn } from '@/lib/utils';
import moment from 'moment';

const PLATFORM_CONFIG = {
  instagram: { color: '#E1306C', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg> },
  facebook: { color: '#1877F2', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  twitter: { color: '#000000', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  linkedin: { color: '#0A66C2', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
  tiktok: { color: '#010101', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  youtube: { color: '#FF0000', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
  threads: { color: '#000000', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.129-.73-1.818-1.857-1.818-3.336 0-1.501.697-2.748 1.98-3.549.932-.582 2.106-.873 3.408-.846.896.017 1.727.178 2.508.488v-.695c0-1.173-.394-2.02-1.174-2.522-.651-.418-1.527-.59-2.612-.518-1.256.085-2.29.423-3.074.998l-.546-1.938c.968-.684 2.297-1.134 3.952-1.243 1.443-.097 2.718.13 3.796.676 1.326.672 2.015 1.854 2.048 3.512v2.254c1.175.584 2.09 1.428 2.697 2.49.739 1.29.883 3.008-.235 4.855-1.26 2.082-3.5 3.136-6.848 3.213z"/></svg> },
  pinterest: { color: '#E60023', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/></svg> },
  twitch: { color: '#9146FF', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg> },
  bluesky: { color: '#0085FF', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.579 6.87-1.5 7.823-4.308.953 2.808 2.81 9.886 7.823 4.308 4.558-5.073 1.082-6.498-2.83-7.078-.14-.016-.277-.034-.415-.056.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/></svg> },
  google_business: { color: '#4285F4', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg> },
  kick: { color: '#53FC18', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.45 3.73L12 11.63 4.55 7.91 12 4.18zM4 9.68l7 3.5v7.64l-7-3.5V9.68zm9 11.14v-7.64l7-3.5v7.64l-7 3.5z"/></svg> },
  rumble: { color: '#85C742', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> },
  truth_social: { color: '#5448EE', svg: <svg viewBox="0 0 24 24" className="w-2.5 h-2.5" fill="currentColor"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16zm3.5 5.5l-3 3-3-3-1.5 1.5 3 3-3 3 1.5 1.5 3-3 3 3 1.5-1.5-3-3 3-3-1.5-1.5z"/></svg> },
};

const typeIcons = {
  dm: MessageSquare,
  comment: AtSign,
  mention: AtSign,
  reply: Heart
};

const sentimentColors = {
  positive: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-700',
  negative: 'bg-red-100 text-red-700'
};

export default function ConversationList({
  conversations = [],
  selectedId,
  onSelect,
  onSearch,
  searchQuery = ''
}) {
  const sampleConversations = conversations.length > 0 ? conversations : [
  {
    id: '1',
    platform: 'instagram',
    type: 'dm',
    participant: { display_name: 'Sarah Chen', username: '@sarahchen', is_verified: true },
    messages: [{ content: 'Hi! I love your products. Do you ship internationally?' }],
    sentiment: 'positive',
    priority: 'high',
    status: 'new',
    is_vip: true,
    last_message_at: new Date().toISOString(),
    unread_count: 2
  },
  {
    id: '2',
    platform: 'twitter',
    type: 'mention',
    participant: { display_name: 'Mike Johnson', username: '@mikej' },
    messages: [{ content: '@yourbrand Just tried your new feature and its amazing! 🔥' }],
    sentiment: 'positive',
    priority: 'normal',
    status: 'open',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: 0
  },
  {
    id: '3',
    platform: 'facebook',
    type: 'comment',
    participant: { display_name: 'Emma Wilson', username: 'emmaw' },
    messages: [{ content: 'When will this be back in stock? Been waiting for weeks...' }],
    sentiment: 'negative',
    priority: 'urgent',
    status: 'new',
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    unread_count: 1
  }];


  return (
    <div className="flex flex-col h-full border-r border-slate-200 bg-white">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            className="pl-9" />

        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <Button variant="outline" size="sm" className="bg-slate-50 text-[#d4af37] px-3 py-2 text-xs font-medium rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground h-8 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">
            <Filter className="w-4 h-4 mr-1" />
            All
          </Button>
          <Button variant="outline" size="sm" className="bg-slate-50 text-[#d4af37] px-3 py-2 text-xs font-medium rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground h-8 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">
            Unread
          </Button>
          <Button variant="outline" size="sm" className="bg-slate-50 text-[#d4af37] px-3 py-2 text-xs font-medium rounded-md shadow-sm hover:bg-accent hover:text-accent-foreground h-8 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">
            VIP
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-slate-100">
          {sampleConversations.map((conversation) => {
            const TypeIcon = typeIcons[conversation.type] || MessageSquare;
            const isSelected = selectedId === conversation.id;

            return (
              <div
                key={conversation.id}
                onClick={() => onSelect?.(conversation)}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:bg-slate-50",
                  isSelected && "bg-violet-50 border-l-2 border-violet-600"
                )}>

                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.participant?.profile_image_url} />
                      <AvatarFallback className="bg-slate-200 text-[#d4af37] rounded-full flex h-full w-full items-center justify-center">
                        {conversation.participant?.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {(() => {
                      const cfg = PLATFORM_CONFIG[conversation.platform];
                      return (
                        <div
                          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white"
                          style={{ backgroundColor: cfg?.color || '#94a3b8', color: '#fff' }}
                        >
                          {cfg ? cfg.svg : <span className="text-[7px]">{conversation.platform?.[0]?.toUpperCase()}</span>}
                        </div>
                      );
                    })()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-transparent text-[#d4af37] text-sm font-medium truncate">
                          {conversation.participant?.display_name}
                        </span>
                        {conversation.is_vip &&
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        }
                        {conversation.participant?.is_verified &&
                        <Badge variant="secondary" className="text-[10px] px-1">✓</Badge>
                        }
                      </div>
                      <span className="text-xs text-slate-400">
                        {moment(conversation.last_message_at).fromNow(true)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 truncate mb-2">
                      {conversation.messages?.[conversation.messages.length - 1]?.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {conversation.type}
                        </Badge>
                        {conversation.sentiment &&
                        <Badge className={cn("text-xs", sentimentColors[conversation.sentiment])}>
                            {conversation.sentiment}
                          </Badge>
                        }
                      </div>
                      
                      {conversation.unread_count > 0 &&
                      <Badge className="shadow-sm py-2 hover:bg-accent hover:text-accent-foreground h-8 bg-[#d4af37] text-slate-950 px-3 text-xs font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:#d4af37">
                          {conversation.unread_count}
                        </Badge>
                      }
                    </div>
                  </div>
                </div>
                
                {conversation.priority === 'urgent' &&
                <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Urgent - Negative sentiment detected</span>
                  </div>
                }
              </div>);

          })}
        </div>
      </ScrollArea>
    </div>);

}