import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/api/client';
import { Sparkles, Upload, Loader2, CheckCircle2, Palette, BookOpen, MessageSquare, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BrandVoiceTrainer({ brandId, onSave }) {
  const [isTraining, setIsTraining] = useState(false);
  const [samplePosts, setSamplePosts] = useState(['', '', '']);
  const [toneDescriptor, setToneDescriptor] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [bannedWords, setBannedWords] = useState('');
  const [preferredHashtags, setPreferredHashtags] = useState('');
  const [formalityLevel, setFormalityLevel] = useState('neutral');
  const [emojiUsage, setEmojiUsage] = useState('moderate');
  const [voiceProfile, setVoiceProfile] = useState(null);

  const addSamplePost = () => {
    setSamplePosts([...samplePosts, '']);
  };

  const updateSamplePost = (index, value) => {
    const updated = [...samplePosts];
    updated[index] = value;
    setSamplePosts(updated);
  };

  const removeSamplePost = (index) => {
    setSamplePosts(samplePosts.filter((_, i) => i !== index));
  };

  const handleTrainVoice = async () => {
    if (samplePosts.filter(p => p.trim()).length < 3) {
      toast.error('Please provide at least 3 sample posts');
      return;
    }

    setIsTraining(true);
    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: `Analyze these sample social media posts and create a comprehensive brand voice profile:

Sample Posts:
${samplePosts.filter(p => p.trim()).map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

Additional Context:
- Tone Descriptor: ${toneDescriptor || 'Not specified'}
- Target Audience: ${targetAudience || 'Not specified'}
- Banned Words: ${bannedWords || 'None'}
- Preferred Hashtags: ${preferredHashtags || 'None'}
- Formality Level: ${formalityLevel}
- Emoji Usage: ${emojiUsage}

Extract and define:
1. Core personality traits (3-5 adjectives)
2. Tone characteristics (formal/casual, enthusiastic/reserved, etc.)
3. Common sentence structures and patterns
4. Vocabulary style (technical, conversational, poetic, etc.)
5. Punctuation patterns
6. Emoji usage patterns
7. Hashtag strategy
8. Call-to-action style
9. Content themes and topics
10. Writing do's and don'ts

Return a structured profile that can be used to generate on-brand content.`,
        response_json_schema: {
          type: "object",
          properties: {
            personality_traits: {
              type: "array",
              items: { type: "string" }
            },
            tone: {
              type: "object",
              properties: {
                formality: { type: "string" },
                energy: { type: "string" },
                characteristics: { type: "array", items: { type: "string" } }
              }
            },
            vocabulary_style: { type: "string" },
            sentence_patterns: {
              type: "array",
              items: { type: "string" }
            },
            emoji_patterns: { type: "string" },
            hashtag_strategy: { type: "string" },
            cta_style: { type: "string" },
            content_themes: {
              type: "array",
              items: { type: "string" }
            },
            dos: {
              type: "array",
              items: { type: "string" }
            },
            donts: {
              type: "array",
              items: { type: "string" }
            },
            example_opening_lines: {
              type: "array",
              items: { type: "string" }
            },
            example_closing_lines: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setVoiceProfile(response);
      
      // Save to brand entity
      if (brandId && onSave) {
        await onSave({
          brand_voice: {
            tone: response.personality_traits,
            personality_traits: response.personality_traits,
            banned_words: bannedWords.split(',').map(w => w.trim()).filter(Boolean),
            preferred_hashtags: preferredHashtags.split(',').map(h => h.trim()).filter(Boolean),
            emoji_usage: emojiUsage,
            formality: formalityLevel,
            sample_posts: samplePosts.filter(p => p.trim()),
            ai_profile: response
          }
        });
      }
      
      toast.success('Brand voice trained successfully!');
    } catch (error) {
      console.error('Failed to train voice:', error);
      toast.error('Failed to train brand voice');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-[#d4af37]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#d4af37]" />
            AI Brand Voice Training
          </CardTitle>
          <p className="text-sm text-slate-500">
            Train AI to understand and replicate your unique brand voice
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sample Posts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                Sample Posts (min 3 required)
              </Label>
              <Button type="button" size="sm" variant="outline" onClick={addSamplePost}>
                Add Sample
              </Button>
            </div>
            {samplePosts.map((post, index) => (
              <div key={index} className="relative">
                <Textarea
                  value={post}
                  onChange={(e) => updateSamplePost(index, e.target.value)}
                  placeholder={`Sample post ${index + 1}...`}
                  className="min-h-[80px]"
                />
                {samplePosts.length > 3 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => removeSamplePost(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tone Descriptor</Label>
              <Input
                placeholder="e.g., Professional yet approachable"
                value={toneDescriptor}
                onChange={(e) => setToneDescriptor(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input
                placeholder="e.g., Millennials interested in tech"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Formality Level</Label>
              <Select value={formalityLevel} onValueChange={setFormalityLevel}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_formal">Very Formal</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="very_casual">Very Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Emoji Usage</Label>
              <Select value={emojiUsage} onValueChange={setEmojiUsage}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="frequent">Frequent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Banned Words (comma-separated)</Label>
              <Input
                placeholder="e.g., cheap, discount, limited"
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Preferred Hashtags (comma-separated)</Label>
              <Input
                placeholder="e.g., #BrandName, #Innovation"
                value={preferredHashtags}
                onChange={(e) => setPreferredHashtags(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <Button
            onClick={handleTrainVoice}
            disabled={isTraining}
            className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Training AI on Brand Voice...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Train Brand Voice
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Voice Profile Results */}
      {voiceProfile && (
        <Card className="border-2 border-green-200 bg-green-50/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">Brand Voice Profile Created</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700">Personality Traits</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {voiceProfile.personality_traits?.map((trait, i) => (
                  <Badge key={i} className="bg-[#d4af37]/20 text-[#d4af37]">{trait}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700">Tone Characteristics</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {voiceProfile.tone?.characteristics?.map((char, i) => (
                  <Badge key={i} variant="secondary">{char}</Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700">Content Themes</Label>
              <ul className="list-disc list-inside text-sm text-slate-600 mt-2 space-y-1">
                {voiceProfile.content_themes?.map((theme, i) => (
                  <li key={i}>{theme}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <Label className="text-sm font-semibold text-green-900 mb-2 block">Do's ✅</Label>
                <ul className="text-xs text-green-800 space-y-1">
                  {voiceProfile.dos?.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <Label className="text-sm font-semibold text-red-900 mb-2 block">Don'ts ❌</Label>
                <ul className="text-xs text-red-800 space-y-1">
                  {voiceProfile.donts?.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>AI is now trained!</strong> All future content generation will follow this brand voice. 
                The AI will maintain consistency across all platforms and content types.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}