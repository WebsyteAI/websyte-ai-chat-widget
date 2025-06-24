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

  useEffect(() => {
    const loadWidget = async () => {
      if (!id) {
        navigate('/dashboard/widgets');
        return;
      }

      // First try to find widget in current store
      const existingWidget = widgets.find(w => String(w.id) === id);
      if (existingWidget) {
        setWidget(existingWidget);
        setLoading(false);
        return;
      }

      // If not found, fetch widgets and try again
      await fetchWidgets();
      const fetchedWidget = widgets.find(w => String(w.id) === id);
      if (fetchedWidget) {
        setWidget(fetchedWidget);
      } else {
        // Widget not found, redirect to widgets list
        navigate('/dashboard/widgets');
      }
      setLoading(false);
    };

    loadWidget();
  }, [id, navigate, widgets, fetchWidgets]);

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

  if (!widget) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Widget not found</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <WidgetEditor
        widget={widget}
        onBack={handleBack}
        onWidgetUpdated={handleWidgetUpdated}
        onWidgetDeleted={handleWidgetDeleted}
      />
    </div>
  );
}