import { useNavigate } from 'react-router';
import { WidgetEditor } from '../components/widgets/WidgetEditor';
import { useWidgetStore } from '../stores';
import type { Widget } from '../stores/types';

export default function WidgetNew() {
  const navigate = useNavigate();
  const { fetchWidgets } = useWidgetStore();

  const handleBack = () => {
    navigate('/dashboard/widgets');
  };

  const handleWidgetCreated = async (widget: Widget) => {
    console.log('[WidgetNew] Widget created:', widget);
    
    // Refresh the widget list
    await fetchWidgets();
    
    // No navigation - let the user stay on the same page
    // The WidgetEditor will update to show the created widget
  };

  return (
    <div className="h-full">
      <WidgetEditor
        onBack={handleBack}
        onWidgetCreated={handleWidgetCreated}
      />
    </div>
  );
}