import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageSquare, ListChecks, BarChart3 } from 'lucide-react';
import TeamActivityFeed from '@/components/collaboration/TeamActivityFeed';
import TeamChat from '@/components/collaboration/TeamChat';
import TaskBoard from '@/components/collaboration/TaskBoard';
import CollaborationInsights from '@/components/collaboration/CollaborationInsights';

export default function Collaboration() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-600" />
            Team Collaboration
          </h1>
          <p className="text-slate-500 mt-1">Work together seamlessly with AI-powered insights</p>
        </div>
        <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
          AI Enhanced
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListChecks className="w-4 h-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Team Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CollaborationInsights />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TeamActivityFeed />
            <TeamChat />
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskBoard />
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardContent className="p-0">
              <div className="h-[600px]">
                <TeamChat />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}