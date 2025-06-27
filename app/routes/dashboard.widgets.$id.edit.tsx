import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { WidgetEditor } from '../components/widgets/WidgetEditor';
import { useWidgetStore } from '../stores';
import type { Widget } from '../stores/types';

export default function WidgetEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { widgets, fetchWidgets } = useWidgetStore();
  const [widget, setWidget] = useState<Widget | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadWidget = async () => {
      if (!id) {
        navigate('/dashboard/widgets');
        return;
      }

      setLoading(true);
      setNotFound(false);

      try {
        // First, try to fetch the specific widget directly
        const response = await fetch(`/api/widgets/${id}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json() as { widget: Widget };
          setWidget(data.widget);
          setLoading(false);
          
          // Also refresh the widgets list in the background
          fetchWidgets().catch(console.error);
          return;
        }

        if (response.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        throw new Error('Failed to fetch widget');
      } catch (error) {
        console.error('Error loading widget:', error);
        
        // Fallback: try to find in existing widgets
        const existingWidget = widgets.find(w => String(w.id) === id);
        if (existingWidget) {
          setWidget(existingWidget);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      }
    };

    loadWidget();
  }, [id]);

  const handleBack = () => {
    navigate('/dashboard/widgets');
  };

  const handleWidgetUpdated = (updatedWidget: Widget) => {
    setWidget(updatedWidget);
    fetchWidgets(); // Refresh the widget list
  };

  const handleWidgetDeleted = () => {
    navigate('/dashboard/widgets');
    fetchWidgets(); // Refresh the widget list
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading widget...</p>
        </div>
      </div>
    );
  }

  if (!widget && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{notFound ? 'Widget not found' : 'Error loading widget'}</p>
        <button
          onClick={() => navigate('/dashboard/widgets')}
          className="mt-4 text-blue-600 hover:text-blue-700 underline"
        >
          Back to widgets
        </button>
      </div>
    );
  }

  return (
    <div className="h-full">
      <WidgetEditor
        widget={widget || undefined}
        onBack={handleBack}
        onWidgetUpdated={handleWidgetUpdated}
        onWidgetDeleted={handleWidgetDeleted}
      />
    </div>
  );
}