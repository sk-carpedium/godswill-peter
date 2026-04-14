import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileVideo, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function VideoUploader({ platform, platformName, platformColor }) {
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [tags, setTags] = useState('');
  const [notifyFollowers, setNotifyFollowers] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const colorMap = {
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    green: 'bg-green-600 hover:bg-green-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      toast.success(`Selected: ${file.name}`);
    } else {
      toast.error('Please select a valid video file');
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnail(file);
      toast.success('Thumbnail selected');
    }
  };

  const handleUpload = async () => {
    if (!video || !title) {
      toast.error('Please select a video and enter a title');
      return;
    }

    setIsUploading(true);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          toast.success(`Video uploaded to ${platformName} successfully!`);
          setVideo(null);
          setThumbnail(null);
          setTitle('');
          setDescription('');
          setTags('');
          setUploadProgress(0);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Video to {platformName}</CardTitle>
            <CardDescription>Upload your video and manage its settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Video File *</Label>
              <div className="mt-2">
                {!video ? (
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className={cn(
                      "w-full border-2 border-dashed border-slate-300 rounded-xl p-12 transition-all",
                      `hover:border-${platformColor}-400 hover:bg-${platformColor}-50/50`
                    )}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", `bg-${platformColor}-100`)}>
                        <Upload className={cn("w-8 h-8", `text-${platformColor}-600`)} />
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-slate-900">Click to upload video</p>
                        <p className="text-sm text-slate-500 mt-1">MP4, MOV, AVI up to 500GB</p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="border-2 border-slate-200 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0", `bg-${platformColor}-100`)}>
                        <FileVideo className={cn("w-6 h-6", `text-${platformColor}-600`)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{video.name}</p>
                        <p className="text-sm text-slate-500">{formatFileSize(video.size)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setVideo(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
              </div>
            </div>

            <div>
              <Label>Custom Thumbnail</Label>
              <div className="mt-2">
                {!thumbnail ? (
                  <button
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-violet-400 hover:bg-violet-50/50 transition-all"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-slate-400" />
                      <p className="text-sm text-slate-600">Upload thumbnail (1280x720)</p>
                    </div>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={URL.createObjectURL(thumbnail)} alt="Thumbnail" className="w-full h-48 object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={() => setThumbnail(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input placeholder="Enter video title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="mt-2" />
                <p className="text-xs text-slate-500 mt-1">{title.length}/100</p>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea placeholder="Describe your video" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-[120px]" maxLength={5000} />
                <p className="text-xs text-slate-500 mt-1">{description.length}/5000</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Privacy</Label>
                  <Select value={privacy} onValueChange={setPrivacy}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags</Label>
                  <Input placeholder="gaming, tutorial, live" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-2" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                <div>
                  <Label className="text-sm font-medium">Notify Followers</Label>
                  <p className="text-xs text-slate-500 mt-1">Send notification when video is published</p>
                </div>
                <Switch checked={notifyFollowers} onCheckedChange={setNotifyFollowers} />
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Uploading...</span>
                  <span className="font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" disabled={isUploading}>Save as Draft</Button>
              <Button onClick={handleUpload} disabled={!video || !title || isUploading} className={cn("flex-1", colorMap[platformColor])}>
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", `text-${platformColor}-600`)} />
              <p className="text-slate-600">Use engaging thumbnails for better CTR</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", `text-${platformColor}-600`)} />
              <p className="text-slate-600">Add relevant tags for discoverability</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className={cn("w-4 h-4 mt-0.5 flex-shrink-0", `text-${platformColor}-600`)} />
              <p className="text-slate-600">Write detailed descriptions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}