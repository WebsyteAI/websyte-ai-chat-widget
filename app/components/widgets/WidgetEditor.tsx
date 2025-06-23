import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Widgets
          </Button>
          
          {isEditing && createdWidget && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteWidget}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete Widget
            </Button>
          )}
        </div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? `Edit ${createdWidget?.name || 'Widget'}` : 'Create New Widget'}
          </h1>
          <p className="text-gray-600">
            {isEditing 
              ? 'Update your widget settings and test the chat functionality'
              : 'Create a custom AI widget with your content and files, then test it immediately'
            }
          </p>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[800px]">
        {/* Left Panel - Widget Form */}
        <div className="lg:col-span-3">
          <WidgetForm
            widget={createdWidget || undefined}
            onSubmit={handleWidgetSubmit}
            onCancel={onBack}
            loading={formLoading}
          />
        </div>

        {/* Right Panel - Chat Testing */}
        <div className="lg:col-span-2">
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
            title={hasWidget ? 'Test Your Widget' : 'Chat Testing'}
            showHeader={true}
            showDebugToggle={false}
            className="h-full"
          />
        </div>
      </div>

      {/* Mobile Layout Helper */}
      <div className="lg:hidden mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mobile View</CardTitle>
            <CardDescription>
              For the best widget editing experience, please use a desktop or tablet device.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              The two-panel layout with form and chat testing works best on larger screens. 
              You can still create and edit widgets on mobile, but the chat testing feature 
              is optimized for wider displays.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}