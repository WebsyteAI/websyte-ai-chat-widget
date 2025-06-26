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
    
    // Refresh the widget list first
    await fetchWidgets();
    
    // Small delay to ensure state is settled and avoid navigation conflicts
    setTimeout(() => {
      console.log('[WidgetNew] Navigating to edit page for widget:', widget.id);
      navigate(`/dashboard/widgets/${widget.id}/edit`);
    }, 100);
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