import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Settings,
  GripVertical,
  Plus,
  Trash2,
  Eye,
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  MessageSquare,
  DollarSign,
  PieChart,
  LineChart,
  Activity,
  Target,
  Heart,
  Share2,
  Image as ImageIcon,
  FileText,
  Hash,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const widgetLibrary = [
  { 
    id: 'kpi_card', 
    name: 'KPI Card', 
    icon: Target, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Single metric display',
    category: 'metrics',
    configurable: ['metric', 'target', 'label', 'color']
  },
  { 
    id: 'performance_chart', 
    name: 'Performance Chart', 
    icon: BarChart3, 
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Bar chart visualization',
    category: 'charts',
    configurable: ['metrics', 'timeRange', 'chartStyle']
  },
  { 
    id: 'line_chart', 
    name: 'Trend Chart', 
    icon: LineChart, 
    color: 'bg-purple-100 text-purple-700',
    description: 'Line chart for trends',
    category: 'charts',
    configurable: ['metrics', 'timeRange', 'compareMode']
  },
  { 
    id: 'pie_chart', 
    name: 'Distribution Chart', 
    icon: PieChart, 
    color: 'bg-pink-100 text-pink-700',
    description: 'Pie/donut chart',
    category: 'charts',
    configurable: ['metric', 'breakdown']
  },
  { 
    id: 'engagement_stats', 
    name: 'Engagement Overview', 
    icon: Heart, 
    color: 'bg-rose-100 text-rose-700',
    description: 'Likes, comments, shares',
    category: 'metrics',
    configurable: ['platforms', 'timeRange']
  },
  { 
    id: 'audience_growth', 
    name: 'Audience Growth', 
    icon: Users, 
    color: 'bg-amber-100 text-amber-700',
    description: 'Follower trends',
    category: 'metrics',
    configurable: ['platforms', 'showGrowthRate']
  },
  { 
    id: 'recent_posts', 
    name: 'Recent Posts', 
    icon: MessageSquare, 
    color: 'bg-cyan-100 text-cyan-700',
    description: 'Latest published content',
    category: 'content',
    configurable: ['limit', 'platforms', 'showMetrics']
  },
  { 
    id: 'content_calendar', 
    name: 'Content Calendar', 
    icon: Calendar, 
    color: 'bg-violet-100 text-violet-700',
    description: 'Scheduled posts view',
    category: 'content',
    configurable: ['daysAhead', 'viewMode']
  },
  { 
    id: 'revenue_tracking', 
    name: 'Revenue Tracker', 
    icon: DollarSign, 
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Earnings & ROI',
    category: 'monetization',
    configurable: ['sources', 'timeRange', 'currency']
  },
  { 
    id: 'top_performing', 
    name: 'Top Performing Posts', 
    icon: TrendingUp, 
    color: 'bg-green-100 text-green-700',
    description: 'Best content by metrics',
    category: 'content',
    configurable: ['limit', 'sortBy', 'timeRange']
  },
  { 
    id: 'platform_breakdown', 
    name: 'Platform Breakdown', 
    icon: Globe, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Performance by platform',
    category: 'metrics',
    configurable: ['metrics', 'visualization']
  },
  { 
    id: 'activity_feed', 
    name: 'Activity Feed', 
    icon: Activity, 
    color: 'bg-slate-100 text-slate-700',
    description: 'Recent interactions',
    category: 'engagement',
    configurable: ['limit', 'activityTypes']
  },
  { 
    id: 'text_block', 
    name: 'Text Block', 
    icon: FileText, 
    color: 'bg-gray-100 text-gray-700',
    description: 'Custom text or notes',
    category: 'custom',
    configurable: ['content', 'styling', 'alignment']
  },
  { 
    id: 'image_banner', 
    name: 'Image Banner', 
    icon: ImageIcon, 
    color: 'bg-teal-100 text-teal-700',
    description: 'Brand or promotional image',
    category: 'custom',
    configurable: ['imageUrl', 'height', 'link']
  }
];

export default function ClientDashboardBuilder({ clientWorkspaceId, initialLayout = [] }) {
  const [layout, setLayout] = useState(initialLayout.length > 0 ? initialLayout : [
    { id: '1', type: 'kpi_card', name: 'Total Reach', order: 0, visible: true, size: 'small', config: { metric: 'reach', color: 'blue' } },
    { id: '2', type: 'performance_chart', name: 'Performance Overview', order: 1, visible: true, size: 'large', config: {} },
    { id: '3', type: 'recent_posts', name: 'Recent Posts', order: 2, visible: true, size: 'medium', config: { limit: 5 } }
  ]);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({});

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(layout);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLayout(items.map((item, index) => ({ ...item, order: index })));
  };

  const addWidget = (widgetType) => {
    const newWidget = {
      id: Date.now().toString(),
      type: widgetType.id,
      name: widgetType.name,
      order: layout.length,
      visible: true,
      size: 'medium',
      config: {}
    };
    setLayout([...layout, newWidget]);
    setShowWidgetLibrary(false);
    toast.success(`${widgetType.name} added to dashboard`);
  };

  const removeWidget = (id) => {
    setLayout(layout.filter(w => w.id !== id));
    toast.success('Widget removed');
  };

  const updateWidget = (id, updates) => {
    setLayout(layout.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const updateWidgetConfig = (id, config) => {
    setLayout(layout.map(w => w.id === id ? { ...w, config: { ...w.config, ...config } } : w));
  };

  const saveDashboard = async () => {
    if (!clientWorkspaceId) {
      toast.error('No client workspace selected');
      return;
    }

    try {
      await base44.entities.Workspace.update(clientWorkspaceId, {
        settings: {
          custom_dashboard_layout: layout
        }
      });
      toast.success('Dashboard saved successfully');
    } catch (error) {
      toast.error('Failed to save dashboard');
      console.error(error);
    }
  };

  const visibleWidgets = layout.filter(w => w.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Builder</h2>
          <p className="text-sm text-slate-500 mt-1">Design a custom dashboard for your client</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Edit Mode' : 'Preview'}
          </Button>
          <Button
            onClick={() => setShowWidgetLibrary(true)}
            className="bg-[#d4af37] hover:bg-[#c9a961] text-slate-950"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </Button>
          <Button onClick={saveDashboard} variant="default">
            Save Dashboard
          </Button>
        </div>
      </div>

      {/* Widget Library Dialog */}
      <Dialog open={showWidgetLibrary} onOpenChange={setShowWidgetLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Widget Library</DialogTitle>
            <CardDescription>Choose widgets to add to your client's dashboard</CardDescription>
          </DialogHeader>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>

            {['all', 'metrics', 'charts', 'content', 'engagement', 'monetization', 'custom'].map(category => (
              <TabsContent key={category} value={category} className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {widgetLibrary
                    .filter(w => category === 'all' || w.category === category)
                    .map((widget) => (
                      <button
                        key={widget.id}
                        onClick={() => addWidget(widget)}
                        className="p-4 rounded-lg border-2 border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all text-left"
                      >
                        <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-3", widget.color)}>
                          <widget.icon className="w-6 h-6" />
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">{widget.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{widget.description}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">{widget.category}</Badge>
                      </button>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Widget Configuration Dialog */}
      <Dialog open={!!configuringWidget} onOpenChange={() => setConfiguringWidget(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Widget</DialogTitle>
            <CardDescription>Customize widget settings and appearance</CardDescription>
          </DialogHeader>
          
          {configuringWidget && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Widget Name</Label>
                <Input
                  value={configuringWidget.name}
                  onChange={(e) => setConfiguringWidget({ ...configuringWidget, name: e.target.value })}
                  placeholder="Enter widget name"
                />
              </div>

              <div>
                <Label>Size</Label>
                <Select
                  value={configuringWidget.size}
                  onValueChange={(value) => setConfiguringWidget({ ...configuringWidget, size: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (1/4 width)</SelectItem>
                    <SelectItem value="medium">Medium (1/2 width)</SelectItem>
                    <SelectItem value="large">Large (3/4 width)</SelectItem>
                    <SelectItem value="full">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dynamic configuration based on widget type */}
              {configuringWidget.type === 'kpi_card' && (
                <>
                  <div>
                    <Label>Metric</Label>
                    <Select
                      value={configuringWidget.config.metric}
                      onValueChange={(value) => setWidgetConfig({ ...widgetConfig, metric: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select metric" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reach">Reach</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="followers">Followers</SelectItem>
                        <SelectItem value="impressions">Impressions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Value (Optional)</Label>
                    <Input type="number" placeholder="e.g., 10000" />
                  </div>
                </>
              )}

              {(configuringWidget.type.includes('chart') || configuringWidget.type === 'performance_chart') && (
                <div>
                  <Label>Time Range</Label>
                  <Select defaultValue="7days">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfiguringWidget(null)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (configuringWidget) {
                  updateWidget(configuringWidget.id, { ...configuringWidget, config: widgetConfig });
                  setConfiguringWidget(null);
                  setWidgetConfig({});
                  toast.success('Widget updated');
                }
              }}
              className="bg-[#d4af37] hover:bg-[#c9a961] text-slate-950"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dashboard Layout */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dashboard Layout</CardTitle>
              <CardDescription>
                {layout.length} widgets • {visibleWidgets.length} visible
                {!previewMode && ' • Drag to reorder'}
              </CardDescription>
            </div>
            {layout.length > 0 && (
              <Badge variant="secondary">
                {previewMode ? 'Preview Mode' : 'Edit Mode'}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {layout.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-lg">
              <Plus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-3">No widgets added yet</p>
              <Button
                onClick={() => setShowWidgetLibrary(true)}
                className="bg-[#d4af37] hover:bg-[#c9a961] text-slate-950"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Widget
              </Button>
            </div>
          ) : previewMode ? (
            /* Preview Mode - Show widgets as they'll appear */
            <div className="grid grid-cols-12 gap-4">
              {visibleWidgets.map((widget) => {
                const widgetType = widgetLibrary.find(w => w.id === widget.type);
                if (!widgetType) return null;

                const colSpan = {
                  small: 'col-span-12 md:col-span-3',
                  medium: 'col-span-12 md:col-span-6',
                  large: 'col-span-12 md:col-span-9',
                  full: 'col-span-12'
                }[widget.size] || 'col-span-12 md:col-span-6';

                return (
                  <Card key={widget.id} className={colSpan}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <widgetType.icon className="w-5 h-5 text-[#d4af37]" />
                        {widget.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg flex items-center justify-center">
                        <widgetType.icon className="w-8 h-8 text-slate-300" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Edit Mode - Drag and Drop */
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {layout.map((widget, index) => {
                      const widgetType = widgetLibrary.find(w => w.id === widget.type);
                      if (!widgetType) return null;

                      return (
                        <Draggable key={widget.id} draggableId={widget.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "p-4 rounded-lg border-2 bg-white transition-all",
                                snapshot.isDragging ? "border-[#d4af37] shadow-lg" : "border-slate-200",
                                !widget.visible && "opacity-50"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-5 h-5 text-slate-400" />
                                </div>
                                
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", widgetType.color)}>
                                  <widgetType.icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-900 truncate">{widget.name}</h4>
                                  <p className="text-xs text-slate-500">{widgetType.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {widget.size}
                                  </Badge>
                                  
                                  <Switch
                                    checked={widget.visible}
                                    onCheckedChange={(checked) => updateWidget(widget.id, { visible: checked })}
                                  />

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setConfiguringWidget(widget)}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeWidget(widget.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}