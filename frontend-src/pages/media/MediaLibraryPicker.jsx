import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Search, 
  Filter, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Check,
  X,
  Star,
  Tag as TagIcon
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function MediaLibraryPicker({ open, onClose, onSelect, allowMultiple = true, filterType = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newTags, setNewTags] = useState('');
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
          category: selectedCategory !== 'all' ? selectedCategory : 'other',
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
      toast.success(`${uploadedAssets.length} file(s) uploaded successfully`);
      
      if (allowMultiple) {
        setSelectedAssets(prev => [...prev, ...uploadedAssets]);
      } else {
        setSelectedAssets(uploadedAssets.slice(0, 1));
      }
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

  const toggleAsset = (asset) => {
    if (allowMultiple) {
      setSelectedAssets(prev => 
        prev.find(a => a.id === asset.id)
          ? prev.filter(a => a.id !== asset.id)
          : [...prev, asset]
      );
    } else {
      setSelectedAssets([asset]);
    }
  };

  const handleConfirm = () => {
    onSelect(allowMultiple ? selectedAssets : selectedAssets[0]);
    onClose();
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesType = !filterType || asset.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const brandAssets = filteredAssets.filter(a => a.is_brand_asset);
  const regularAssets = filteredAssets.filter(a => !a.is_brand_asset);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Media</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
            <TabsTrigger value="templates">Text Templates</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-4">
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
            </div>

            {/* Selected Count */}
            {selectedAssets.length > 0 && (
              <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-lg p-3">
                <span className="text-sm font-medium text-violet-900">
                  {selectedAssets.length} item{selectedAssets.length > 1 ? 's' : ''} selected
                </span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedAssets([])}>
                  Clear
                </Button>
              </div>
            )}

            {/* Media Grid */}
            <ScrollArea className="h-[400px]">
              {/* Brand Assets Section */}
              {brandAssets.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-slate-900">Brand Assets</h3>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Official
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {brandAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedAssets.some(a => a.id === asset.id)}
                        onToggle={() => toggleAsset(asset)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Assets Section */}
              {regularAssets.length > 0 && (
                <div>
                  {brandAssets.length > 0 && (
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">All Media</h3>
                  )}
                  <div className="grid grid-cols-4 gap-3">
                    {regularAssets.map((asset) => (
                      <AssetCard
                        key={asset.id}
                        asset={asset}
                        isSelected={selectedAssets.some(a => a.id === asset.id)}
                        onToggle={() => toggleAsset(asset)}
                      />
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
            </ScrollArea>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-600 mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500">Images, videos, GIFs up to 2GB</p>
              </label>
            </div>

            {uploadFiles.length > 0 && (
              <div className="space-y-3">
                <Label>Files to Upload ({uploadFiles.length})</Label>
                <div className="space-y-2">
                  {uploadFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700">{file.name}</span>
                      <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                      placeholder="summer, sale, product launch"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleUpload} disabled={uploadMutation.isPending} className="w-full">
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-violet-300",
                      selectedAssets.some(a => a.id === template.id)
                        ? "border-violet-600 bg-violet-50"
                        : "border-slate-200"
                    )}
                    onClick={() => toggleAsset(template)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{template.name}</h4>
                        <p className="text-sm text-slate-600 mt-1 line-clamp-2">{template.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          {template.tags?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {selectedAssets.some(a => a.id === template.id) && (
                        <Check className="w-5 h-5 text-violet-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedAssets.length === 0}>
            Insert {selectedAssets.length > 0 && `(${selectedAssets.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AssetCard({ asset, isSelected, onToggle }) {
  return (
    <div
      className={cn(
        "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
        isSelected ? "border-violet-600 ring-2 ring-violet-200" : "border-slate-200 hover:border-slate-300"
      )}
      onClick={onToggle}
    >
      {/* Asset Preview */}
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

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Brand Asset Badge */}
      {asset.is_brand_asset && (
        <div className="absolute top-2 left-2">
          <Badge className="bg-amber-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Brand
          </Badge>
        </div>
      )}

      {/* Info Overlay */}
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