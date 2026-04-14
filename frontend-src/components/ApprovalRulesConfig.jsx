import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Trash2,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Settings2,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const approvalRuleTemplates = [
  {
    name: 'High-Value Content',
    description: 'Posts with predicted high engagement need manager approval',
    conditions: [{ field: 'engagement_prediction', operator: 'greater_than', value: '80' }],
    approvers: ['manager'],
    requiredApprovals: 1
  },
  {
    name: 'Sensitive Topics',
    description: 'Content mentioning specific keywords requires legal review',
    conditions: [{ field: 'content', operator: 'contains', value: 'pricing,guarantee,warranty' }],
    approvers: ['legal', 'manager'],
    requiredApprovals: 2
  },
  {
    name: 'Campaign Posts',
    description: 'All campaign content needs marketing director approval',
    conditions: [{ field: 'campaign_id', operator: 'is_set', value: '' }],
    approvers: ['director'],
    requiredApprovals: 1
  }
];

export default function ApprovalRulesConfig({ onSave }) {
  const [rules, setRules] = useState([]);
  const [showTemplates, setShowTemplates] = useState(true);

  const addRule = (template = null) => {
    const newRule = template || {
      name: '',
      enabled: true,
      conditions: [{ field: '', operator: '', value: '' }],
      approvers: [],
      requiredApprovals: 1,
      autoRejectAfter: null,
      priority: 'medium'
    };
    setRules([...rules, newRule]);
    setShowTemplates(false);
  };

  const updateRule = (index, updates) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const addCondition = (ruleIndex) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions.push({ field: '', operator: '', value: '' });
    setRules(newRules);
  };

  const updateCondition = (ruleIndex, condIndex, field, value) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions[condIndex] = {
      ...newRules[ruleIndex].conditions[condIndex],
      [field]: value
    };
    setRules(newRules);
  };

  const removeCondition = (ruleIndex, condIndex) => {
    const newRules = [...rules];
    newRules[ruleIndex].conditions = newRules[ruleIndex].conditions.filter((_, i) => i !== condIndex);
    setRules(newRules);
  };

  const toggleApprover = (ruleIndex, approver) => {
    const newRules = [...rules];
    const approvers = newRules[ruleIndex].approvers || [];
    newRules[ruleIndex].approvers = approvers.includes(approver)
      ? approvers.filter(a => a !== approver)
      : [...approvers, approver];
    setRules(newRules);
  };

  const handleSave = () => {
    onSave?.(rules);
    toast.success('Approval rules saved successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Approval Rules</h2>
          <p className="text-slate-500">Configure automated approval workflows for content</p>
        </div>
        <Button onClick={() => addRule()} className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Templates */}
      {showTemplates && rules.length === 0 && (
        <Card className="border-2 border-[#d4af37]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#d4af37]" />
              Quick Start Templates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {approvalRuleTemplates.map((template, i) => (
                <button
                  key={i}
                  onClick={() => addRule(template)}
                  className="p-4 rounded-lg border-2 border-slate-200 hover:border-[#d4af37] hover:shadow-md transition-all text-left group"
                >
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-[#d4af37]">
                    {template.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {template.requiredApprovals} approval{template.requiredApprovals > 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {template.conditions.length} condition{template.conditions.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule, ruleIndex) => (
          <Card key={ruleIndex} className={cn(
            "border-2 transition-all",
            rule.enabled ? "border-[#d4af37]/30" : "border-slate-200 opacity-60"
          )}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Input
                    placeholder="Rule Name (e.g., High-Value Content Approval)"
                    value={rule.name || ''}
                    onChange={(e) => updateRule(ruleIndex, { name: e.target.value })}
                    className="text-lg font-semibold border-none p-0 focus-visible:ring-0 mb-2"
                  />
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Enabled</Label>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => updateRule(ruleIndex, { enabled: checked })}
                      />
                    </div>
                    <Select
                      value={rule.priority}
                      onValueChange={(value) => updateRule(ruleIndex, { priority: value })}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRule(ruleIndex)}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-semibold">Conditions (When to trigger approval)</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addCondition(ruleIndex)}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-2">
                  {rule.conditions?.map((condition, condIndex) => (
                    <div key={condIndex} className="flex gap-2">
                      <Select
                        value={condition.field}
                        onValueChange={(value) => updateCondition(ruleIndex, condIndex, 'field', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content">Content Text</SelectItem>
                          <SelectItem value="campaign_id">Campaign</SelectItem>
                          <SelectItem value="engagement_prediction">Predicted Engagement</SelectItem>
                          <SelectItem value="sentiment">Sentiment</SelectItem>
                          <SelectItem value="brand_voice_score">Brand Voice Score</SelectItem>
                          <SelectItem value="compliance_score">Compliance Score</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(ruleIndex, condIndex, 'operator', value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="greater_than">Greater than</SelectItem>
                          <SelectItem value="less_than">Less than</SelectItem>
                          <SelectItem value="is_set">Is set</SelectItem>
                        </SelectContent>
                      </Select>

                      <Input
                        placeholder="Value"
                        value={condition.value}
                        onChange={(e) => updateCondition(ruleIndex, condIndex, 'value', e.target.value)}
                        className="flex-1"
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeCondition(ruleIndex, condIndex)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Approvers */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Required Approvers</Label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {['manager', 'director', 'legal', 'compliance', 'marketing'].map((role) => (
                      <Badge
                        key={role}
                        variant={rule.approvers?.includes(role) ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer capitalize",
                          rule.approvers?.includes(role) && "bg-[#d4af37] text-slate-950"
                        )}
                        onClick={() => toggleApprover(ruleIndex, role)}
                      >
                        <UserCheck className="w-3 h-3 mr-1" />
                        {role}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Required Approvals:</Label>
                    <Select
                      value={String(rule.requiredApprovals)}
                      onValueChange={(value) => updateRule(ruleIndex, { requiredApprovals: parseInt(value) })}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-4">
                    <Label className="text-sm">Auto-reject after (hours):</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={rule.autoRejectAfter || ''}
                      onChange={(e) => updateRule(ruleIndex, { autoRejectAfter: e.target.value })}
                      className="w-24"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      {rules.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Save All Rules
          </Button>
        </div>
      )}
    </div>
  );
}