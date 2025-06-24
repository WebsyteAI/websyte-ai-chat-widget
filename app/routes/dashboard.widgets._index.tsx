import { WidgetList } from '../components/widgets/WidgetList';
import { useWidgetStore } from '../stores';
import { useNavigate } from 'react-router';
import { toast } from '../lib/use-toast';

export default function WidgetsIndex() {
  const { fetchWidgets } = useWidgetStore();
  const navigate = useNavigate();

  const handleCreateWidget = () => {
    navigate('/dashboard/widgets/new');
  };

  const handleEditWidget = (widget: any) => {
    navigate(`/dashboard/widgets/${widget.id}/edit`);
  };

  const handleDeleteWidget = async (widget: any) => {
    try {
      const widgetStore = useWidgetStore.getState();
      await widgetStore.deleteWidget(widget.id);
      toast.success('Widget deleted successfully');
      fetchWidgets(); // Refresh the widget list after deletion
    } catch (error) {
      toast.error('Failed to delete widget');
      console.error('Error deleting widget:', error);
    }
  };

  return (
    <WidgetList
      onCreateWidget={handleCreateWidget}
      onEditWidget={handleEditWidget}
      onDeleteWidget={handleDeleteWidget}
    />
  );
}