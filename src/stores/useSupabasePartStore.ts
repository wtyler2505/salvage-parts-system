import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { supabase, partsApi, SupabasePart } from '../lib/supabaseClient'

interface SupabasePartStore {
  parts: SupabasePart[]
  loading: boolean
  error: string | null
  
  // Actions
  loadParts: () => Promise<void>
  createPart: (part: Omit<SupabasePart, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updatePart: (id: string, updates: Partial<SupabasePart>) => Promise<void>
  deletePart: (id: string) => Promise<void>
  searchParts: (query: string) => Promise<void>
}

export const useSupabasePartStore = create<SupabasePartStore>()(
  immer((set, get) => ({
    parts: [],
    loading: false,
    error: null,

    loadParts: async () => {
      set(state => {
        state.loading = true
        state.error = null
      })

      try {
        const parts = await partsApi.getAll()
        set(state => {
          state.parts = parts
          state.loading = false
        })
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to load parts'
          state.loading = false
        })
      }
    },

    createPart: async (partData) => {
      try {
        const newPart = await partsApi.create(partData)
        set(state => {
          state.parts.unshift(newPart)
        })
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to create part'
        })
        throw error
      }
    },

    updatePart: async (id, updates) => {
      try {
        const updatedPart = await partsApi.update(id, updates)
        set(state => {
          const index = state.parts.findIndex(p => p.id === id)
          if (index >= 0) {
            state.parts[index] = updatedPart
          }
        })
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to update part'
        })
        throw error
      }
    },

    deletePart: async (id) => {
      try {
        await partsApi.delete(id)
        set(state => {
          state.parts = state.parts.filter(p => p.id !== id)
        })
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to delete part'
        })
        throw error
      }
    },

    searchParts: async (query) => {
      set(state => {
        state.loading = true
        state.error = null
      })

      try {
        const parts = await partsApi.search(query)
        set(state => {
          state.parts = parts
          state.loading = false
        })
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Search failed'
          state.loading = false
        })
      }
    }
  }))
)