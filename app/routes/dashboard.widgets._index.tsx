import { WidgetList } from '../components/widgets/WidgetList';
import { useWidgetStore } from '../stores';
import { useNavigate } from 'react-router';

export default function WidgetsIndex() {
  const { fetchWidgets } = useWidgetStore();
  const navigate = useNavigate();

  const handleCreateWidget = () => {
    navigate('/dashboard/widgets/new');
  };

  const handleEditWidget = (widget: any) => {
    navigate(`/dashboard/widgets/${widget.id}/edit`);
  };

  const handleDeleteWidget = () => {
    fetchWidgets(); // Refresh the widget list after deletion
  };

  return (
    <WidgetList
      onCreateWidget={handleCreateWidget}
      onEditWidget={handleEditWidget}
      onDeleteWidget={handleDeleteWidget}
    />
  );
}