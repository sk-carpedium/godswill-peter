import React, { useState } from 'react';
import { api } from '@/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  LayoutDashboard,
  GripVertical,
  Plus,
  Trash2,
  Settings,
  Eye,
  BarChart3,
  LineChart,
  PieChart,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Target,
  FileText,
  Image as ImageIcon,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const widgetLibrary = [
  { 
    id: 'kpi_card', 
    name: 'KPI Card', 
    icon: Target, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Single metric with target progress',
    configurable: ['metric', 'target', 'color', 'size']
  },
  { 
    id: 'line_chart', 
    name: 'Trend Chart', 
    icon: LineChart, 
    color: 'bg-purple-100 text-purple-700',
    description: 'Line chart for trends over time',
    configurable: ['metrics', 'timeRange', 'chartType']
  },
  { 
    id: 'bar_chart', 
    name: 'Bar Chart', 
    icon: BarChart3, 
    color: 'bg-green-100 text-green-700',
    description: 'Compare metrics across platforms',
    configurable: ['metrics', 'groupBy']
  },
  { 
    id: 'pie_chart', 
    name: 'Distribution Chart', 
    icon: PieChart, 
    color: 'bg-orange-100 text-orange-700',
    description: 'Show metric distribution',
    configurable: ['metric', 'breakdown']
  },
  { 
    id: 'revenue_tracker', 
    name: 'Revenue Tracker', 
    icon: DollarSign, 
    color: 'bg-emerald-100 text-emerald-700',
    description: 'Track revenue and ROI',
    configurable: ['sources', 'timeRange']
  },
  { 
    id: 'engagement_feed', 
    name: 'Engagement Feed', 
    icon: Heart, 
    color: 'bg-pink-100 text-pink-700',
    description: 'Recent engagement activity',
    configurable: ['limit', 'platforms']
  },
  { 
    id: 'post_performance', 
    name: 'Top Posts', 
    icon: TrendingUp, 
    color: 'bg-indigo-100 text-indigo-700',
    description: 'Best performing posts',
    configurable: ['limit', 'sortBy']
  },
  { 
    id: 'calendar_preview', 
    name: 'Content Calendar', 
    icon: Calendar, 
    color: 'bg-violet-100 text-violet-700',
    description: 'Upcoming scheduled posts',
    configurable: ['days', 'platforms']
  },
  { 
    id: 'custom_text', 
    name: 'Text Block', 
    icon: FileText, 
    color: 'bg-slate-100 text-slate-700',
    description: 'Custom text or message',
    configurable: ['content', 'styling']
  },
  { 
    id: 'image_banner', 
    name: 'Image Banner', 
    icon: ImageIcon, 
    color: 'bg-cyan-100 text-cyan-700',
    description: 'Custom image or brand asset',
    configurable: ['url', 'height']
  }
];

export default function BespokeDashboardEditor({ clientWorkspaceId, initialLayout = [] }) {
  const [layout, setLayout] = useState(initialLayout);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

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
    toast.success(`${widgetType.name} added`);
  };

  const removeWidget = (id) => {
    setLayout(layout.filter(w => w.id !== id));
  };

  const updateWidgetConfig = (id, config) => {
    setLayout(layout.map(w => w.id === id ? { ...w, config: { ...w.config, ...config } } : w));
  };

  const saveDashboard = async () => {
    try {
      await api.entities.Workspace.update(clientWorkspaceId, {
        settings: {
          custom_dashboard_layout: layout
        }
      });
      toast.success('Dashboard layout saved');
    } catch (error) {
      toast.error('Failed to save dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-[#d4af37]" />
                Bespoke Dashboard Editor
              </CardTitle>
              <CardDescription>
                Create a fully customized dashboard for this client
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              <Button onClick={saveDashboard} className="bg-[#d4af37] hover:bg-[#c9a961] text-slate-950">
                Save Dashboard
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Widget Library */}
          {showWidgetLibrary && (
            <div className="p-4 border-2 border-dashed border-[#d4af37] rounded-lg">
              <h4 className="font-semibold mb-4">Widget Library</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {widgetLibrary.map((widget) => (
                  <button
                    key={widget.id}
                    onClick={() => addWidget(widget)}
                    className="p-4 rounded-lg border-2 border-slate-200 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all text-center"
                  >
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2", widget.color)}>
                      <widget.icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">{widget.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{widget.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dashboard Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Dashboard Layout ({layout.length} widgets)</h4>
              <Badge variant="secondary">{layout.filter(w => w.visible).length} visible</Badge>
            </div>

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
                                "p-4 rounded-lg border-2 border-slate-200 bg-white transition-all",
                                snapshot.isDragging && "shadow-lg border-[#d4af37]"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-5 h-5 text-slate-400" />
                                </div>
                                
                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", widgetType.color)}>
                                  <widgetType.icon className="w-5 h-5" />
                                </div>

                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900">{widget.name}</h4>
                                  <p className="text-xs text-slate-500">{widgetType.description}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Select
                                    value={widget.size}
                                    onValueChange={(value) => updateWidgetConfig(widget.id, { size: value })}
                                  >
                                    <SelectTrigger className="w-24 h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="small">Small</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="large">Large</SelectItem>
                                      <SelectItem value="full">Full Width</SelectItem>
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setSelectedWidget(widget)}
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

            {layout.length === 0 && (
              <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-lg">
                <LayoutDashboard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No widgets added yet. Click "Add Widget" to start building.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}