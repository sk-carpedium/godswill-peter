import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Plus,
  Filter,
  Grid3x3,
  List,
  Star,
  Trash2,
  Edit,
  MoreVertical,
  Download,
  Tag as TagIcon,
  X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function MediaLibrary() {
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('media');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newTags, setNewTags] = useState('');
  const [uploadCategory, setUploadCategory] = useState('other');
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ['media-assets'],
    queryFn: async () => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return [];
      return base44.entities.MediaAsset.filter({ workspace_id: workspaces[0].id });
    }
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['content-templates'],
    queryFn: async () => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      if (workspaces.length === 0) return [];
      return base44.entities.ContentTemplate.filter({ workspace_id: workspaces[0].id });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.MediaAsset.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
      toast.success('Asset deleted successfully');
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.ContentTemplate.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-templates'] });
      toast.success('Template deleted successfully');
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (files) => {
      const workspaces = await base44.entities.Workspace.filter({ status: 'active' });
      const uploaded = [];

      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        
        const asset = await base44.entities.MediaAsset.create({
          workspace_id: workspaces[0].id,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
          url: file_url,
          file_size: file.size,
          mime_type: file.type,
          category: uploadCategory,
          tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
        });
        
        uploaded.push(asset);
      }
      
      return uploaded;
    },
    onSuccess: (uploadedAssets) => {
      queryClient.invalidateQueries({ queryKey: ['media-assets'] });
      setUploadFiles([]);
      setNewTags('');
      setShowUpload(false);
      toast.success(`${uploadedAssets.length} file(s) uploaded successfully`);
    }
  });

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadFiles(files);
  };

  const handleUpload = () => {
    if (uploadFiles.length === 0) return;
    uploadMutation.mutate(uploadFiles);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const brandAssets = filteredAssets.filter(a => a.is_brand_asset);
  const regularAssets = filteredAssets.filter(a => !a.is_brand_asset);

  const stats = {
    total: assets.length,
    images: assets.filter(a => a.type === 'image').length,
    videos: assets.filter(a => a.type === 'video').length,
    templates: templates.length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Media Library</h1>
          <p className="text-slate-600 mt-1">Manage your brand assets and content templates</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Assets</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-violet-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Images</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.images}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Videos</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.videos}</p>
              </div>
              <Video className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Templates</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.templates}</p>
              </div>
              <FileText className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="media">Media Assets</TabsTrigger>
                <TabsTrigger value="templates">Text Templates</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('grid')}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or tags..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {selectedTab === 'media' && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="brand_asset">Brand Assets</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Media Assets Tab */}
          {selectedTab === 'media' && (
            <div className="space-y-6">
              {/* Brand Assets Section */}
              {brandAssets.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Brand Assets</h3>
                    <Badge className="bg-amber-100 text-amber-700">Official</Badge>
                  </div>
                  <div className={cn(
                    view === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3' : 'space-y-2'
                  )}>
                    {brandAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} view={view} onDelete={deleteMutation.mutate} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Assets */}
              {regularAssets.length > 0 && (
                <div>
                  {brandAssets.length > 0 && (
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">All Media</h3>
                  )}
                  <div className={cn(
                    view === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3' : 'space-y-2'
                  )}>
                    {regularAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} view={view} onDelete={deleteMutation.mutate} />
                    ))}
                  </div>
                </div>
              )}

              {filteredAssets.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No media found</p>
                </div>
              )}
            </div>
          )}

          {/* Templates Tab */}
          {selectedTab === 'templates' && (
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{template.name}</h4>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{template.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">{template.category}</Badge>
                        {template.tags?.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteTemplateMutation.mutate(template.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No templates found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">Images, videos up to 2GB</p>
              </label>
            </div>

            {uploadFiles.length > 0 && (
              <div className="space-y-3">
                <Label>Files to Upload ({uploadFiles.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={uploadCategory} onValueChange={setUploadCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="promotional">Promotional</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="social_media">Social Media</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      placeholder="summer, sale, product"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setShowUpload(false); setUploadFiles([]); }} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="flex-1">
                    {uploadMutation.isPending ? 'Uploading...' : `Upload ${uploadFiles.length} File(s)`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssetCard({ asset, view, onDelete }) {
  if (view === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg hover:border-violet-300 transition-colors">
        <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
          {asset.type === 'image' ? (
            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover rounded" />
          ) : asset.type === 'video' ? (
            <Video className="w-6 h-6 text-slate-400" />
          ) : (
            <FileText className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-slate-900">{asset.name}</h4>
            {asset.is_brand_asset && (
              <Badge className="bg-amber-100 text-amber-700">
                <Star className="w-3 h-3 mr-1" />
                Brand
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{asset.category}</Badge>
            {asset.tags?.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(asset.url, '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(asset.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-slate-200 hover:border-violet-300 transition-colors">
      <div className="aspect-square bg-slate-100 flex items-center justify-center">
        {asset.type === 'image' ? (
          <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
        ) : asset.type === 'video' ? (
          <div className="relative w-full h-full">
            <video src={asset.url} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
        ) : (
          <FileText className="w-8 h-8 text-slate-400" />
        )}
      </div>

      {asset.is_brand_asset && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-amber-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Brand
          </Badge>
        </div>
      )}

      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => window.open(asset.url, '_blank')}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" />
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(asset.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-medium truncate">{asset.name}</p>
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {asset.tags.slice(0, 2).map((tag, i) => (
              <span key={i} className="text-[10px] bg-white/20 text-white px-1 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}