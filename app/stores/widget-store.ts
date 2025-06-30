import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { Widget, ApiError } from './types';

interface WidgetState {
  // State
  widgets: Widget[];
  loading: boolean;
  error: string | null;
  totalWidgets: number;
  currentPage: number;
  pageSize: number;
  
  // Actions
  fetchWidgets: (page?: number, pageSize?: number) => Promise<void>;
  createWidget: (formData: FormData) => Promise<void>;
  updateWidget: (id: string, data: any) => Promise<void>;
  deleteWidget: (id: string) => Promise<void>;
  clearError: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  
  // Selectors
  getWidgetById: (id: string) => Widget | undefined;
  getTotalPages: () => number;
}

export const useWidgetStore = create<WidgetState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      widgets: [],
      loading: false,
      error: null,
      totalWidgets: 0,
      currentPage: 1,
      pageSize: 9, // 3x3 grid

      // Actions
      fetchWidgets: async (page?: number, pageSize?: number) => {
        const state = get();
        const currentPage = page || state.currentPage;
        const currentPageSize = pageSize || state.pageSize;
        const offset = (currentPage - 1) * currentPageSize;
        
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/widgets?limit=${currentPageSize}&offset=${offset}`, {
            credentials: 'include'
          });

          if (!response.ok) {
            throw new Error('Failed to fetch widgets');
          }

          const data: any = await response.json();
          set({ 
            widgets: data.widgets || [], 
            totalWidgets: data.total || 0,
            currentPage,
            pageSize: currentPageSize,
            loading: false 
          });
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
      getWidgetById: (id: string) => {
        return get().widgets.find(w => w.id === id);
      },
      
      getTotalPages: () => {
        const state = get();
        return Math.ceil(state.totalWidgets / state.pageSize);
      },
      
      setPage: (page: number) => {
        set({ currentPage: page });
      },
      
      setPageSize: (pageSize: number) => {
        set({ pageSize, currentPage: 1 }); // Reset to first page when changing page size
      },
    })),
    {
      name: 'widget-store',
    }
  )
);