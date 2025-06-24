import { useState } from 'react';
import { ChatPanel } from '../chat';
import { WidgetForm } from './WidgetForm';
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

        const response = await fetch(`/api/widgets/${widget.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Failed to update widget');
        }

        const result: any = await response.json();
        const updatedWidget = result.widget;
        
        setCreatedWidget(updatedWidget);
        onWidgetUpdated?.(updatedWidget);
      } else {
        // Create new widget
        const response = await fetch('/api/widgets', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to create widget');
        }

        const result: any = await response.json();
        const newWidget = result.widget;
        
        setCreatedWidget(newWidget);
        onWidgetCreated?.(newWidget);
      }
    } catch (error) {
      console.error('Error submitting widget:', error);
      alert(`Failed to ${isEditing ? 'update' : 'create'} widget. Please try again.`);
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

      onWidgetDeleted?.(createdWidget);
      onBack();
    } catch (error) {
      console.error('Error deleting widget:', error);
      alert('Failed to delete widget. Please try again.');
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
            loading={formLoading}
          />
        </div>
      </div>

      {/* Right Panel - Chat Testing */}
      <div className="w-1/2 bg-gray-50 flex flex-col [&_[data-slot='card']]:border-0 [&_[data-slot='card']]:shadow-none">
        <ChatPanel
          config={{
            widgetId: createdWidget?.id ? String(createdWidget.id) : undefined,
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