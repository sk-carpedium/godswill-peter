import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import {
  Lock,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Search,
  Filter,
  Shield,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import moment from 'moment';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

const documents = [
  {
    id: '1',
    name: 'Monthly Performance Report - January 2026',
    type: 'pdf',
    size: '2.4 MB',
    category: 'reports',
    shared_at: new Date(Date.now() - 86400000),
    expires_at: new Date(Date.now() + 86400000 * 30),
    downloads: 3,
    status: 'active'
  },
  {
    id: '2',
    name: 'Brand Guidelines 2026',
    type: 'pdf',
    size: '5.1 MB',
    category: 'assets',
    shared_at: new Date(Date.now() - 172800000),
    expires_at: null,
    downloads: 12,
    status: 'active'
  },
  {
    id: '3',
    name: 'Campaign Creative Assets',
    type: 'zip',
    size: '24.8 MB',
    category: 'assets',
    shared_at: new Date(Date.now() - 259200000),
    expires_at: null,
    downloads: 5,
    status: 'active'
  },
  {
    id: '4',
    name: 'Q1 Strategy Deck',
    type: 'pdf',
    size: '8.3 MB',
    category: 'documents',
    shared_at: new Date(Date.now() - 604800000),
    expires_at: new Date(Date.now() + 86400000 * 60),
    downloads: 8,
    status: 'active'
  }
];

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return FileText;
    case 'image':
    case 'jpg':
    case 'png':
      return ImageIcon;
    case 'video':
    case 'mp4':
      return Video;
    default:
      return File;
  }
};

export default function SecureDocuments({ primaryColor }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (doc) => {
    setDownloading(true);
    // Simulate secure download
    await new Promise(resolve => setTimeout(resolve, 1500));
    setDownloading(false);
    toast.success(`Downloading ${doc.name}...`);
  };

  const handleView = (doc) => {
    setSelectedDoc(doc);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2" style={{ borderColor: `${primaryColor}20` }}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
              <Shield className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Secure Document Library</h2>
              <p className="text-slate-600">
                Access your reports, brand assets, and shared documents securely
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600">End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-slate-600">Secure access only</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="reports">Reports</SelectItem>
            <SelectItem value="assets">Brand Assets</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const FileIcon = getFileIcon(doc.type);
          const isExpiring = doc.expires_at && new Date(doc.expires_at) < new Date(Date.now() + 86400000 * 7);

          return (
            <Card key={doc.id} className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
                    doc.type === 'pdf' ? 'bg-red-50' :
                    doc.type === 'zip' ? 'bg-violet-50' : 'bg-blue-50'
                  )}>
                    <FileIcon className={cn(
                      "w-6 h-6",
                      doc.type === 'pdf' ? 'text-red-600' :
                      doc.type === 'zip' ? 'text-violet-600' : 'text-blue-600'
                    )} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 truncate">{doc.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span className="capitalize">{doc.category}</span>
                      <span>•</span>
                      <span>{doc.downloads} downloads</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        Shared {moment(doc.shared_at).fromNow()}
                      </Badge>
                      {doc.expires_at && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            isExpiring ? "border-red-200 text-red-700 bg-red-50" : "border-slate-200"
                          )}
                        >
                          Expires {moment(doc.expires_at).fromNow()}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(doc)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        disabled={downloading}
                        className="flex-1 text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {downloading ? 'Downloading...' : 'Download'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">No documents found</h3>
            <p className="text-slate-500">Try adjusting your search or filters</p>
          </div>
        </Card>
      )}

      {/* Document Viewer Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-[8.5/11] bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600">Document Preview</p>
                <p className="text-xs text-slate-500 mt-1">
                  Full preview available after download
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedDoc(null)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}