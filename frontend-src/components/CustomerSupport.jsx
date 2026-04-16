import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, HelpCircle, Sparkles, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import MessageBubble from '@/components/MessageBubble';

export default function CustomerSupport() {
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (currentConversation) {
            const unsubscribe = api.agents.subscribeToConversation(currentConversation.id, (data) => {
                setMessages(data.messages || []);
                setIsLoading(false);
            });
            return unsubscribe;
        }
    }, [currentConversation?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const convos = await api.agents.listConversations({
                agent_name: 'customer_support'
            });
            setConversations(convos || []);
            if (convos?.length > 0) {
                const latestConvo = await api.agents.getConversation(convos[0].id);
                setCurrentConversation(latestConvo);
                setMessages(latestConvo.messages || []);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        }
    };

    const startNewConversation = async () => {
        try {
            const newConvo = await api.agents.createConversation({
                agent_name: 'customer_support',
                metadata: {
                    name: 'Support Chat',
                    description: 'Customer support conversation'
                }
            });
            setCurrentConversation(newConvo);
            setMessages([]);
            setConversations([newConvo, ...conversations]);
        } catch (error) {
            console.error('Error creating conversation:', error);
            toast.error('Failed to start new conversation');
        }
    };

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;

        let conversation = currentConversation;
        
        if (!conversation) {
            try {
                conversation = await api.agents.createConversation({
                    agent_name: 'customer_support',
                    metadata: {
                        name: 'Support Chat',
                        description: 'Customer support conversation'
                    }
                });
                setCurrentConversation(conversation);
                setConversations([conversation, ...conversations]);
            } catch (error) {
                console.error('Error creating conversation:', error);
                toast.error('Failed to start conversation');
                return;
            }
        }

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            await api.agents.addMessage(conversation, {
                role: 'user',
                content: userMessage
            });
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const quickQuestions = [
        "How do I connect a new social media account?",
        "How can I schedule a post?",
        "How do I view my analytics?",
        "How do I add team members?",
        "How do I set up automated posting?",
        "How can I track my revenue?"
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-8 h-8 text-[#d4af37]" />
                        Customer Support
                    </h1>
                    <p className="text-slate-600 mt-1">Get help from our AI assistant</p>
                </div>
                <Button onClick={startNewConversation} className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    New Chat
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat Interface */}
                <div className="lg:col-span-2">
                    <Card className="h-[700px] flex flex-col">
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-[#d4af37]" />
                                AI Support Assistant
                                <Badge variant="secondary" className="ml-2">Online</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0">
                            {/* Messages */}
                            <ScrollArea className="flex-1 p-6">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-[#d4af37]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">Welcome to Support</h3>
                                            <p className="text-slate-600 mt-1">Ask me anything about SocialHub or your data</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((message, index) => {
                                            const isUser = message.role === 'user';
                                            return (
                                                <div
                                                    key={index}
                                                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {!isUser && (
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-[#d4af37] text-slate-950">
                                                                <Sparkles className="w-4 h-4" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <MessageBubble message={message} />
                                                    {isUser && (
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-slate-200">U</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {isLoading && (
                                            <div className="flex gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="bg-[#d4af37] text-slate-950">
                                                        <Sparkles className="w-4 h-4" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="bg-slate-100 rounded-2xl px-4 py-2.5">
                                                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                                                </div>
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Input */}
                            <div className="border-t p-4">
                                <div className="flex gap-2">
                                    <Textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your question here..."
                                        className="min-h-[60px] max-h-[120px] resize-none"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || isLoading}
                                        className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Questions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Questions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {quickQuestions.map((question, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    className="w-full justify-start text-left h-auto py-3 px-4"
                                    onClick={() => setInput(question)}
                                >
                                    <span className="text-sm line-clamp-2">{question}</span>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Help Resources */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Help Resources</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <HelpCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-sm text-slate-900">Knowledge Base</h4>
                                    <p className="text-xs text-slate-600 mt-1">Browse articles and guides</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-sm text-slate-900">WhatsApp Support</h4>
                                    <p className="text-xs text-slate-600 mt-1">Connect via WhatsApp</p>
                                    <a 
                                        href={api.agents.getWhatsAppConnectURL('customer_support')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-[#d4af37] hover:underline mt-1 inline-block"
                                    >
                                        Connect Now →
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}