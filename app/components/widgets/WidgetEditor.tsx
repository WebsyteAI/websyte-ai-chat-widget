import { useState } from 'react';
import { ChatWidget } from '../ChatWidget';
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

  const isEditing = !!(widget || createdWidget);
  const hasWidget = !!createdWidget;

  const handleWidgetSubmit = async (formData: FormData) => {
    setFormLoading(true);
    
    try {
      if (isEditing && createdWidget) {
        // Update existing widget
        const data: any = {};
        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') {
            data[key] = value;
          }
        }
        
        console.log('[WidgetEditor] Updating widget with data:', data);

        const response = await fetch(`/api/widgets/${createdWidget.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          const errorData = await response.json() as { error?: string };
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
          const errorData = await response.json() as { error?: string };
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
      <div className="w-1/2 bg-gray-50 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col">
          {hasWidget ? (
            <div className="h-full overflow-hidden">
              <ChatWidget 
                widgetId={createdWidget.id}
                widgetName={createdWidget.name}
                advertiserName={createdWidget.name}
                advertiserLogo={createdWidget.logoUrl}
                advertiserUrl="https://websyte.ai"
                isFullScreen={true}
                saveChatMessages={false} // Don't save test messages
                hidePoweredBy={false}
                baseUrl=""
                isEmbed={true} // Use embed mode for proper styling
                recommendations={createdWidget.recommendations}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4 p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Chat Preview
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Create a widget to enable chat testing
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}