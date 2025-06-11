import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SalvagePart, SearchFilters, ImportResult } from '../types/salvagePart';
import { salvageDb } from '../lib/salvageDatabase';

interface SalvagePartStore {
  parts: SalvagePart[];
  filteredParts: SalvagePart[];
  selectedPart: SalvagePart | null;
  searchFilters: SearchFilters;
  loading: boolean;
  error: string | null;
  statistics: any;
  
  // CRUD Operations
  loadParts: () => Promise<void>;
  createPart: (part: Omit<SalvagePart, 'id'>) => Promise<string>;
  updatePart: (id: string, updates: Partial<SalvagePart>) => Promise<void>;
  deletePart: (id: string) => Promise<void>;
  duplicatePart: (id: string) => Promise<string>;
  
  // Search and Filter
  searchParts: (filters: SearchFilters) => Promise<void>;
  clearFilters: () => void;
  setSelectedPart: (part: SalvagePart | null) => void;
  
  // Import/Export
  importParts: (data: any[], format: 'json' | 'csv') => Promise<ImportResult>;
  exportParts: (format: 'json' | 'csv' | 'xlsx') => Promise<Blob>;
  
  // Statistics
  loadStatistics: () => Promise<void>;
  
  // Bulk Operations
  bulkUpdate: (ids: string[], updates: Partial<SalvagePart>) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}

export const useSalvagePartStore = create<SalvagePartStore>()(
  immer((set, get) => ({
    parts: [],
    filteredParts: [],
    selectedPart: null,
    searchFilters: {},
    loading: false,
    error: null,
    statistics: null,

    loadParts: async () => {
      set(state => {
        state.loading = true;
        state.error = null;
      });

      try {
        const parts = await salvageDb.parts.toArray();
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

    createPart: async (partData) => {
      const id = crypto.randomUUID();
      const now = new Date();
      
      const newPart: SalvagePart = {
        ...partData,
        id,
        metadata: {
          ...partData.metadata,
          dateAdded: now,
          lastModified: now
        }
      };

      try {
        await salvageDb.parts.add(newPart);
        set(state => {
          state.parts.push(newPart);
          state.filteredParts.push(newPart);
        });
        return id;
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to create part';
        });
        throw error;
      }
    },

    updatePart: async (id, updates) => {
      try {
        const updatedData = {
          ...updates,
          metadata: {
            ...updates.metadata,
            lastModified: new Date()
          }
        };

        await salvageDb.parts.update(id, updatedData);
        
        set(state => {
          const index = state.parts.findIndex(p => p.id === id);
          if (index >= 0) {
            state.parts[index] = { ...state.parts[index], ...updatedData };
          }
          
          const filteredIndex = state.filteredParts.findIndex(p => p.id === id);
          if (filteredIndex >= 0) {
            state.filteredParts[filteredIndex] = { ...state.filteredParts[filteredIndex], ...updatedData };
          }
          
          if (state.selectedPart?.id === id) {
            state.selectedPart = { ...state.selectedPart, ...updatedData };
          }
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to update part';
        });
        throw error;
      }
    },

    deletePart: async (id) => {
      try {
        await salvageDb.parts.delete(id);
        set(state => {
          state.parts = state.parts.filter(p => p.id !== id);
          state.filteredParts = state.filteredParts.filter(p => p.id !== id);
          if (state.selectedPart?.id === id) {
            state.selectedPart = null;
          }
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to delete part';
        });
        throw error;
      }
    },

    duplicatePart: async (id) => {
      const originalPart = get().parts.find(p => p.id === id);
      if (!originalPart) throw new Error('Part not found');

      const duplicatedPart = {
        ...originalPart,
        metadata: {
          ...originalPart.metadata,
          name: `${originalPart.metadata.name} (Copy)`,
          partNumbers: originalPart.metadata.partNumbers.map(pn => `${pn}-COPY`)
        }
      };

      delete (duplicatedPart as any).id;
      return await get().createPart(duplicatedPart);
    },

    searchParts: async (filters) => {
      set(state => {
        state.loading = true;
        state.searchFilters = filters;
      });

      try {
        const results = await salvageDb.searchParts(filters);
        set(state => {
          state.filteredParts = results;
          state.loading = false;
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Search failed';
          state.loading = false;
        });
      }
    },

    clearFilters: () => {
      set(state => {
        state.searchFilters = {};
        state.filteredParts = state.parts;
      });
    },

    setSelectedPart: (part) => {
      set(state => {
        state.selectedPart = part;
      });
    },

    importParts: async (data, format) => {
      const result: ImportResult = {
        success: false,
        imported: 0,
        failed: 0,
        errors: [],
        parts: []
      };

      try {
        for (const item of data) {
          try {
            const partData = format === 'csv' ? 
              get().convertCsvRowToPart(item) : 
              item as Omit<SalvagePart, 'id'>;
            
            const id = await get().createPart(partData);
            const newPart = get().parts.find(p => p.id === id);
            if (newPart) {
              result.parts.push(newPart);
              result.imported++;
            }
          } catch (error) {
            result.failed++;
            result.errors.push(error instanceof Error ? error.message : 'Unknown error');
          }
        }

        result.success = result.imported > 0;
        return result;
      } catch (error) {
        result.errors.push(error instanceof Error ? error.message : 'Import failed');
        return result;
      }
    },

    exportParts: async (format) => {
      const parts = get().filteredParts;
      
      switch (format) {
        case 'json':
          return new Blob([JSON.stringify(parts, null, 2)], { type: 'application/json' });
        
        case 'csv':
          const csvContent = get().convertPartsToCsv(parts);
          return new Blob([csvContent], { type: 'text/csv' });
        
        case 'xlsx':
          // Would require a library like xlsx for full Excel support
          const csvForExcel = get().convertPartsToCsv(parts);
          return new Blob([csvForExcel], { type: 'application/vnd.ms-excel' });
        
        default:
          throw new Error('Unsupported export format');
      }
    },

    loadStatistics: async () => {
      try {
        const stats = await salvageDb.getPartStatistics();
        set(state => {
          state.statistics = stats;
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Failed to load statistics';
        });
      }
    },

    bulkUpdate: async (ids, updates) => {
      try {
        await salvageDb.transaction('rw', salvageDb.parts, async () => {
          for (const id of ids) {
            await salvageDb.parts.update(id, {
              ...updates,
              metadata: {
                ...updates.metadata,
                lastModified: new Date()
              }
            });
          }
        });

        await get().loadParts();
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Bulk update failed';
        });
        throw error;
      }
    },

    bulkDelete: async (ids) => {
      try {
        await salvageDb.transaction('rw', salvageDb.parts, async () => {
          await salvageDb.parts.bulkDelete(ids);
        });

        set(state => {
          state.parts = state.parts.filter(p => !ids.includes(p.id));
          state.filteredParts = state.filteredParts.filter(p => !ids.includes(p.id));
          if (state.selectedPart && ids.includes(state.selectedPart.id)) {
            state.selectedPart = null;
          }
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Bulk delete failed';
        });
        throw error;
      }
    },

    // Helper methods
    convertCsvRowToPart: (row: any): Omit<SalvagePart, 'id'> => {
      return {
        metadata: {
          name: row.name || '',
          manufacturer: row.manufacturer || '',
          model: row.model || '',
          partNumbers: row.partNumbers ? row.partNumbers.split(',') : [],
          categories: row.categories ? row.categories.split(',') : [],
          tags: row.tags ? row.tags.split(',') : [],
          dateAdded: new Date(),
          lastModified: new Date(),
          notes: row.notes || '',
          condition: row.condition || 'used',
          quantity: parseInt(row.quantity) || 1,
          location: row.location || '',
          value: parseFloat(row.value) || 0,
          source: row.source || ''
        },
        specifications: {
          custom: {}
        },
        models: {
          primary: { id: '', url: '', format: 'gltf', size: 0, checksum: '', metadata: { vertices: 0, faces: 0, materials: [], animations: [] } },
          lods: [],
          collision: { id: '', url: '', format: 'gltf', size: 0, checksum: '', metadata: { vertices: 0, faces: 0, materials: [], animations: [] } }
        },
        components: [],
        documentation: {
          datasheets: [],
          manuals: [],
          schematics: [],
          images: [],
          videos: []
        },
        simulation: {
          physics: { mass: 1, density: 1, friction: 0.5, restitution: 0.3, collisionShape: 'box' },
          electrical: { conductivity: 0, resistivity: 0, dielectric: 1, breakdown: 0 },
          thermal: { conductivity: 0, capacity: 0, expansion: 0, emissivity: 0 }
        }
      };
    },

    convertPartsToCsv: (parts: SalvagePart[]): string => {
      const headers = [
        'id', 'name', 'manufacturer', 'model', 'partNumbers', 'categories', 
        'tags', 'condition', 'quantity', 'location', 'value', 'source', 'notes'
      ];

      const rows = parts.map(part => [
        part.id,
        part.metadata.name,
        part.metadata.manufacturer,
        part.metadata.model,
        part.metadata.partNumbers.join(','),
        part.metadata.categories.join(','),
        part.metadata.tags.join(','),
        part.metadata.condition,
        part.metadata.quantity,
        part.metadata.location,
        part.metadata.value,
        part.metadata.source,
        part.metadata.notes
      ]);

      return [headers, ...rows].map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
    }
  }))
);