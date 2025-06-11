import Dexie, { Table } from 'dexie';
import { SalvagePart, ModelData, Document, Image, Video, SearchFilters } from '../types/salvagePart';

export class SalvageDatabase extends Dexie {
  parts!: Table<SalvagePart>;
  models!: Table<ModelData>;
  documents!: Table<Document>;
  images!: Table<Image>;
  videos!: Table<Video>;
  searchIndex!: Table<{ id: string; content: string; partId: string }>;

  constructor() {
    super('SalvageDatabase');
    
    this.version(1).stores({
      parts: '++id, metadata.name, metadata.manufacturer, metadata.model, [metadata.categories+metadata.tags], metadata.condition, metadata.dateAdded, metadata.value',
      models: '++id, url, format, size',
      documents: '++id, name, type, partId, uploadDate',
      images: '++id, name, partId, uploadDate',
      videos: '++id, name, partId, uploadDate',
      searchIndex: '++id, partId, content'
    });

    // Hooks for maintaining search index
    this.parts.hook('creating', (primKey, obj, trans) => {
      this.updateSearchIndex(obj.id, obj);
    });

    this.parts.hook('updating', (modifications, primKey, obj, trans) => {
      this.updateSearchIndex(obj.id, obj);
    });

    this.parts.hook('deleting', (primKey, obj, trans) => {
      this.searchIndex.where('partId').equals(obj.id).delete();
    });
  }

  private async updateSearchIndex(partId: string, part: SalvagePart) {
    // Delete existing index entries
    await this.searchIndex.where('partId').equals(partId).delete();

    // Create searchable content
    const searchContent = [
      part.metadata.name,
      part.metadata.manufacturer,
      part.metadata.model,
      ...part.metadata.partNumbers,
      ...part.metadata.categories,
      ...part.metadata.tags,
      part.metadata.notes,
      part.metadata.location,
      part.metadata.source,
      JSON.stringify(part.specifications)
    ].join(' ').toLowerCase();

    // Add new index entry
    await this.searchIndex.add({
      id: `${partId}_search`,
      partId,
      content: searchContent
    });
  }

  async searchParts(filters: SearchFilters): Promise<SalvagePart[]> {
    let query = this.parts.toCollection();

    // Text search using search index
    if (filters.text) {
      const searchResults = await this.searchIndex
        .where('content')
        .startsWithIgnoreCase(filters.text.toLowerCase())
        .toArray();
      
      const partIds = searchResults.map(r => r.partId);
      query = this.parts.where('id').anyOf(partIds);
    }

    // Apply filters
    let results = await query.toArray();

    if (filters.categories?.length) {
      results = results.filter(part => 
        filters.categories!.some(cat => part.metadata.categories.includes(cat))
      );
    }

    if (filters.tags?.length) {
      results = results.filter(part => 
        filters.tags!.some(tag => part.metadata.tags.includes(tag))
      );
    }

    if (filters.condition?.length) {
      results = results.filter(part => 
        filters.condition!.includes(part.metadata.condition)
      );
    }

    if (filters.manufacturer?.length) {
      results = results.filter(part => 
        filters.manufacturer!.includes(part.metadata.manufacturer)
      );
    }

    if (filters.dateRange) {
      results = results.filter(part => 
        part.metadata.dateAdded >= filters.dateRange!.start &&
        part.metadata.dateAdded <= filters.dateRange!.end
      );
    }

    if (filters.valueRange) {
      results = results.filter(part => 
        part.metadata.value >= filters.valueRange!.min &&
        part.metadata.value <= filters.valueRange!.max
      );
    }

    // Parametric search on specifications
    if (filters.specifications) {
      results = results.filter(part => {
        return Object.entries(filters.specifications!).every(([key, value]) => {
          const partValue = this.getNestedValue(part.specifications, key);
          if (typeof value === 'object' && value.operator) {
            return this.compareValues(partValue, value.value, value.operator);
          }
          return partValue === value;
        });
      });
    }

    return results;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private compareValues(partValue: any, filterValue: any, operator: string): boolean {
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

  async getPartStatistics() {
    const totalParts = await this.parts.count();
    const partsByCondition = await this.parts.toArray().then(parts => {
      const stats = { new: 0, used: 0, salvaged: 0, broken: 0 };
      parts.forEach(part => stats[part.metadata.condition]++);
      return stats;
    });

    const partsByCategory = await this.parts.toArray().then(parts => {
      const stats: Record<string, number> = {};
      parts.forEach(part => {
        part.metadata.categories.forEach(cat => {
          stats[cat] = (stats[cat] || 0) + 1;
        });
      });
      return stats;
    });

    const totalValue = await this.parts.toArray().then(parts => 
      parts.reduce((sum, part) => sum + part.metadata.value, 0)
    );

    return {
      totalParts,
      partsByCondition,
      partsByCategory,
      totalValue
    };
  }
}

export const salvageDb = new SalvageDatabase();