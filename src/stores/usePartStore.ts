import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Part } from '../types';
import { db } from '../lib/database';

interface PartStore {
  parts: Part[];
  filteredParts: Part[];
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  loading: boolean;
  error: string | null;
  
  // Actions
  loadParts: () => Promise<void>;
  searchParts: (query: string) => void;
  filterByCategory: (category: string) => void;
  filterByTags: (tags: string[]) => void;
  addPart: (part: Omit<Part, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePart: (id: string, updates: Partial<Part>) => Promise<void>;
  deletePart: (id: string) => Promise<void>;
  clearFilters: () => void;
}

export const usePartStore = create<PartStore>()(
  immer((set, get) => ({
    parts: [],
    filteredParts: [],
    searchQuery: '',
    selectedCategory: '',
    selectedTags: [],
    loading: false,
    error: null,

    loadParts: async () => {
      set(state => {
        state.loading = true;
        state.error = null;
      });

      try {
        const parts = await db.parts.toArray();
        set(state => {
          state.parts = parts;
          state.filteredParts = parts;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to load parts';
          state.loading = false;
        });
      }
    },

    searchParts: (query: string) => {
      set(state => {
        state.searchQuery = query;
        state.filteredParts = state.parts.filter(part =>
          part.name.toLowerCase().includes(query.toLowerCase()) ||
          part.category.toLowerCase().includes(query.toLowerCase()) ||
          part.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      });
    },

    filterByCategory: (category: string) => {
      set(state => {
        state.selectedCategory = category;
        const { parts, searchQuery, selectedTags } = get();
        
        let filtered = parts;
        
        if (category) {
          filtered = filtered.filter(part => part.category === category);
        }
        
        if (searchQuery) {
          filtered = filtered.filter(part =>
            part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            part.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        if (selectedTags.length > 0) {
          filtered = filtered.filter(part =>
            selectedTags.every(tag => part.tags.includes(tag))
          );
        }
        
        state.filteredParts = filtered;
      });
    },

    filterByTags: (tags: string[]) => {
      set(state => {
        state.selectedTags = tags;
        const { parts, searchQuery, selectedCategory } = get();
        
        let filtered = parts;
        
        if (selectedCategory) {
          filtered = filtered.filter(part => part.category === selectedCategory);
        }
        
        if (searchQuery) {
          filtered = filtered.filter(part =>
            part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            part.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        
        if (tags.length > 0) {
          filtered = filtered.filter(part =>
            tags.every(tag => part.tags.includes(tag))
          );
        }
        
        state.filteredParts = filtered;
      });
    },

    addPart: async (partData) => {
      try {
        const now = new Date();
        const newPart = {
          ...partData,
          createdAt: now,
          updatedAt: now
        };
        
        await db.parts.add(newPart);
        await get().loadParts();
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to add part';
        });
      }
    },

    updatePart: async (id: string, updates) => {
      try {
        await db.parts.update(id, { ...updates, updatedAt: new Date() });
        await get().loadParts();
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to update part';
        });
      }
    },

    deletePart: async (id: string) => {
      try {
        await db.parts.delete(id);
        await get().loadParts();
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to delete part';
        });
      }
    },

    clearFilters: () => {
      set(state => {
        state.searchQuery = '';
        state.selectedCategory = '';
        state.selectedTags = [];
        state.filteredParts = state.parts;
      });
    }
  }))
);