import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { 
  Bot, 
  Zap, 
  Clock,
  TrendingUp,
  Hash,
  MessageSquare,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Settings,
  Activity,
  Target,
  Sparkles,
  Play,
  Pause,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useWorkspace } from '@/hooks';


const _OLD_autonomousActions = [
  {
    id: '1',
    type: 'timing',
    action: 'Rescheduled post',
    from: '2:00 PM',
    to: '6:30 PM',
    reason: 'Higher engagement window detected',
    impact: '+18% predicted engagement',
    status: 'completed',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    type: 'hashtag',
    action: 'Optimized hashtags',
    from: '#fashion #style',
    to: '#sustainablefashion #ecostyle #slowfashion',
    reason: 'Trending topics alignment',
    impact: '+25% reach potential',
    status: 'completed',
    timestamp: '5 hours ago'
  },
  {
    id: '3',
    type: 'caption',
    action: 'Enhanced caption',
    from: 'Check out our new product',
    to: 'Check out our new product! 🌟 Limited stock...',
    reason: 'CTA optimization',
    impact: '+12% conversion rate',
    status: 'pending_approval',
    timestamp: '1 hour ago'
  }
];

const _OLD_perfData = [
  { date: 'Mon', manual: 3200, autonomous: 4100 },
  { date: 'Tue', manual: 2800, autonomous: 3600 },
  { date: 'Wed', manual: 3500, autonomous: 4400 },
  { date: 'Thu', manual: 3100, autonomous: 4200 },
  { date: 'Fri', manual: 3800, autonomous: 4900 },
  { date: 'Sat', manual: 4200, autonomous: 5300 },
  { date: 'Sun', manual: 3900, autonomous: 5100 }
];

const brandGuidelines = {
  tone: ['professional', 'friendly', 'informative'],
  bannedWords: ['cheap', 'discount', 'sale'],
  emojiUsage: 'moderate',
  hashtagLimit: 5,
  responseTime: 'within 30 minutes',
  autoApprove: false
};

export default function AutonomousOptimization() {
  const { workspaceId } = useWorkspace();
  const { data: _apiData = {}, isLoading } = useQuery({
    queryKey: ['autonomous-optimization', workspaceId],
    queryFn: async () => { 
      const [analytics, automations] = await Promise.all([
        base44.entities.Analytics.filter({ workspace_id: workspaceId, period: '7d', sort: '-date', limit: 7 }),
        base44.entities.Automation.filter({ workspace_id: workspaceId, status: 'active' }),
      ]);
      return { analytics, automations };
      },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  });

  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [aggressiveness, setAggressiveness] = useState([60]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Autonomous Optimization</h1>
          <p className="text-slate-500 mt-1">Let AI dynamically optimize your content and posting strategy</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm">AI Mode</Label>
            <Switch checked={aiEnabled} onCheckedChange={setAiEnabled} />
          </div>
          <Badge className={cn(
            "px-3 py-1",
            aiEnabled ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
          )}>
            {aiEnabled ? (
              <>
                <Zap className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Paused
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Bot className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+24%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">156</p>
            <p className="text-sm text-slate-500 mt-1">Autonomous Actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">+18%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">4.8K</p>
            <p className="text-sm text-slate-500 mt-1">Avg Engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-blue-100 text-blue-700">-65%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">12min</p>
            <p className="text-sm text-slate-500 mt-1">Time Saved Daily</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-[#d4af37]" />
              <Badge className="bg-green-100 text-green-700">92%</Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900">144/156</p>
            <p className="text-sm text-slate-500 mt-1">Success Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="actions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="actions">Recent Actions</TabsTrigger>
          <TabsTrigger value="settings">AI Settings</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="guidelines">Brand Guidelines</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Autonomous Actions Log</CardTitle>
              <CardDescription>Real-time AI optimizations and adjustments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {autonomousActions.map((action) => (
                  <div 
                    key={action.id}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all",
                      action.status === 'completed' ? "border-green-200 bg-green-50/50" :
                      action.status === 'pending_approval' ? "border-amber-200 bg-amber-50/50" :
                      "border-slate-200"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          action.type === 'timing' ? "bg-blue-100" :
                          action.type === 'hashtag' ? "bg-purple-100" :
                          "bg-amber-100"
                        )}>
                          {action.type === 'timing' && <Clock className="w-5 h-5 text-blue-600" />}
                          {action.type === 'hashtag' && <Hash className="w-5 h-5 text-purple-600" />}
                          {action.type === 'caption' && <MessageSquare className="w-5 h-5 text-amber-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{action.action}</h3>
                            <Badge variant="outline" className="text-xs">
                              {action.timestamp}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{action.reason}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500">
                              From: <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{action.from}</span>
                            </p>
                            <p className="text-xs text-slate-500">
                              To: <span className="font-mono bg-green-100 px-2 py-0.5 rounded">{action.to}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={cn(
                          "mb-2",
                          action.status === 'completed' ? "bg-green-100 text-green-700" :
                          action.status === 'pending_approval' ? "bg-amber-100 text-amber-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {action.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {action.status === 'pending_approval' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {action.status === 'completed' ? 'Applied' : 'Pending'}
                        </Badge>
                        <p className="text-xs text-green-700 font-medium">{action.impact}</p>
                      </div>
                    </div>

                    {action.status === 'pending_approval' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-amber-200">
                        <Button size="sm" className="flex-1 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Optimization Settings</CardTitle>
              <CardDescription>Configure how aggressively AI optimizes your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                  <div>
                    <Label className="text-sm font-medium">Auto-Approve Changes</Label>
                    <p className="text-xs text-slate-500 mt-1">Let AI apply optimizations without approval</p>
                  </div>
                  <Switch checked={autoApprove} onCheckedChange={setAutoApprove} />
                </div>

                <div className="space-y-3 p-4 rounded-lg border border-slate-200">
                  <Label className="text-sm font-medium">Optimization Aggressiveness</Label>
                  <Slider 
                    value={aggressiveness} 
                    onValueChange={setAggressiveness}
                    max={100}
                    step={10}
                    className="my-4"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Conservative</span>
                    <span className="font-medium text-[#d4af37]">{aggressiveness}%</span>
                    <span>Aggressive</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    {aggressiveness[0] < 40 && "AI will make minimal changes, focusing on proven optimizations"}
                    {aggressiveness[0] >= 40 && aggressiveness[0] < 70 && "Balanced approach with moderate optimizations"}
                    {aggressiveness[0] >= 70 && "AI will actively experiment with new strategies for maximum impact"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Autonomous Capabilities</Label>
                
                <div className="space-y-2">
                  {[
                    { label: 'Optimize Posting Times', icon: Clock, enabled: true },
                    { label: 'Adjust Hashtags', icon: Hash, enabled: true },
                    { label: 'Enhance Captions', icon: MessageSquare, enabled: false },
                    { label: 'Respond to Trends', icon: TrendingUp, enabled: true },
                    { label: 'Auto-Reply Comments', icon: MessageSquare, enabled: false },
                    { label: 'Content Variations', icon: ImageIcon, enabled: true }
                  ].map((capability, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-2">
                        <capability.icon className="w-4 h-4 text-[#d4af37]" />
                        <Label className="text-sm">{capability.label}</Label>
                      </div>
                      <Switch defaultChecked={capability.enabled} />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI vs Manual Performance</CardTitle>
              <CardDescription>Compare AI-optimized posts against manual posts</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="manual" 
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    name="Manual"
                    strokeDasharray="5 5"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="autonomous" 
                    stroke="#d4af37" 
                    strokeWidth={3}
                    name="AI-Optimized"
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-lg bg-slate-50">
                  <p className="text-sm text-slate-500 mb-2">Manual Average</p>
                  <p className="text-2xl font-bold text-slate-900">3,500</p>
                  <p className="text-xs text-slate-500 mt-1">engagement per post</p>
                </div>
                <div className="p-4 rounded-lg bg-[#d4af37]/10">
                  <p className="text-sm text-slate-600 mb-2">AI-Optimized Average</p>
                  <p className="text-2xl font-bold text-[#d4af37]">4,520</p>
                  <p className="text-xs text-slate-600 mt-1">
                    <span className="text-green-600 font-semibold">+29%</span> engagement per post
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="font-semibold text-sm">Timing Optimizations</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">42</p>
                <p className="text-xs text-slate-500">posts rescheduled</p>
                <Badge className="bg-green-100 text-green-700 text-xs mt-2">+18% avg lift</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="font-semibold text-sm">Hashtag Updates</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">38</p>
                <p className="text-xs text-slate-500">hashtag optimizations</p>
                <Badge className="bg-green-100 text-green-700 text-xs mt-2">+24% reach</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="font-semibold text-sm">Caption Enhancements</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">26</p>
                <p className="text-xs text-slate-500">captions improved</p>
                <Badge className="bg-green-100 text-green-700 text-xs mt-2">+15% CTR</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="guidelines" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Guidelines</CardTitle>
              <CardDescription>AI operates within these guardrails to maintain brand consistency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Brand Tone</Label>
                <div className="flex flex-wrap gap-2">
                  {brandGuidelines.tone.map((tone, i) => (
                    <Badge key={i} className="bg-[#d4af37]/20 text-[#d4af37]">
                      {tone}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Banned Words</Label>
                <div className="flex flex-wrap gap-2">
                  {brandGuidelines.bannedWords.map((word, i) => (
                    <Badge key={i} variant="outline" className="border-red-200 text-red-700">
                      {word}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">AI will never use these words in optimizations</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200">
                  <Label className="text-sm font-medium mb-2 block">Emoji Usage</Label>
                  <p className="text-sm text-slate-900 capitalize">{brandGuidelines.emojiUsage}</p>
                </div>

                <div className="p-4 rounded-lg border border-slate-200">
                  <Label className="text-sm font-medium mb-2 block">Max Hashtags</Label>
                  <p className="text-sm text-slate-900">{brandGuidelines.hashtagLimit} per post</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 mb-1">AI Learning</h4>
                    <p className="text-xs text-slate-600">
                      The AI continuously learns from your approved changes to better understand your brand voice and preferences.
                    </p>
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Edit Guidelines
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}