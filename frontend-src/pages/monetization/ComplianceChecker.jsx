import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '@/api/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ComplianceChecker({ content, brandId, onAnalysisComplete }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (content?.text && content.text.length > 10) {
      const debounce = setTimeout(() => {
        analyzeContent();
      }, 1500);
      return () => clearTimeout(debounce);
    }
  }, [content?.text, brandId]);

  const analyzeContent = async () => {
    if (!content?.text || content.text.length < 10) return;

    setAnalyzing(true);
    try {
      // Fetch brand guidelines if brandId provided
      let brandVoice = null;
      let complianceRules = null;
      
      if (brandId) {
        const brand = await api.entities.Brand.filter({ id: brandId });
        if (brand.length > 0) {
          brandVoice = brand[0].brand_voice;
          complianceRules = brand[0].compliance_rules;
        }
      }

      // Use AI to analyze the content
      const prompt = `Analyze this social media post for compliance, brand voice, and risks:

POST CONTENT:
"${content.text}"

${brandVoice ? `BRAND VOICE GUIDELINES:
- Tone: ${brandVoice.tone?.join(', ') || 'Not specified'}
- Personality: ${brandVoice.personality_traits?.join(', ') || 'Not specified'}
- Formality: ${brandVoice.formality || 'Not specified'}
- Banned Words: ${brandVoice.banned_words?.join(', ') || 'None'}
- Emoji Usage: ${brandVoice.emoji_usage || 'Not specified'}` : ''}

${complianceRules ? `COMPLIANCE RULES:
- Requires Disclosure: ${complianceRules.require_disclosure ? 'Yes' : 'No'}
- Prohibited Content: ${complianceRules.prohibited_content?.join(', ') || 'None'}` : ''}

Provide a comprehensive analysis with:
1. Brand Voice Score (0-100): How well it matches the brand voice
2. Compliance Status (compliant/warning/violation): Check for required disclosures and prohibited content
3. Risk Level (low/medium/high): Potential controversies, offensive content, or legal issues
4. Specific Issues: List any problems found
5. Suggestions: How to improve the post

Return as JSON only.`;

      const result = await api.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            brand_voice_score: { type: "number" },
            brand_voice_feedback: { type: "string" },
            compliance_status: { type: "string", enum: ["compliant", "warning", "violation"] },
            compliance_issues: { type: "array", items: { type: "string" } },
            risk_level: { type: "string", enum: ["low", "medium", "high"] },
            risk_factors: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysis(result);
      if (onAnalysisComplete) {
        onAnalysisComplete(result);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze content');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!content?.text || content.text.length < 10) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-slate-400" />
            Compliance & Brand Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Start typing your post to see compliance and brand voice analysis...
          </p>
        </CardContent>
      </Card>
    );
  }

  const getComplianceColor = (status) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'violation': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-violet-600" />
            Compliance & Brand Check
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={analyzeContent}
            disabled={analyzing}
          >
            <RefreshCw className={cn("w-4 h-4", analyzing && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyzing ? (
          <div className="flex items-center gap-3 py-4">
            <RefreshCw className="w-5 h-5 text-violet-600 animate-spin" />
            <p className="text-sm text-slate-600">Analyzing content...</p>
          </div>
        ) : analysis ? (
          <>
            {/* Brand Voice Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-sm font-medium">Brand Voice Score</span>
                </div>
                <span className={cn("text-2xl font-bold", getScoreColor(analysis.brand_voice_score))}>
                  {analysis.brand_voice_score}
                </span>
              </div>
              <Progress value={analysis.brand_voice_score} className="h-2" />
              {analysis.brand_voice_feedback && (
                <p className="text-xs text-slate-600">{analysis.brand_voice_feedback}</p>
              )}
            </div>

            {/* Compliance Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Compliance Status</span>
                </div>
                <Badge 
                  variant={analysis.compliance_status === 'compliant' ? 'default' : 'destructive'}
                  className={cn(
                    analysis.compliance_status === 'compliant' && 'bg-green-100 text-green-700',
                    analysis.compliance_status === 'warning' && 'bg-yellow-100 text-yellow-700'
                  )}
                >
                  {analysis.compliance_status === 'compliant' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {analysis.compliance_status === 'warning' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {analysis.compliance_status === 'violation' && <XCircle className="w-3 h-3 mr-1" />}
                  {analysis.compliance_status}
                </Badge>
              </div>
              {analysis.compliance_issues?.length > 0 && (
                <Alert variant={analysis.compliance_status === 'violation' ? 'destructive' : 'default'}>
                  <AlertDescription>
                    <ul className="text-xs space-y-1">
                      {analysis.compliance_issues.map((issue, i) => (
                        <li key={i}>• {issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Risk Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Risk Level</span>
                </div>
                <Badge 
                  variant="outline"
                  className={cn(
                    analysis.risk_level === 'low' && 'border-green-300 bg-green-50 text-green-700',
                    analysis.risk_level === 'medium' && 'border-yellow-300 bg-yellow-50 text-yellow-700',
                    analysis.risk_level === 'high' && 'border-red-300 bg-red-50 text-red-700'
                  )}
                >
                  {analysis.risk_level?.toUpperCase()}
                </Badge>
              </div>
              {analysis.risk_factors?.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <ul className="text-xs space-y-1">
                      {analysis.risk_factors.map((factor, i) => (
                        <li key={i}>• {factor}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Suggestions */}
            {analysis.suggestions?.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">Suggestions</span>
                </div>
                <ul className="text-xs space-y-1 text-slate-600">
                  {analysis.suggestions.map((suggestion, i) => (
                    <li key={i}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}