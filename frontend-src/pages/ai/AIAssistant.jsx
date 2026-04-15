import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureTooltip } from '@/components/FeatureTooltip';
import {
  Sparkles,
  Send,
  Loader2,
  Wand2,
  TrendingUp,
  Calendar,
  Hash,
  MessageSquare,
  Target,
  PenSquare,
  BarChart3,
  DollarSign,
  Zap,
  Users,
  Clock,
  TestTube2,
  FileText,
  Upload,
  Palette,
  Download,
  Image,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RevenueOptimizer from '@/components/ai/RevenueOptimizer';
import ProactiveInsights from '@/components/ai/ProactiveInsights';
import IntelligentInbox from '@/components/ai/IntelligentInbox';
import AIWorkloadBalancer from '@/components/ai/AIWorkloadBalancer';
import CrisisDetector from '@/components/ai/CrisisDetector';
import TrendResponder from '@/components/ai/TrendResponder';
import MessageBubble from '@/components/MessageBubble';
import StrategicInsights from '@/components/ai/StrategicInsights';
import CampaignStrategyBuilder from '@/components/ai/CampaignStrategyBuilder';

const suggestedPrompts = [
{ icon: TrendingUp, text: "What actually drives revenue or leads?", category: "Analytics" },
{ icon: BarChart3, text: "Which content types perform best?", category: "Analytics" },
{ icon: Target, text: "What time should I post for maximum engagement?", category: "Analytics" },
{ icon: PenSquare, text: "Write a post about our new product launch", category: "Content" },
{ icon: Hash, text: "Suggest trending hashtags for my industry", category: "Hashtags" },
{ icon: Calendar, text: "Create a content calendar for next week", category: "Planning" }];


export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [currentConversation, setCurrentConversation] = useState(null);
  const scrollRef = useRef(null);
  
  // New feature states
  const [abTestContent, setAbTestContent] = useState('');
  const [abVariations, setAbVariations] = useState([]);
  const [isGeneratingAB, setIsGeneratingAB] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [optimalTimes, setOptimalTimes] = useState(null);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [calendarGoal, setCalendarGoal] = useState('');
  const [calendarIndustry, setCalendarIndustry] = useState('');
  const [calendarDuration, setCalendarDuration] = useState('week');
  const [generatedCalendar, setGeneratedCalendar] = useState(null);
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
  const [brandStyleGuide, setBrandStyleGuide] = useState(null);
  const [isUploadingGuide, setIsUploadingGuide] = useState(false);

  useEffect(() => {
    loadWorkspace();
    initializeConversation();
  }, []);

  const loadWorkspace = async () => {
    try {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length > 0) {
        setWorkspaceId(workspaces[0].id);
      }
    } catch (error) {
      console.error('Failed to load workspace:', error);
    }
  };

  const initializeConversation = async () => {
    try {
      const conversations = await base44.agents.listConversations({
        agent_name: 'customer_support'
      });
      
      if (conversations?.length > 0) {
        const latestConvo = await base44.agents.getConversation(conversations[0].id);
        setCurrentConversation(latestConvo);
        setMessages(latestConvo.messages || []);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  useEffect(() => {
    if (currentConversation) {
      const unsubscribe = base44.agents.subscribeToConversation(currentConversation.id, (data) => {
        setMessages(data.messages || []);
        setIsLoading(false);
      });
      return unsubscribe;
    }
  }, [currentConversation?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (promptText) => {
    const prompt = promptText || input;
    if (!prompt.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);

    try {
      let conversation = currentConversation;
      
      if (!conversation) {
        conversation = await base44.agents.createConversation({
          agent_name: 'customer_support',
          metadata: {
            name: 'AI Assistant Chat',
            description: 'AI Assistant conversation'
          }
        });
        setCurrentConversation(conversation);
      }

      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: prompt
      });
    } catch (error) {
      console.error('AI Assistant error:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      }]);
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  const generateABVariations = async () => {
    if (!abTestContent.trim()) return;
    setIsGeneratingAB(true);
    try {
      // AI-powered A/B variations - works for all Growth+ plans
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 A/B test variations for this social media post. Each variation should test a different element (headline, CTA, tone, emoji usage, etc.).

Original post:
${abTestContent}

${brandStyleGuide ? `Brand style guide context: ${JSON.stringify(brandStyleGuide)}` : ''}

Return a JSON array with variations, each having: variation_name, content, test_focus, expected_outcome`,
        response_json_schema: {
          type: "object",
          properties: {
            variations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  variation_name: { type: "string" },
                  content: { type: "string" },
                  test_focus: { type: "string" },
                  expected_outcome: { type: "string" }
                }
              }
            }
          }
        }
      });
      setAbVariations(response.variations || []);
    } catch (error) {
      console.error('Failed to generate variations:', error);
      // Fallback to sample variations
      setAbVariations([
        {
          variation_name: "Emoji-Heavy Version",
          content: abTestContent + " 🔥✨💪",
          test_focus: "Emoji usage impact",
          expected_outcome: "Higher engagement from younger demographics"
        },
        {
          variation_name: "CTA-Focused Version",
          content: abTestContent + "\n\nTap the link in bio now! 👆",
          test_focus: "Strong call-to-action",
          expected_outcome: "Increased click-through rate"
        },
        {
          variation_name: "Question Format",
          content: "What if " + abTestContent.toLowerCase() + " Would you try it?",
          test_focus: "Engagement through questions",
          expected_outcome: "More comments and discussions"
        }
      ]);
    } finally {
      setIsGeneratingAB(false);
    }
  };

  const getOptimalPostingTimes = async () => {
    setIsLoadingTimes(true);
    try {
      const posts = await base44.entities.Post.filter({ workspace_id: workspaceId });
      const analytics = await base44.entities.Analytics.filter({ workspace_id: workspaceId });
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on historical performance data, suggest optimal posting times for ${selectedPlatform}.

Historical data: ${JSON.stringify({ posts: posts.slice(0, 20), analytics: analytics.slice(0, 20) })}

Analyze engagement patterns by day of week and time of day. Return optimal posting schedule.`,
        response_json_schema: {
          type: "object",
          properties: {
            platform: { type: "string" },
            best_times: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  time: { type: "string" },
                  engagement_score: { type: "number" },
                  rationale: { type: "string" }
                }
              }
            },
            insights: { type: "string" }
          }
        }
      });
      setOptimalTimes(response);
    } catch (error) {
      console.error('Failed to get optimal times:', error);
    } finally {
      setIsLoadingTimes(false);
    }
  };

  const generateContentCalendar = async () => {
    if (!calendarGoal.trim()) return;
    setIsGeneratingCalendar(true);
    try {
      const daysCount = calendarDuration === 'week' ? 7 : 30;
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed ${daysCount}-day AI-powered content calendar with comprehensive content ideas.

Goal: ${calendarGoal}
Industry: ${calendarIndustry || 'general'}
Duration: ${calendarDuration}
${brandStyleGuide ? `Brand guidelines: ${JSON.stringify(brandStyleGuide)}` : ''}

For each day, provide:
1. Platform-specific content formats (Instagram Reel vs Story, TikTok vs YouTube Shorts, LinkedIn Article vs Post, etc.)
2. Detailed content ideas with hooks and key messaging
3. Visual suggestions (image concepts, video script outlines, thumbnail ideas)
4. Caption copy with CTAs
5. Trending topics and hashtag strategy
6. Optimal posting times
7. Content type variety (educational, entertaining, promotional, UGC, behind-the-scenes, etc.)

Ensure content diversity across the calendar period and align with current trends.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            calendar: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  date: { type: "string" },
                  platforms: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        platform: { type: "string" },
                        format: { type: "string" }
                      }
                    }
                  },
                  content_type: { type: "string" },
                  content_idea: { type: "string" },
                  hook: { type: "string" },
                  caption: { type: "string" },
                  visual_concept: {
                    type: "object",
                    properties: {
                      image_idea: { type: "string" },
                      video_script: { type: "string" },
                      thumbnail_concept: { type: "string" }
                    }
                  },
                  hashtags: { type: "array", items: { type: "string" } },
                  optimal_time: { type: "string" },
                  trending_topic: { type: "string" },
                  cta: { type: "string" }
                }
              }
            },
            strategy_notes: { type: "string" },
            content_mix: {
              type: "object",
              properties: {
                educational: { type: "number" },
                entertaining: { type: "number" },
                promotional: { type: "number" },
                ugc: { type: "number" }
              }
            }
          }
        }
      });
      setGeneratedCalendar(response);
    } catch (error) {
      console.error('Failed to generate calendar:', error);
    } finally {
      setIsGeneratingCalendar(false);
    }
  };

  const exportCalendarToCSV = () => {
    if (!generatedCalendar?.calendar) return;
    
    const headers = ['Date', 'Day', 'Platforms', 'Content Type', 'Idea', 'Hook', 'Caption', 'Visual Concept', 'Video Script', 'Hashtags', 'Optimal Time', 'Trending Topic', 'CTA'];
    const rows = generatedCalendar.calendar.map(day => [
      day.date,
      day.day,
      day.platforms?.map(p => `${p.platform} (${p.format})`).join('; ') || '',
      day.content_type || '',
      day.content_idea || '',
      day.hook || '',
      day.caption || '',
      day.visual_concept?.image_idea || '',
      day.visual_concept?.video_script || '',
      day.hashtags?.join(', ') || '',
      day.optimal_time || '',
      day.trending_topic || '',
      day.cta || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-calendar-${calendarDuration}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportCalendarToICal = () => {
    if (!generatedCalendar?.calendar) return;
    
    const icalEvents = generatedCalendar.calendar.map(day => {
      const startDate = new Date(day.date);
      const [hour, minute] = (day.optimal_time || '09:00').split(':');
      startDate.setHours(parseInt(hour), parseInt(minute), 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 30);
      
      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      return [
        'BEGIN:VEVENT',
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${day.content_type || 'Social Media Post'} - ${day.platforms?.map(p => p.platform).join(', ') || 'Multi-platform'}`,
        `DESCRIPTION:${day.content_idea}\\n\\nHook: ${day.hook || ''}\\n\\nHashtags: ${day.hashtags?.join(' ') || ''}`,
        `LOCATION:Social Media`,
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');
    
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SocialHub//Content Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      icalEvents,
      'END:VCALENDAR'
    ].join('\r\n');
    
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-calendar-${calendarDuration}.ics`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBrandGuideUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploadingGuide(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            brand_name: { type: "string" },
            tone: { type: "string" },
            voice: { type: "string" },
            colors: { type: "array", items: { type: "string" } },
            fonts: { type: "array", items: { type: "string" } },
            key_messages: { type: "array", items: { type: "string" } },
            banned_words: { type: "array", items: { type: "string" } },
            target_audience: { type: "string" }
          }
        }
      });
      
      if (extracted.status === 'success') {
        setBrandStyleGuide(extracted.output);
      }
    } catch (error) {
      console.error('Failed to upload brand guide:', error);
    } finally {
      setIsUploadingGuide(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">AI Command Center</h1>
        <p className="text-slate-500 mt-1">Proactive insights, revenue optimization, and intelligent automation</p>
      </div>

      <Tabs defaultValue="strategy" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-11 gap-2">
          <TabsTrigger value="strategy">
            <Target className="w-4 h-4 mr-2" />
            Strategy
          </TabsTrigger>
          <TabsTrigger value="campaign">
            <TrendingUp className="w-4 h-4 mr-2" />
            Campaign
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Zap className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
          <FeatureTooltip
            title="A/B Testing"
            description="Generate multiple variations of your content to test different headlines, CTAs, tones, and emoji usage. Compare performance to find what works best."
          >
            <TabsTrigger value="abtesting">
              <TestTube2 className="w-4 h-4 mr-2" />
              A/B Testing
            </TabsTrigger>
          </FeatureTooltip>
          <TabsTrigger value="timing">
            <Clock className="w-4 h-4 mr-2" />
            Optimal Times
          </TabsTrigger>
          <FeatureTooltip
            title="AI Content Calendar"
            description="Generate a complete 7-day or 30-day content calendar with detailed post ideas, visual concepts, video scripts, hashtags, and optimal posting times based on current trends."
          >
            <TabsTrigger value="calendar">
              <Calendar className="w-4 h-4 mr-2" />
              AI Calendar
            </TabsTrigger>
          </FeatureTooltip>
          <TabsTrigger value="brandguide">
            <Palette className="w-4 h-4 mr-2" />
            Brand Guide
          </TabsTrigger>
          <TabsTrigger value="revenue">
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="inbox">
            <MessageSquare className="w-4 h-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            Team AI
          </TabsTrigger>
          <TabsTrigger value="chat">
            <Sparkles className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strategy" className="space-y-6">
          <StrategicInsights workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="campaign" className="space-y-6">
          <CampaignStrategyBuilder workspaceId={workspaceId} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <ProactiveInsights onAction={(insight) => console.log('Action:', insight)} limitedMode={false} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CrisisDetector />
            <TrendResponder autoMode={false} />
          </div>
        </TabsContent>

        <TabsContent value="abtesting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube2 className="w-5 h-5 text-[#d4af37]" />
                A/B Test Post Variations
              </CardTitle>
              <p className="text-sm text-slate-500">Generate multiple variations to test different elements</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ab-content">Original Post Content</Label>
                <Textarea
                  id="ab-content"
                  value={abTestContent}
                  onChange={(e) => setAbTestContent(e.target.value)}
                  placeholder="Enter your post content to generate variations..."
                  className="min-h-[120px] mt-2"
                />
              </div>
              
              <Button 
                onClick={generateABVariations}
                disabled={isGeneratingAB || !abTestContent.trim()}
                className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]"
              >
                {isGeneratingAB ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Variations...
                  </>
                ) : (
                  <>
                    <TestTube2 className="w-4 h-4 mr-2" />
                    Generate A/B Variations
                  </>
                )}
              </Button>

              {abVariations.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {abVariations.map((variation, index) => (
                    <Card key={index} className="border-2 border-slate-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Variation {index + 1}</Badge>
                          <Badge className="bg-[#d4af37]/10 text-[#d4af37]">{variation.test_focus}</Badge>
                        </div>
                        <CardTitle className="text-base mt-2">{variation.variation_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{variation.content}</p>
                        </div>
                        <div className="pt-3 border-t">
                          <p className="text-xs text-slate-500">
                            <strong>Expected:</strong> {variation.expected_outcome}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#d4af37]" />
                Optimal Posting Times
              </CardTitle>
              <p className="text-sm text-slate-500">AI-powered analysis of best times to post</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Select Platform</Label>
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="twitter">X (Twitter)</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={getOptimalPostingTimes}
                  disabled={isLoadingTimes}
                  className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]"
                >
                  {isLoadingTimes ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>

              {optimalTimes && (
                <div className="space-y-4 mt-6">
                  <div className="p-4 bg-[#d4af37]/10 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">AI Insights</h4>
                    <p className="text-sm text-slate-700">{optimalTimes.insights}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {optimalTimes.best_times?.map((time, index) => (
                      <Card key={index} className="border-2 border-slate-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-lg">{time.day}</div>
                              <div className="text-2xl font-bold text-[#d4af37]">{time.time}</div>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700">
                              {time.engagement_score}% engagement
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{time.rationale}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d4af37]" />
                AI Content Calendar Generator
              </CardTitle>
              <p className="text-sm text-slate-500">Create data-driven content plans based on trends and goals</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="calendar-goal">Content Goal</Label>
                  <Input
                    id="calendar-goal"
                    value={calendarGoal}
                    onChange={(e) => setCalendarGoal(e.target.value)}
                    placeholder="e.g., Increase engagement, Drive sales..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="calendar-industry">Industry/Niche</Label>
                  <Input
                    id="calendar-industry"
                    value={calendarIndustry}
                    onChange={(e) => setCalendarIndustry(e.target.value)}
                    placeholder="e.g., Fashion, Tech, Food..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Duration</Label>
                  <Select value={calendarDuration} onValueChange={setCalendarDuration}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">1 Week (7 days)</SelectItem>
                      <SelectItem value="month">1 Month (30 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={generateContentCalendar}
                  disabled={isGeneratingCalendar || !calendarGoal.trim()}
                  className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]"
                >
                  {isGeneratingCalendar ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Calendar...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Generate {calendarDuration === 'week' ? '7-Day' : '30-Day'} Calendar
                    </>
                  )}
                </Button>

                {generatedCalendar && (
                  <>
                    <Button 
                      onClick={exportCalendarToCSV}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button 
                      onClick={exportCalendarToICal}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export iCal
                    </Button>
                  </>
                )}
              </div>

              {generatedCalendar && (
                <div className="space-y-4 mt-6">
                  {generatedCalendar.strategy_notes && (
                    <div className="p-4 bg-[#d4af37]/10 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Strategy Notes</h4>
                      <p className="text-sm text-slate-700">{generatedCalendar.strategy_notes}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {generatedCalendar.calendar?.map((day, index) => (
                      <Card key={index} className="border-2 border-slate-200 hover:border-[#d4af37]/50 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="font-bold text-lg">{day.day}</div>
                              <div className="text-sm text-slate-500">{day.date}</div>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-end">
                              {day.platforms?.map((p, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {p.platform} - {p.format}
                                </Badge>
                              ))}
                              <Badge className="bg-[#d4af37]/10 text-[#d4af37]">{day.optimal_time}</Badge>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Badge className="mb-2">{day.content_type}</Badge>
                              <h4 className="font-semibold text-slate-900 mb-2">{day.hook}</h4>
                              <p className="text-sm text-slate-700">{day.content_idea}</p>
                            </div>

                            {day.caption && (
                              <div className="p-3 bg-slate-50 rounded-lg">
                                <Label className="text-xs text-slate-500 mb-1 block">Caption</Label>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{day.caption}</p>
                              </div>
                            )}

                            {day.visual_concept && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {day.visual_concept.image_idea && (
                                  <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Image className="w-4 h-4 text-blue-600" />
                                      <Label className="text-xs text-blue-900">Image Concept</Label>
                                    </div>
                                    <p className="text-xs text-blue-800">{day.visual_concept.image_idea}</p>
                                  </div>
                                )}
                                {day.visual_concept.video_script && (
                                  <div className="p-3 bg-purple-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Video className="w-4 h-4 text-purple-600" />
                                      <Label className="text-xs text-purple-900">Video Script</Label>
                                    </div>
                                    <p className="text-xs text-purple-800 whitespace-pre-wrap">{day.visual_concept.video_script}</p>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex flex-wrap gap-1">
                                {day.hashtags?.slice(0, 5).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">#{tag}</Badge>
                                ))}
                              </div>
                              {day.cta && (
                                <Badge className="bg-green-100 text-green-700 text-xs">
                                  CTA: {day.cta}
                                </Badge>
                              )}
                            </div>

                            {day.trending_topic && (
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <TrendingUp className="w-3 h-3" />
                                Trending: {day.trending_topic}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brandguide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#d4af37]" />
                Brand Style Guide
              </CardTitle>
              <p className="text-sm text-slate-500">Upload your brand guidelines for AI to follow</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Upload Brand Style Guide</h4>
                  <p className="text-sm text-slate-500">PDF, DOCX, or TXT format</p>
                </div>
                <Input
                  type="file"
                  accept=".pdf,.docx,.txt,.doc"
                  onChange={handleBrandGuideUpload}
                  disabled={isUploadingGuide}
                  className="max-w-xs mx-auto"
                />
                {isUploadingGuide && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-slate-500">Processing...</span>
                  </div>
                )}
              </div>

              {brandStyleGuide && (
                <Card className="border-2 border-[#d4af37]/20 bg-[#d4af37]/5">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#d4af37]" />
                      Active Brand Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {brandStyleGuide.brand_name && (
                      <div>
                        <Label className="text-xs text-slate-500">Brand Name</Label>
                        <p className="font-semibold">{brandStyleGuide.brand_name}</p>
                      </div>
                    )}
                    {brandStyleGuide.tone && (
                      <div>
                        <Label className="text-xs text-slate-500">Tone</Label>
                        <p className="text-sm">{brandStyleGuide.tone}</p>
                      </div>
                    )}
                    {brandStyleGuide.voice && (
                      <div>
                        <Label className="text-xs text-slate-500">Voice</Label>
                        <p className="text-sm">{brandStyleGuide.voice}</p>
                      </div>
                    )}
                    {brandStyleGuide.colors?.length > 0 && (
                      <div>
                        <Label className="text-xs text-slate-500">Brand Colors</Label>
                        <div className="flex gap-2 mt-1">
                          {brandStyleGuide.colors.map((color, i) => (
                            <Badge key={i} variant="secondary">{color}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {brandStyleGuide.target_audience && (
                      <div>
                        <Label className="text-xs text-slate-500">Target Audience</Label>
                        <p className="text-sm">{brandStyleGuide.target_audience}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-900">How it works</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>AI extracts tone, voice, colors, and messaging from your guide</li>
                  <li>All generated content follows your brand guidelines</li>
                  <li>Works with A/B testing, calendars, and content generation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueOptimizer postContent="" platforms={['instagram', 'facebook']} />
        </TabsContent>

        <TabsContent value="inbox">
          <IntelligentInbox />
        </TabsContent>

        <TabsContent value="team">
          <AIWorkloadBalancer />
        </TabsContent>

        <TabsContent value="chat">
          <div className="h-[calc(100vh-16rem)] flex gap-6">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-slate-200 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#d4af37]">
                  <Sparkles className="w-5 h-5 text-[#1a1a1a]" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <p className="text-sm text-slate-500">Your smart social media co-pilot</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                Online
              </Badge>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea ref={scrollRef} className="flex-1 p-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#d4af37]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Welcome to AI Assistant</h3>
                    <p className="text-slate-600 mt-1">Ask me anything about your social media or data</p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-4",
                      message.role === 'user' ? "flex-row-reverse" : ""
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      message.role === 'user' ?
                        "bg-[#d4af37]" :
                        "bg-[#d4af37]"
                    )}>
                      {message.role === 'user' ? (
                        <span className="text-[#1a1a1a] text-sm font-medium">U</span>
                      ) : (
                        <Sparkles className="w-4 h-4 text-[#1a1a1a]" />
                      )}
                    </div>
                    <MessageBubble message={message} />
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#1a1a1a]" />
                  </div>
                  <div className="flex-1">
                    <div className="rounded-2xl px-4 py-3 bg-slate-50 border border-slate-200 inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
                      <span className="text-slate-500">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-slate-200 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <Textarea
                  placeholder="Ask me anything about your social media..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[60px] pr-24 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }} />

                <div className="absolute right-2 bottom-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-[#d4af37] hover:bg-[#c9a961] text-[#1a1a1a]"
                    onClick={() => handleSubmit()}
                    disabled={isLoading || !input.trim()}>

                    {isLoading ?
                    <Loader2 className="w-4 h-4 animate-spin" /> :

                    <Send className="w-4 h-4" />
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar - Suggestions */}
      <div className="hidden lg:block w-80">
        <Card className="sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-[#d4af37]" />
              Quick Prompts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestedPrompts.map((prompt, index) =>
            <button
              key={index}
              onClick={() => handleSuggestion(prompt.text)}
              className="w-full p-3 rounded-lg border border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all text-left group">

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-[#d4af37]/20">
                    <prompt.icon className="w-4 h-4 text-slate-600 group-hover:text-[#d4af37]" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700 group-hover:text-[#d4af37]">
                      {prompt.text}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {prompt.category}
                    </Badge>
                  </div>
                </div>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Quick Tools */}
        <Card className="mt-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Tools</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
            { icon: PenSquare, label: 'Generate Caption' },
            { icon: Hash, label: 'Find Hashtags' },
            { icon: BarChart3, label: 'Analyze Post' },
            { icon: Calendar, label: 'Plan Content' }].
            map((tool, i) =>
            <Button
              key={i}
              variant="outline" className="w-full p-3 rounded-lg border border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/10 transition-all text-left group"

              onClick={() => handleSuggestion(`Help me ${tool.label.toLowerCase()}`)}>

                <tool.icon className="w-4 h-4" />
                <span className="text-sm text-slate-700 group-hover:text-[#d4af37]">{tool.label}</span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>);

}