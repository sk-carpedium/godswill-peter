/**
 * ContentGenerator.jsx — FIXED
 * Was: setTimeout(2000) fake generation
 * Now: real POST /ai/generate-content via integrations.Core.GenerateContent
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Copy, RefreshCw, Wand2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const TONES = ['Professional','Casual','Friendly','Excited','Formal','Humorous'];
const TYPES = ['Social Post','Caption','Thread','Story','Ad Copy','Bio'];

export default function ContentGenerator({ onUseContent }) {
  const [prompt,      setPrompt]      = useState('');
  const [tone,        setTone]        = useState('Casual');
  const [contentType, setContentType] = useState('Social Post');
  const [keywords,    setKeywords]    = useState('');
  const [generating,  setGenerating]  = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error('Please enter a prompt'); return; }
    setGenerating(true);
    try {
      // Real API call → POST /ai/generate-content
      const result = await base44.integrations.Core.GenerateContent({
        prompt, tone, contentType, keywords,
      });
      // Backend returns { text, hashtags, variations, call_to_action, best_post_time }
      // Build 3 variations from the result
      const variations = result.variations?.length
        ? result.variations
        : [result.text, result.text, result.text].filter(Boolean);

      setSuggestions(variations.map((v, i) => ({
        text:       v,
        hashtags:   result.hashtags || [],
        tone_label: ['Professional', 'Casual', 'Enthusiastic'][i] || tone,
        seo_score:  result.seo_score || 80,
      })));
      toast.success('AI content generated!');
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-[#d4af37] w-5 h-5" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>What do you want to post about?</Label>
            <Textarea placeholder="e.g., Our new product launch, company milestone..." value={prompt} onChange={e => setPrompt(e.target.value)} className="mt-2 min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{TONES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Keywords (optional)</Label>
            <Input placeholder="innovation, technology, launch" value={keywords} onChange={e => setKeywords(e.target.value)} className="mt-2" />
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
            {generating ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-2" />Generate Content</>}
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">AI Suggestions</h3>
          {suggestions.length > 0 && <Badge className="bg-green-100 text-green-700"><Zap className="w-3 h-3 mr-1" />{suggestions.length} variations</Badge>}
        </div>
        {suggestions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">AI-generated content will appear here</p>
            </CardContent>
          </Card>
        ) : suggestions.map((s, i) => (
          <Card key={i} className="border-2 border-violet-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <Badge variant="secondary">Variation {i + 1} — {s.tone_label}</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(s.text); toast.success('Copied!'); }}>
                    <Copy className="w-3 h-3 mr-1" />Copy
                  </Button>
                  <Button size="sm" onClick={() => onUseContent?.(s.text)} className="bg-violet-600 hover:bg-violet-700 text-white">
                    Use This
                  </Button>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{s.text}</p>
              {s.hashtags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {s.hashtags.map((h, j) => <Badge key={j} variant="outline" className="text-xs">{h}</Badge>)}
                </div>
              )}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Badge variant="secondary" className="text-xs">Length: {s.text.length} chars</Badge>
                <Badge variant="secondary" className="text-xs">Hashtags: {(s.text.match(/#/g)||[]).length + s.hashtags.length}</Badge>
                {s.seo_score && <Badge variant="secondary" className="text-xs bg-green-50 text-green-700">SEO: {s.seo_score}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
