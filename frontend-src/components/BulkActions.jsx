import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Zap,
  Calendar,
  Trash2,
  Copy,
  Tag,
  CheckCircle2,
  Loader2,
  Archive,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function BulkActions({ selectedPosts = [], onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState('');
  const [processing, setProcessing] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [label, setLabel] = useState('');

  const actions = [
    { value: 'publish', label: 'Publish Now', icon: Send, color: 'text-green-600' },
    { value: 'schedule', label: 'Reschedule', icon: Calendar, color: 'text-blue-600' },
    { value: 'change_status', label: 'Change Status', icon: CheckCircle2, color: 'text-violet-600' },
    { value: 'add_label', label: 'Add Label', icon: Tag, color: 'text-amber-600' },
    { value: 'duplicate', label: 'Duplicate', icon: Copy, color: 'text-slate-600' },
    { value: 'archive', label: 'Archive', icon: Archive, color: 'text-orange-600' },
    { value: 'delete', label: 'Delete', icon: Trash2, color: 'text-red-600' }
  ];

  const handleExecute = async () => {
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    setProcessing(true);
    
    try {
      switch (action) {
        case 'publish':
          for (const post of selectedPosts) {
            await base44.entities.Post.update(post.id, { status: 'published' });
          }
          toast.success(`${selectedPosts.length} posts published!`);
          break;
          
        case 'schedule':
          if (!scheduledTime) {
            toast.error('Please select a time');
            setProcessing(false);
            return;
          }
          for (const post of selectedPosts) {
            await base44.entities.Post.update(post.id, {
              status: 'scheduled',
              schedule: {
                ...post.schedule,
                type: 'scheduled',
                scheduled_at: scheduledTime
              }
            });
          }
          toast.success(`${selectedPosts.length} posts rescheduled!`);
          break;
          
        case 'change_status':
          if (!newStatus) {
            toast.error('Please select a status');
            setProcessing(false);
            return;
          }
          for (const post of selectedPosts) {
            await base44.entities.Post.update(post.id, { status: newStatus });
          }
          toast.success(`${selectedPosts.length} posts updated!`);
          break;
          
        case 'add_label':
          if (!label) {
            toast.error('Please enter a label');
            setProcessing(false);
            return;
          }
          for (const post of selectedPosts) {
            const existingLabels = post.labels || [];
            await base44.entities.Post.update(post.id, {
              labels: [...existingLabels, label]
            });
          }
          toast.success(`Label "${label}" added to ${selectedPosts.length} posts!`);
          break;
          
        case 'duplicate':
          for (const post of selectedPosts) {
            const { id, created_date, updated_date, created_by, ...postData } = post;
            await base44.entities.Post.create({
              ...postData,
              title: `${post.title} (Copy)`,
              status: 'draft'
            });
          }
          toast.success(`${selectedPosts.length} posts duplicated!`);
          break;
          
        case 'archive':
          for (const post of selectedPosts) {
            await base44.entities.Post.update(post.id, { status: 'archived' });
          }
          toast.success(`${selectedPosts.length} posts archived!`);
          break;
          
        case 'delete':
          if (!window.confirm(`Delete ${selectedPosts.length} posts permanently? This cannot be undone.`)) {
            setProcessing(false);
            return;
          }
          for (const post of selectedPosts) {
            await base44.entities.Post.delete(post.id);
          }
          toast.success(`${selectedPosts.length} posts deleted!`);
          break;
      }
      
      setIsOpen(false);
      setAction('');
      setNewStatus('');
      setScheduledTime('');
      setLabel('');
      onComplete?.();
      
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Failed to complete bulk action');
    } finally {
      setProcessing(false);
    }
  };

  if (selectedPosts.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950">
          <Zap className="w-4 h-4 mr-2" />
          Bulk Actions ({selectedPosts.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Apply action to {selectedPosts.length} selected post{selectedPosts.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label>Select Action</Label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                {actions.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    <div className="flex items-center gap-2">
                      <a.icon className={cn("w-4 h-4", a.color)} />
                      {a.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {action === 'schedule' && (
            <div>
              <Label>Schedule Time</Label>
              <Input
                type="datetime-local"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          )}

          {action === 'change_status' && (
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {action === 'add_label' && (
            <div>
              <Label>Label Name</Label>
              <Input
                placeholder="e.g., campaign-summer"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleExecute}
            disabled={processing || !action}
            className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Execute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}