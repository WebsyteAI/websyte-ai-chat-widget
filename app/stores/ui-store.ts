import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { Widget } from './types';

interface UIState {
  // Form states
  showCreateForm: boolean;
  editingWidget: Widget | null;
  formLoading: boolean;
  
  // Widget form specific state
  widgetFormData: {
    name: string;
    description: string;
    url: string;
    logoUrl: string;
    content: string;
    files: File[];
    dragActive: boolean;
  };
  
  // Actions
  setShowCreateForm: (show: boolean) => void;
  setEditingWidget: (widget: Widget | null) => void;
  setFormLoading: (loading: boolean) => void;
  
  // Widget form actions
  updateWidgetFormField: (field: keyof UIState['widgetFormData'], value: any) => void;
  resetWidgetForm: () => void;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  setDragActive: (active: boolean) => void;
}

const initialWidgetFormData = {
  name: '',
  description: '',
  url: '',
  logoUrl: '',
  content: '',
  files: [],
  dragActive: false,
};

export const useUIStore = create<UIState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      showCreateForm: false,
      editingWidget: null,
      formLoading: false,
      widgetFormData: initialWidgetFormData,

      // Actions
      setShowCreateForm: (show: boolean) => set({ showCreateForm: show }),
      
      setEditingWidget: (widget: Widget | null) => {
        set({ editingWidget: widget });
        if (widget) {
          // Populate form with widget data
          set({
            widgetFormData: {
              ...initialWidgetFormData,
              name: widget.name || '',
              description: widget.description || '',
              url: widget.url || '',
              logoUrl: widget.logoUrl || '',
            }
          });
        } else {
          // Reset form when closing edit
          set({ widgetFormData: initialWidgetFormData });
        }
      },
      
      setFormLoading: (loading: boolean) => set({ formLoading: loading }),

      // Widget form actions
      updateWidgetFormField: (field, value) => 
        set(state => ({
          widgetFormData: {
            ...state.widgetFormData,
            [field]: value
          }
        })),

      resetWidgetForm: () => set({ widgetFormData: initialWidgetFormData }),

      addFiles: (newFiles: File[]) => {
        // Filter for supported file types
        const supportedFiles = newFiles.filter(file => {
          const type = file.type.toLowerCase();
          return type.includes('text') || 
                 type.includes('pdf') || 
                 type.includes('word') ||
                 type.includes('document') ||
                 file.name.toLowerCase().endsWith('.txt') ||
                 file.name.toLowerCase().endsWith('.md');
        });

        set(state => ({
          widgetFormData: {
            ...state.widgetFormData,
            files: [...state.widgetFormData.files, ...supportedFiles]
          }
        }));
      },

      removeFile: (index: number) => 
        set(state => ({
          widgetFormData: {
            ...state.widgetFormData,
            files: state.widgetFormData.files.filter((_, i) => i !== index)
          }
        })),

      setDragActive: (active: boolean) => 
        set(state => ({
          widgetFormData: {
            ...state.widgetFormData,
            dragActive: active
          }
        })),
    })),
    {
      name: 'ui-store',
    }
  )
);