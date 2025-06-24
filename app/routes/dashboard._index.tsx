import { WidgetList } from '../components/widgets/WidgetList';
import { WidgetEditor } from '../components/widgets/WidgetEditor';
import { useWidgetStore, useUIStore } from '../stores';

export default function DashboardWidgetsPage() {
  // Zustand stores
  const { fetchWidgets } = useWidgetStore();
  const { 
    showCreateForm, 
    editingWidget, 
    setShowCreateForm, 
    setEditingWidget 
  } = useUIStore();

  const handleCreateWidget = () => {
    setShowCreateForm(true);
  };

  const handleEditWidget = (widget: any) => {
    setEditingWidget(widget);
  };

  const handleBackToList = () => {
    setShowCreateForm(false);
    setEditingWidget(null);
    fetchWidgets(); // Refresh the widget list
  };

  const handleWidgetCreated = () => {
    fetchWidgets(); // Refresh the widget list
  };

  const handleWidgetUpdated = () => {
    fetchWidgets(); // Refresh the widget list
  };

  const handleWidgetDeleted = () => {
    fetchWidgets(); // Refresh the widget list
  };

  // Show create/edit form or widget list
  if (showCreateForm) {
    return (
      <WidgetEditor
        onBack={handleBackToList}
        onWidgetCreated={handleWidgetCreated}
      />
    );
  }
  
  if (editingWidget) {
    return (
      <WidgetEditor
        widget={editingWidget}
        onBack={handleBackToList}
        onWidgetUpdated={handleWidgetUpdated}
        onWidgetDeleted={handleWidgetDeleted}
      />
    );
  }

  return (
    <WidgetList
      onCreateWidget={handleCreateWidget}
      onEditWidget={handleEditWidget}
      onDeleteWidget={() => {}} // Delete is handled in WidgetEditor now
    />
  );
}