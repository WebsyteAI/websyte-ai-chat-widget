import { useState } from 'react';
import { ChatPanel } from '../chat';
import { WidgetForm } from './WidgetForm';
import { toast } from '../../lib/use-toast';
import type { Widget } from '../../stores/types';

interface WidgetEditorProps {
  widget?: Widget;
  onBack: () => void;
  onWidgetCreated?: (widget: Widget) => void;
  onWidgetUpdated?: (widget: Widget) => void;
  onWidgetDeleted?: (widget: Widget) => void;
}

export function WidgetEditor({ 
  widget, 
  onBack, 
  onWidgetCreated, 
  onWidgetUpdated,
  onWidgetDeleted 
}: WidgetEditorProps) {
  const [createdWidget, setCreatedWidget] = useState<Widget | null>(widget || null);
  const [formLoading, setFormLoading] = useState(false);

  const isEditing = !!widget;
  const hasWidget = !!createdWidget;

  const handleWidgetSubmit = async (formData: FormData) => {
    setFormLoading(true);
    
    try {
      if (isEditing && widget) {
        // Update existing widget
        const data: any = {};
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') {
            data[key] = value;
          }
        }
        
        console.log('[WidgetEditor] Updating widget with data:', data);

        const response = await fetch(`/api/widgets/${widget.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update widget');
        }

        const result: any = await response.json();
        const updatedWidget = result.widget;
        
        console.log('[WidgetEditor] Updated widget response:', updatedWidget);
        
        setCreatedWidget(updatedWidget);
        onWidgetUpdated?.(updatedWidget);
        toast.success('Widget updated successfully');
      } else {
        // Create new widget
        const response = await fetch('/api/widgets', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create widget');
        }

        const result: any = await response.json();
        const newWidget = result.widget;
        
        console.log('[WidgetEditor] Widget created successfully:', newWidget);
        setCreatedWidget(newWidget);
        
        // Only call the callback, don't navigate here
        if (onWidgetCreated) {
          console.log('[WidgetEditor] Calling onWidgetCreated callback');
          onWidgetCreated(newWidget);
        }
        
        toast.success('Widget created successfully');
      }
    } catch (error) {
      console.error('Error submitting widget:', error);
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} widget`;
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWidget = async () => {
    if (!createdWidget) return;
    
    if (!confirm(`Are you sure you want to delete "${createdWidget.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/widgets/${createdWidget.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete widget');
      }

      toast.success('Widget deleted successfully');
      onWidgetDeleted?.(createdWidget);
      onBack();
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error('Failed to delete widget. Please try again.');
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Panel - Widget Form */}
      <div className="w-1/2 overflow-y-auto bg-white">
        <div className="p-6 [&_[data-slot='card']]:border-0 [&_[data-slot='card']]:shadow-none [&_.max-w-4xl]:max-w-none [&_.mx-auto]:mx-0">
          <WidgetForm
            widget={createdWidget || undefined}
            onSubmit={handleWidgetSubmit}
            onCancel={onBack}
            onDelete={isEditing && createdWidget ? handleDeleteWidget : undefined}
            onWidgetUpdated={(updatedWidget) => {
              setCreatedWidget(updatedWidget);
              onWidgetUpdated?.(updatedWidget);
            }}
            loading={formLoading}
          />
        </div>
      </div>

      {/* Right Panel - Chat Testing */}
      <div className="w-1/2 bg-gray-50 flex flex-col [&_[data-slot='card']]:border-0 [&_[data-slot='card']]:shadow-none">
        <ChatPanel
          config={{
            widgetId: createdWidget?.id || undefined,
            enabled: hasWidget,
            baseUrl: '',
            enableSources: true,
            enableDebug: false,
            mode: hasWidget ? 'rag' : 'standard',
          }}
          layout="panel"
          title={hasWidget ? 'Test Your Widget' : 'Chat Preview'}
          showHeader={true}
          showDebugToggle={false}
          className="h-full"
        />
      </div>
    </div>
  );
}