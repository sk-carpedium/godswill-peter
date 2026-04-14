import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function SidebarCustomizer({ navigationItems, onOrderChange }) {
    const [items, setItems] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadSavedOrder();
    }, []);

    const loadSavedOrder = async () => {
        try {
            const user = await base44.auth.me();
            const savedOrder = user.sidebar_order;
            
            if (savedOrder && Array.isArray(savedOrder)) {
                // Reorder items based on saved order
                const orderedItems = savedOrder
                    .map(name => navigationItems.find(item => item.name === name))
                    .filter(Boolean);
                
                // Add any new items that weren't in the saved order
                const newItems = navigationItems.filter(
                    item => !savedOrder.includes(item.name)
                );
                
                setItems([...orderedItems, ...newItems]);
            } else {
                setItems(navigationItems);
            }
        } catch (error) {
            console.error('Error loading sidebar order:', error);
            setItems(navigationItems);
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);

        setItems(reorderedItems);
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            const order = items.map(item => item.name);
            await base44.auth.updateMe({ sidebar_order: order });
            
            if (onOrderChange) {
                onOrderChange(order);
            }
            
            setHasChanges(false);
            toast.success('Sidebar order saved successfully');
        } catch (error) {
            console.error('Error saving sidebar order:', error);
            toast.error('Failed to save sidebar order');
        }
    };

    const handleReset = async () => {
        try {
            await base44.auth.updateMe({ sidebar_order: null });
            setItems(navigationItems);
            setHasChanges(false);
            
            if (onOrderChange) {
                onOrderChange(null);
            }
            
            toast.success('Sidebar order reset to default');
        } catch (error) {
            console.error('Error resetting sidebar order:', error);
            toast.error('Failed to reset sidebar order');
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customize Sidebar Menu</CardTitle>
                <CardDescription>
                    Drag and drop to reorder the sidebar navigation items
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sidebar-items">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={cn(
                                    "space-y-2 p-4 rounded-lg border-2 border-dashed transition-colors",
                                    snapshot.isDraggingOver ? "border-[#d4af37] bg-[#d4af37]/5" : "border-slate-200"
                                )}
                            >
                                {items.map((item, index) => (
                                    <Draggable
                                        key={item.name}
                                        draggableId={item.name}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={cn(
                                                    "flex items-center gap-3 p-3 bg-white rounded-lg border transition-all",
                                                    snapshot.isDragging
                                                        ? "border-[#d4af37] shadow-lg"
                                                        : "border-slate-200 hover:border-slate-300"
                                                )}
                                            >
                                                <GripVertical className="w-5 h-5 text-slate-400" />
                                                <item.icon className="w-5 h-5 text-slate-600" />
                                                <span className="font-medium text-slate-900 flex-1">
                                                    {item.name}
                                                </span>
                                                {item.badge && (
                                                    <span className="text-xs px-2 py-1 rounded bg-[#d4af37]/10 text-[#d4af37] font-medium">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <div className="flex gap-2">
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="bg-[#d4af37] hover:bg-[#d4af37]/90 text-slate-950"
                    >
                        Save Order
                    </Button>
                    <Button
                        onClick={handleReset}
                        variant="outline"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset to Default
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}