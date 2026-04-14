import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Trash2,
  Zap,
  MessageSquare,
  AtSign,
  Clock,
  AlertTriangle,
  Filter,
  Target,
  Send,
  Tag,
  Bell,
  Eye,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const triggerTypes = [
  { value: 'new_comment', label: 'New Comment', icon: MessageSquare, color: 'bg-blue-100 text-blue-700' },
  { value: 'new_mention', label: 'New Mention', icon: AtSign, color: 'bg-purple-100 text-purple-700' },
  { value: 'new_dm', label: 'New DM', icon: MessageSquare, color: 'bg-emerald-100 text-emerald-700' },
  { value: 'new_follower', label: 'New Follower', icon: UserPlus, color: 'bg-pink-100 text-pink-700' },
  { value: 'keyword_detected', label: 'Keyword Detected', icon: Filter, color: 'bg-amber-100 text-amber-700' },
  { value: 'sentiment_detected', label: 'Sentiment Alert', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  { value: 'scheduled', label: 'Scheduled Time', icon: Clock, color: 'bg-slate-100 text-slate-700' },
  { value: 'engagement_threshold', label: 'Engagement Threshold', icon: Target, color: 'bg-indigo-100 text-indigo-700' },
  { value: 'post_published', label: 'Post Published', icon: CheckCircle, color: 'bg-green-100 text-green-700' }
];

const actionTypes = [
  { value: 'auto_reply', label: 'Auto Reply', icon: MessageSquare, color: 'bg-blue-500' },
  { value: 'ai_response', label: 'AI Response', icon: Zap, color: 'bg-violet-500' },
  { value: 'assign_team', label: 'Assign to Team', icon: UserPlus, color: 'bg-purple-500' },
  { value: 'add_label', label: 'Add Label', icon: Tag, color: 'bg-emerald-500' },
  { value: 'send_notification', label: 'Send Notification', icon: Bell, color: 'bg-amber-500' },
  { value: 'hide_content', label: 'Hide Content', icon: Eye, color: 'bg-red-500' },
  { value: 'escalate', label: 'Escalate', icon: AlertTriangle, color: 'bg-orange-500' },
  { value: 'webhook', label: 'Trigger Webhook', icon: Send, color: 'bg-cyan-500' }
];

const platforms = ['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'];

export default function AutomationBuilder({ onSave, initialData }) {
  const [automation, setAutomation] = useState(initialData || {
    name: '',
    description: '',
    trigger: { type: '', platforms: [], conditions: [] },
    actions: [],
    status: 'draft'
  });

  const [showConditions, setShowConditions] = useState(false);

  const addCondition = () => {
    setAutomation({
      ...automation,
      trigger: {
        ...automation.trigger,
        conditions: [
          ...automation.trigger.conditions,
          { field: '', operator: '', value: '' }
        ]
      }
    });
    setShowConditions(true);
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...automation.trigger.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setAutomation({
      ...automation,
      trigger: { ...automation.trigger, conditions: newConditions }
    });
  };

  const removeCondition = (index) => {
    const newConditions = automation.trigger.conditions.filter((_, i) => i !== index);
    setAutomation({
      ...automation,
      trigger: { ...automation.trigger, conditions: newConditions }
    });
  };

  const addAction = (actionType) => {
    setAutomation({
      ...automation,
      actions: [...automation.actions, { type: actionType, config: {} }]
    });
  };

  const updateAction = (index, config) => {
    const newActions = [...automation.actions];
    newActions[index] = { ...newActions[index], config };
    setAutomation({ ...automation, actions: newActions });
  };

  const removeAction = (index) => {
    setAutomation({
      ...automation,
      actions: automation.actions.filter((_, i) => i !== index)
    });
  };

  const togglePlatform = (platform) => {
    const platforms = automation.trigger.platforms || [];
    const newPlatforms = platforms.includes(platform)
      ? platforms.filter(p => p !== platform)
      : [...platforms, platform];
    
    setAutomation({
      ...automation,
      trigger: { ...automation.trigger, platforms: newPlatforms }
    });
  };

  const handleSave = () => {
    if (!automation.name || !automation.trigger.type || automation.actions.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }
    onSave?.(automation);
    toast.success('Automation saved successfully!');
  };

  const selectedTrigger = triggerTypes.find(t => t.value === automation.trigger.type);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Automation Name *</Label>
            <Input
              placeholder="e.g., Welcome New Followers"
              value={automation.name}
              onChange={(e) => setAutomation({ ...automation, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="What does this automation do?"
              value={automation.description}
              onChange={(e) => setAutomation({ ...automation, description: e.target.value })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Visual Flow */}
      <Card className="border-2 border-[#d4af37]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#d4af37]" />
            Automation Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* TRIGGER */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#d4af37] text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold text-lg">When this happens...</h3>
              </div>
              
              <div className="ml-12 space-y-4">
                <div>
                  <Label>Trigger Event *</Label>
                  <Select
                    value={automation.trigger.type}
                    onValueChange={(value) => setAutomation({
                      ...automation,
                      trigger: { ...automation.trigger, type: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a trigger..." />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((trigger) => (
                        <SelectItem key={trigger.value} value={trigger.value}>
                          <div className="flex items-center gap-2">
                            <trigger.icon className="w-4 h-4" />
                            {trigger.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {automation.trigger.type && (
                  <>
                    <div>
                      <Label>Platforms (optional)</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {platforms.map((platform) => (
                          <Badge
                            key={platform}
                            variant={automation.trigger.platforms?.includes(platform) ? 'default' : 'outline'}
                            className={cn(
                              "cursor-pointer",
                              automation.trigger.platforms?.includes(platform) && "bg-[#d4af37] text-slate-950"
                            )}
                            onClick={() => togglePlatform(platform)}
                          >
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Conditions (optional)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={addCondition}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Condition
                        </Button>
                      </div>
                      
                      {automation.trigger.conditions?.map((condition, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Select
                            value={condition.field}
                            onValueChange={(value) => updateCondition(index, 'field', value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Field" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="content">Content</SelectItem>
                              <SelectItem value="sentiment">Sentiment</SelectItem>
                              <SelectItem value="follower_count">Follower Count</SelectItem>
                              <SelectItem value="engagement">Engagement</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateCondition(index, 'operator', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Operator" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="greater_than">Greater than</SelectItem>
                              <SelectItem value="less_than">Less than</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Value"
                            value={condition.value}
                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                            className="flex-1"
                          />

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeCondition(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ARROW */}
            {automation.trigger.type && (
              <div className="ml-12 flex items-center gap-2 text-slate-400">
                <ArrowRight className="w-5 h-5" />
                <span className="text-sm">Then...</span>
              </div>
            )}

            {/* ACTIONS */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#d4af37] text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold text-lg">Do these actions...</h3>
              </div>

              <div className="ml-12 space-y-3">
                {automation.actions.map((action, index) => {
                  const actionType = actionTypes.find(a => a.value === action.type);
                  return (
                    <div key={index} className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", actionType?.color)}>
                            {actionType?.icon && <actionType.icon className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{actionType?.label}</h4>
                            <p className="text-xs text-slate-500">Action {index + 1}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeAction(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>

                      {/* Action Config */}
                      {(action.type === 'auto_reply' || action.type === 'ai_response') && (
                        <Textarea
                          placeholder={action.type === 'ai_response' ? "AI will generate response based on..." : "Reply message..."}
                          value={action.config.message || ''}
                          onChange={(e) => updateAction(index, { ...action.config, message: e.target.value })}
                          rows={2}
                        />
                      )}
                      {action.type === 'assign_team' && (
                        <Select
                          value={action.config.member}
                          onValueChange={(value) => updateAction(index, { ...action.config, member: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select team member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sarah">Sarah Johnson</SelectItem>
                            <SelectItem value="mike">Mike Chen</SelectItem>
                            <SelectItem value="emily">Emily Davis</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {action.type === 'add_label' && (
                        <Input
                          placeholder="Label name (e.g., urgent, customer-service)"
                          value={action.config.label || ''}
                          onChange={(e) => updateAction(index, { ...action.config, label: e.target.value })}
                        />
                      )}
                      {action.type === 'webhook' && (
                        <Input
                          placeholder="Webhook URL"
                          value={action.config.url || ''}
                          onChange={(e) => updateAction(index, { ...action.config, url: e.target.value })}
                        />
                      )}
                    </div>
                  );
                })}

                <div className="pt-2">
                  <Label className="mb-2 block">Add Action</Label>
                  <div className="flex flex-wrap gap-2">
                    {actionTypes.map((actionType) => (
                      <Button
                        key={actionType.value}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addAction(actionType.value)}
                        className="gap-2"
                      >
                        <actionType.icon className="w-3 h-3" />
                        {actionType.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Save Automation
        </Button>
      </div>
    </div>
  );
}