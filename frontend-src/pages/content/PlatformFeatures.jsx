import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, FileText, Clock, Target, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlatformFeatures({ platforms = [] }) {
  const [instagramShopping, setInstagramShopping] = useState(false);
  const [linkedinArticle, setLinkedinArticle] = useState(false);
  const [storyTimer, setStoryTimer] = useState('24');
  const [productTag, setProductTag] = useState('');
  const [articleUrl, setArticleUrl] = useState('');

  const hasInstagram = platforms.includes('instagram');
  const hasLinkedIn = platforms.includes('linkedin');
  const hasStoryPlatform = platforms.some(p => ['instagram', 'facebook'].includes(p));

  return (
    <div className="space-y-4">
      {/* Instagram Shopping Tags */}
      {hasInstagram && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                <CardTitle className="text-base">Instagram Shopping</CardTitle>
              </div>
              <Switch checked={instagramShopping} onCheckedChange={setInstagramShopping} />
            </div>
          </CardHeader>
          {instagramShopping && (
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Product Tags</Label>
                <Input
                  placeholder="Enter product IDs (comma separated)"
                  value={productTag}
                  onChange={(e) => setProductTag(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Tag up to 5 products in your post</p>
              </div>
              <div>
                <Label className="text-sm">Product Collection</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summer">Summer Collection</SelectItem>
                    <SelectItem value="bestsellers">Best Sellers</SelectItem>
                    <SelectItem value="new">New Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-900">Track product clicks</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Advanced Story Scheduling */}
      {hasStoryPlatform && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d4af37]" />
              <CardTitle className="text-base">Story Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Story Duration</Label>
              <Select value={storyTimer} onValueChange={setStoryTimer}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours (Default)</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="highlight">Add to Highlights</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Allow Story Replies</Label>
                  <p className="text-xs text-slate-500">Let followers send you direct messages</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Share to Feed</Label>
                  <p className="text-xs text-slate-500">Also post to main feed after 24h</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* LinkedIn Article Publishing */}
      {hasLinkedIn && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#d4af37]" />
                <CardTitle className="text-base">LinkedIn Article</CardTitle>
              </div>
              <Switch checked={linkedinArticle} onCheckedChange={setLinkedinArticle} />
            </div>
          </CardHeader>
          {linkedinArticle && (
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm">Article Headline</Label>
                <Input
                  placeholder="Enter article title..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm">Article URL (Optional)</Label>
                <Input
                  placeholder="https://..."
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-slate-500 mt-1">Link to full article on your website</p>
              </div>
              <div>
                <Label className="text-sm">Industry Category</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="business">Business Strategy</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <Target className="w-3 h-3 mr-1" />
                +35% higher engagement for articles
              </Badge>
            </CardContent>
          )}
        </Card>
      )}

      {platforms.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-slate-500">
            Select platforms to see advanced features
          </CardContent>
        </Card>
      )}
    </div>
  );
}