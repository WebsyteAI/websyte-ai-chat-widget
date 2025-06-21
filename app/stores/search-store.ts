import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { SearchResult } from './types';

interface SearchState {
  // State
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  searchWidget: (widgetId: string, query: string, limit?: number) => Promise<void>;
  searchAllWidgets: (query: string, limit?: number) => Promise<void>;
  clearSearch: () => void;
  clearError: () => void;
}

export const useSearchStore = create<SearchState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      query: '',
      results: [],
      loading: false,
      error: null,
      hasSearched: false,

      // Actions
      setQuery: (query: string) => set({ query }),

      searchWidget: async (widgetId: string, query: string, limit = 10) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`/api/widgets/${widgetId}/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: query.trim(),
              limit
            })
          });

          if (!response.ok) {
            throw new Error('Search failed');
          }

          const data: any = await response.json();
          set({ 
            results: data.results || [], 
            loading: false, 
            hasSearched: true,
            query: query.trim() 
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Search failed';
          set({ 
            error: message, 
            loading: false, 
            results: [], 
            hasSearched: true 
          });
        }
      },

      searchAllWidgets: async (query: string, limit = 10) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch('/api/widgets/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              query: query.trim(),
              limit
            })
          });

          if (!response.ok) {
            throw new Error('Search failed');
          }

          const data: any = await response.json();
          set({ 
            results: data.results || [], 
            loading: false, 
            hasSearched: true,
            query: query.trim() 
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Search failed';
          set({ 
            error: message, 
            loading: false, 
            results: [], 
            hasSearched: true 
          });
        }
      },

      clearSearch: () => set({ 
        query: '', 
        results: [], 
        hasSearched: false, 
        error: null 
      }),

      clearError: () => set({ error: null }),
    })),
    {
      name: 'search-store',
    }
  )
);