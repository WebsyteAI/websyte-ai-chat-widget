import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { Widget, ApiError } from './types';

interface WidgetState {
  // State
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchWidgets: () => Promise<void>;
  createWidget: (formData: FormData) => Promise<void>;
  updateWidget: (id: string, data: any) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  clearError: () => void;
  
  // Selectors
  getWidgetById: (id: number) => Widget | undefined;
}

export const useWidgetStore = create<WidgetState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      widgets: [],
      loading: false,
      error: null,

      // Actions
      fetchWidgets: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/widgets', {
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch widgets');
          }

          const data: any = await response.json();
          set({ widgets: data.widgets || [], loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ error: message, loading: false });
        }
      },

      createWidget: async (formData: FormData) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/widgets', {
            method: 'POST',
            credentials: 'include',
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to create widget');
          }

          const data: any = await response.json();
          // Add the new widget to the list
          set(state => ({
            widgets: [...state.widgets, data.widget],
            loading: false
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ error: message, loading: false });
          throw error; // Re-throw for component error handling
        }
      },

      updateWidget: async (id: string, updateData: any) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/widgets/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(updateData)
          });

          if (!response.ok) {
            throw new Error('Failed to update widget');
          }

          const data: any = await response.json();
          // Update the widget in the list
          set(state => ({
            widgets: state.widgets.map(w => w.id === id ? data.widget : w),
            loading: false
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ error: message, loading: false });
          throw error; // Re-throw for component error handling
        }
      },

      deleteWidget: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/widgets/${id}`, {
            method: 'DELETE',
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to delete widget');
          }

          // Remove the widget from the list
          set(state => ({
            widgets: state.widgets.filter(w => w.id !== id),
            loading: false
          }));
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error occurred';
          set({ error: message, loading: false });
          throw error; // Re-throw for component error handling
        }
      },

      clearError: () => set({ error: null }),

      // Selectors
      getWidgetById: (id: number) => {
        return get().widgets.find(w => w.id === id);
      },
    })),
    {
      name: 'widget-store',
    }
  )
);