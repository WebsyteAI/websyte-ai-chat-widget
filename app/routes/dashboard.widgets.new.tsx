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

  const handleWidgetCreated = (widget: Widget) => {
    fetchWidgets(); // Refresh the widget list
    navigate('/dashboard/widgets');
  };

  return (
    <WidgetEditor
      onBack={handleBack}
      onWidgetCreated={handleWidgetCreated}
    />
  );
}