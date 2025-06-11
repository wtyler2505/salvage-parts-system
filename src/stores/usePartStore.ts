import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Part, SearchFilters, ImportResult } from '../types';
import { db } from '../lib/database';

interface PartStore {
  parts: Part[];
  filteredParts: Part[];
  selectedPart: Part | null;
  favorites: Set<string>;
  recentPartIds: string[];
  searchFilters: SearchFilters;
  searchQuery: string;
  selectedCategory: string;
  selectedTags: string[];
  loading: boolean;
  error: string | null;
  statistics: any;
  
  // CRUD Operations
  loadParts: () => Promise<void>;
  createPart: (part: Omit<Part, 'id'>) => Promise<string>;
  updatePart: (id: string, updates: Partial<Part>) => Promise<void>;
  deletePart: (id: string) => Promise<void>;
  duplicatePart: (id: string) => Promise<string>;
  
  // Search and Filter
  searchParts: (filters: SearchFilters | string) => Promise<void>;
  filterByCategory: (category: string) => void;
  filterByTags: (tags: string[]) => void;
  filterBySpecialCategory: (category: 'favorites' | 'recent' | null) => void;
  toggleFavorite: (partId: string) => void;
  addRecentPart: (partId: string) => void;
  clearFilters: () => void;
  setSelectedPart: (part: Part | null) => void;
  
  // Import/Export
  importParts: (data: any[], format: 'json' | 'csv') => Promise<ImportResult>;
  exportParts: (format: 'json' | 'csv' | 'xlsx') => Promise<Blob>;
  
  // Statistics
  loadStatistics: () => Promise<void>;
  
  // Bulk Operations
  bulkUpdate: (ids: string[], updates: Partial<Part>) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}

export const usePartStore = create<PartStore>()(
  immer((set, get) => ({
    parts: [],
    filteredParts: [],
    selectedPart: null,
    favorites: new Set(JSON.parse(localStorage.getItem('part-library-favorites') || '[]')),
    recentPartIds: JSON.parse(localStorage.getItem('part-library-recents') || '[]'),
    searchFilters: {},
    searchQuery: '',
    selectedCategory: '',
    selectedTags: [],
    loading: false,
    error: null,
    statistics: null,

    loadParts: async () => {
      set(state => {
        state.loading = true;
        state.error = null;
      });

      try {
        // Load parts from IndexedDB
        const dbParts = await db.parts.toArray();
        
        // Convert to unified Part format
        const parts = dbParts.map(dbPart => {
          // Create a Part object from the database record
          const part: Part = {
            id: dbPart.id!,
            metadata: {
              name: dbPart.name,
              manufacturer: dbPart.manufacturer || '',
              model: dbPart.model || '',
              partNumbers: [],
              categories: [dbPart.category],
              tags: dbPart.tags,
              dateAdded: dbPart.createdAt,
              lastModified: dbPart.updatedAt,
              notes: dbPart.description || '',
              condition: mapCondition(dbPart.condition),
              quantity: 1,
              location: '',
              value: dbPart.price || 0,
              source: ''
            },
            specifications: {
              custom: dbPart.specifications || {}
            },
            models: {
              primary: {
                id: '',
                url: dbPart.modelUrl || '',
                format: 'gltf',
                size: 0,
                checksum: '',
                metadata: { vertices: 0, faces: 0, materials: [], animations: [] }
              },
              lods: [],
              collision: {
                id: '',
                url: '',
                format: 'gltf',
                size: 0,
                checksum: '',
                metadata: { vertices: 0, faces: 0, materials: [], animations: [] }
              }
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
              physics: { 
                mass: 1, 
                density: 1000, 
                friction: 0.5, 
                restitution: 0.2,
                collisionShape: 'box'
              },
              electrical: { 
                conductivity: 0, 
                resistivity: 0, 
                dielectric: 1, 
                breakdown: 0 
              },
              thermal: { 
                conductivity: 0, 
                capacity: 0, 
                expansion: 0, 
                emissivity: 0 
              }
            }
          };
          
          // Add electrical properties if available
          if (dbPart.electricalProperties) {
            part.specifications.electrical = {
              voltage: dbPart.electricalProperties.voltage?.toString() || '',
              current: dbPart.electricalProperties.current?.toString() || '',
              power: dbPart.electricalProperties.power?.toString() || '',
              resistance: dbPart.electricalProperties.resistance || 0,
              capacitance: 0,
              inductance: 0,
              frequency: ''
            };
          }
          
          // Add mechanical properties if available
          if (dbPart.dimensions) {
            part.specifications.mechanical = {
              dimensions: { 
                x: dbPart.dimensions.length, 
                y: dbPart.dimensions.width, 
                z: dbPart.dimensions.height 
              },
              weight: dbPart.dimensions.weight,
              material: dbPart.materials?.join(', ') || '',
              torque: '',
              rpm: 0,
              force: '',
              pressure: ''
            };
          }
          
          // Add thermal properties if available
          if (dbPart.thermalProperties) {
            part.specifications.thermal = {
              operatingTemp: { 
                min: 0, 
                max: dbPart.thermalProperties.maxTemperature || 0 
              },
              thermalResistance: 0,
              heatDissipation: 0
            };
          }
          
          return part;
        });
        
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
      
      const newPart: Part = {
        ...partData,
        id,
        metadata: {
          ...partData.metadata,
          dateAdded: now,
          lastModified: now
        }
      };

      try {
        // Convert to database format and save
        const dbPart = {
          id,
          name: newPart.metadata.name,
          category: newPart.metadata.categories[0] || '',
          subcategory: '',
          specifications: newPart.specifications.custom,
          tags: newPart.metadata.tags,
          price: newPart.metadata.value,
          availability: 'in-stock',
          condition: mapConditionReverse(newPart.metadata.condition),
          dimensions: newPart.specifications.mechanical ? {
            length: newPart.specifications.mechanical.dimensions.x,
            width: newPart.specifications.mechanical.dimensions.y,
            height: newPart.specifications.mechanical.dimensions.z,
            weight: newPart.specifications.mechanical.weight
          } : {
            length: 0,
            width: 0,
            height: 0,
            weight: 0
          },
          materials: [],
          createdAt: now,
          updatedAt: now
        };
        
        await db.parts.add(dbPart);
        
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
        const part = get().parts.find(p => p.id === id);
        if (!part) throw new Error('Part not found');
        
        const updatedPart = { ...part, ...updates };
        
        // Update in database
        await db.parts.update(id, {
          name: updatedPart.metadata.name,
          category: updatedPart.metadata.categories[0] || '',
          subcategory: '',
          specifications: updatedPart.specifications.custom,
          tags: updatedPart.metadata.tags,
          price: updatedPart.metadata.value,
          condition: mapConditionReverse(updatedPart.metadata.condition),
          updatedAt: new Date()
        });
        
        set(state => {
          const index = state.parts.findIndex(p => p.id === id);
          if (index >= 0) {
            state.parts[index] = updatedPart;
          }
          
          const filteredIndex = state.filteredParts.findIndex(p => p.id === id);
          if (filteredIndex >= 0) {
            state.filteredParts[filteredIndex] = updatedPart;
          }
          
          if (state.selectedPart?.id === id) {
            state.selectedPart = updatedPart;
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
        await db.parts.delete(id);
        
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
        if (typeof filters === 'string') {
          state.searchQuery = filters;
          state.searchFilters = { text: filters };
        } else {
          state.searchFilters = filters;
          state.searchQuery = filters.text || '';
        }
      });

      try {
        const { parts } = get();
        let results = [...parts];
        const searchFilters = typeof filters === 'string' ? { text: filters } : filters;
        
        // Text search
        if (searchFilters.text) {
          const searchText = searchFilters.text.toLowerCase();
          results = results.filter(part => 
            part.metadata.name.toLowerCase().includes(searchText) ||
            part.metadata.manufacturer.toLowerCase().includes(searchText) ||
            part.metadata.model.toLowerCase().includes(searchText) ||
            part.metadata.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
            part.metadata.categories.some(cat => cat.toLowerCase().includes(searchText))
          );
        }

        // Category filter
        if (searchFilters.categories?.length) {
          results = results.filter(part => 
            searchFilters.categories!.some(cat => part.metadata.categories.includes(cat))
          );
        }

        // Tags filter
        if (searchFilters.tags?.length) {
          results = results.filter(part => 
            searchFilters.tags!.some(tag => part.metadata.tags.includes(tag))
          );
        }

        // Condition filter
        if (searchFilters.condition?.length) {
          results = results.filter(part => 
            searchFilters.condition!.includes(part.metadata.condition)
          );
        }

        // Manufacturer filter
        if (searchFilters.manufacturer?.length) {
          results = results.filter(part => 
            searchFilters.manufacturer!.includes(part.metadata.manufacturer)
          );
        }

        // Date range filter
        if (searchFilters.dateRange) {
          results = results.filter(part => 
            part.metadata.dateAdded >= searchFilters.dateRange!.start &&
            part.metadata.dateAdded <= searchFilters.dateRange!.end
          );
        }

        // Value range filter
        if (searchFilters.valueRange) {
          results = results.filter(part => 
            part.metadata.value >= searchFilters.valueRange!.min &&
            part.metadata.value <= searchFilters.valueRange!.max
          );
        }

        // Specifications filter
        if (searchFilters.specifications) {
          results = results.filter(part => {
            return Object.entries(searchFilters.specifications!).every(([key, value]) => {
              const partValue = getNestedValue(part.specifications, key);
              if (typeof value === 'object' && value.operator) {
                return compareValues(partValue, value.value, value.operator);
              }
              return partValue === value;
            });
          });
        }

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

    filterByCategory: (category) => {
      set(state => {
        state.selectedCategory = category;
        const { parts, searchQuery, selectedTags } = get();
        
        let filtered = parts;
        
        if (category) {
          filtered = filtered.filter(part => part.metadata.categories.includes(category));
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(part =>
            part.metadata.name.toLowerCase().includes(query) ||
            part.metadata.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        if (selectedTags.length > 0) {
          filtered = filtered.filter(part =>
            selectedTags.every(tag => part.metadata.tags.includes(tag))
          );
        }
        
        state.filteredParts = filtered;
      });
    },

    filterByTags: (tags) => {
      set(state => {
        state.selectedTags = tags;
        const { parts, searchQuery, selectedCategory } = get();
        
        let filtered = parts;
        
        if (selectedCategory) {
          filtered = filtered.filter(part => part.metadata.categories.includes(selectedCategory));
        }
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(part =>
            part.metadata.name.toLowerCase().includes(query) ||
            part.metadata.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        if (tags.length > 0) {
          filtered = filtered.filter(part =>
            tags.every(tag => part.metadata.tags.includes(tag))
          );
        }
        
        state.filteredParts = filtered;
      });
    },

    filterBySpecialCategory: (category) => {
      set(state => {
        const { parts, favorites, recentPartIds } = get();
        
        if (category === 'favorites') {
          state.filteredParts = parts.filter(part => favorites.has(part.id));
        } else if (category === 'recent') {
          state.filteredParts = parts.filter(part => recentPartIds.includes(part.id));
        } else {
          state.filteredParts = parts;
        }
      });
    },

    toggleFavorite: (partId) => {
      set(state => {
        const newFavorites = new Set(state.favorites);
        if (newFavorites.has(partId)) {
          newFavorites.delete(partId);
        } else {
          newFavorites.add(partId);
        }
        state.favorites = newFavorites;
        
        // Save to localStorage
        localStorage.setItem('part-library-favorites', JSON.stringify([...newFavorites]));
      });
    },

    addRecentPart: (partId) => {
      set(state => {
        // Remove the part if it already exists in the recents
        const filteredRecents = state.recentPartIds.filter(id => id !== partId);
        
        // Add the part to the beginning of the array
        const newRecents = [partId, ...filteredRecents].slice(0, 10); // Keep only 10 most recent
        state.recentPartIds = newRecents;
        
        // Save to localStorage
        localStorage.setItem('part-library-recents', JSON.stringify(newRecents));
      });
    },

    clearFilters: () => {
      set(state => {
        state.searchQuery = '';
        state.selectedCategory = '';
        state.selectedTags = [];
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
              convertCsvRowToPart(item) : 
              item as Omit<Part, 'id'>;
            
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
          const csvContent = convertPartsToCsv(parts);
          return new Blob([csvContent], { type: 'text/csv' });
        
        case 'xlsx':
          // Would require a library like xlsx for full Excel support
          const csvForExcel = convertPartsToCsv(parts);
          return new Blob([csvForExcel], { type: 'application/vnd.ms-excel' });
        
        default:
          throw new Error('Unsupported export format');
      }
    },

    loadStatistics: async () => {
      try {
        // Calculate statistics from parts data
        const parts = get().parts;
        
        const totalParts = parts.length;
        
        const partsByCondition = {
          new: parts.filter(p => p.metadata.condition === 'new').length,
          used: parts.filter(p => p.metadata.condition === 'used').length,
          salvaged: parts.filter(p => p.metadata.condition === 'salvaged').length,
          broken: parts.filter(p => p.metadata.condition === 'broken').length
        };
        
        const partsByCategory = parts.reduce((acc, part) => {
          part.metadata.categories.forEach(category => {
            acc[category] = (acc[category] || 0) + 1;
          });
          return acc;
        }, {} as Record<string, number>);
        
        const totalValue = parts.reduce((sum, part) => sum + part.metadata.value, 0);
        
        const stats = {
          totalParts,
          partsByCondition,
          partsByCategory,
          totalValue
        };
        
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
        // Update each part in the database
        for (const id of ids) {
          const part = get().parts.find(p => p.id === id);
          if (part) {
            const updatedPart = { ...part, ...updates };
            
            // Update in database
            await db.parts.update(id, {
              name: updatedPart.metadata.name,
              category: updatedPart.metadata.categories[0] || '',
              subcategory: '',
              specifications: updatedPart.specifications.custom,
              tags: updatedPart.metadata.tags,
              price: updatedPart.metadata.value,
              condition: mapConditionReverse(updatedPart.metadata.condition),
              updatedAt: new Date()
            });
          }
        }

        // Update in state
        set(state => {
          state.parts = state.parts.map(part => 
            ids.includes(part.id) ? { ...part, ...updates } : part
          );
          
          state.filteredParts = state.filteredParts.map(part => 
            ids.includes(part.id) ? { ...part, ...updates } : part
          );
          
          if (state.selectedPart && ids.includes(state.selectedPart.id)) {
            state.selectedPart = { ...state.selectedPart, ...updates };
          }
        });
      } catch (error) {
        set(state => {
          state.error = error instanceof Error ? error.message : 'Bulk update failed';
        });
        throw error;
      }
    },

    bulkDelete: async (ids) => {
      try {
        // Delete each part from the database
        for (const id of ids) {
          await db.parts.delete(id);
        }

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
    }
  }))
);

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function compareValues(partValue: any, filterValue: any, operator: string): boolean {
  const numPartValue = parseFloat(partValue);
  const numFilterValue = parseFloat(filterValue);

  if (isNaN(numPartValue) || isNaN(numFilterValue)) {
    return false;
  }

  switch (operator) {
    case '>': return numPartValue > numFilterValue;
    case '<': return numPartValue < numFilterValue;
    case '>=': return numPartValue >= numFilterValue;
    case '<=': return numPartValue <= numFilterValue;
    case '=': return numPartValue === numFilterValue;
    case '!=': return numPartValue !== numFilterValue;
    default: return false;
  }
}

function convertCsvRowToPart(row: any): Omit<Part, 'id'> {
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
      physics: { mass: 1, density: 1000, friction: 0.5, restitution: 0.3, collisionShape: 'box' },
      electrical: { conductivity: 0, resistivity: 0, dielectric: 1, breakdown: 0 },
      thermal: { conductivity: 0, capacity: 0, expansion: 0, emissivity: 0 }
    }
  };
}

function convertPartsToCsv(parts: Part[]): string {
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

// Map between our unified condition types and the legacy database condition types
export function mapCondition(dbCondition: string): 'new' | 'used' | 'salvaged' | 'broken' {
  switch (dbCondition) {
    case 'new': return 'new';
    case 'refurbished': return 'used';
    case 'used': return 'used';
    case 'damaged': return 'broken';
    default: return 'used';
  }
}

export function mapConditionReverse(condition: string): string {
  switch (condition) {
    case 'new': return 'new';
    case 'used': return 'used';
    case 'salvaged': return 'used';
    case 'broken': return 'damaged';
    default: return 'used';
  }
}