import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, ThumbsUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { cn } from '@/lib/utils';

export default function AIReplySuggestions({ comment, onUseReply, limitedMode = false }) {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReplies = async () => {
    if (!comment) return;
    
    setIsGenerating(true);
    try {
      const numSuggestions = limitedMode ? 2 : 3;
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Generate ${numSuggestions} professional, engaging reply suggestions for this social media comment:

Comment: "${comment}"

Each reply should:
- Be friendly and helpful
- Match a different tone (professional, casual, enthusiastic)
- Be concise (under 200 characters)
- Include a relevant emoji

Return as a JSON array of objects with: reply_text, tone, emoji`,
        response_json_schema: {
          type: "object",
          properties: {
            replies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  reply_text: { type: "string" },
                  tone: { type: "string" },
                  emoji: { type: "string" }
                }
              }
            }
          }
        }
      });
      
      setSuggestions(response.replies || []);
    } catch (error) {
      console.error('Failed to generate replies:', error);
      // Fallback suggestions
      setSuggestions([
        { reply_text: "Thanks for your comment! We really appreciate your feedback 🙏", tone: "Professional", emoji: "🙏" },
        { reply_text: "Love this! Thanks for sharing your thoughts with us ❤️", tone: "Casual", emoji: "❤️" }
      ].slice(0, limitedMode ? 2 : 3));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Reply copied to clipboard!');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            AI Reply Suggestions
            {limitedMode && <Badge variant="secondary" className="text-xs">Starter Plan</Badge>}
          </CardTitle>
          <Button 
            size="sm"
            onClick={generateReplies}
            disabled={isGenerating || !comment}
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Click Generate to get AI-powered reply suggestions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#d4af37]/50 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <Badge variant="secondary" className="text-xs">{suggestion.tone}</Badge>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCopy(suggestion.reply_text)}
                      className="h-7 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {onUseReply && (
                      <Button 
                        size="sm"
                        onClick={() => onUseReply(suggestion.reply_text)}
                        className="h-7 px-2 bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-700">{suggestion.reply_text}</p>
              </div>
            ))}
            
            {limitedMode && (
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">Upgrade to Growth for unlimited AI reply suggestions</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}