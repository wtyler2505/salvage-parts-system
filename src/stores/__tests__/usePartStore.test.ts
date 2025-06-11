import { jest } from '@jest/globals';
import { usePartStore } from '../usePartStore';
import { db } from '../../lib/database';
import type { Part } from '../../types';

jest.mock('../../lib/database', () => {
  return {
    db: {
      parts: {
        toArray: jest.fn().mockResolvedValue([] as any),
        add: jest.fn().mockResolvedValue(undefined as any),
        update: jest.fn().mockResolvedValue(undefined as any),
        delete: jest.fn().mockResolvedValue(undefined as any)
      }
    }
  };
});

const samplePart: Omit<Part, 'id'> = {
  metadata: {
    name: 'Sample Part',
    manufacturer: 'Maker',
    model: 'M1',
    partNumbers: [],
    categories: ['Engine'],
    tags: ['tag1'],
    dateAdded: new Date(),
    lastModified: new Date(),
    notes: '',
    condition: 'new',
    quantity: 1,
    location: '',
    value: 100,
    source: ''
  },
  specifications: { custom: {} },
  models: {
    primary: { id: '', url: '', format: 'gltf', size: 0, checksum: '', metadata: { vertices: 0, faces: 0, materials: [], animations: [] } },
    lods: [],
    collision: { id: '', url: '', format: 'gltf', size: 0, checksum: '', metadata: { vertices: 0, faces: 0, materials: [], animations: [] } }
  },
  components: [],
  documentation: { datasheets: [], manuals: [], schematics: [], images: [], videos: [] },
  simulation: {
    physics: { mass: 1, density: 1, friction: 0.5, restitution: 0.1, collisionShape: 'box' },
    electrical: { conductivity: 0, resistivity: 0, dielectric: 0, breakdown: 0 },
    thermal: { conductivity: 0, capacity: 0, expansion: 0, emissivity: 0 }
  }
};

beforeEach(() => {
  usePartStore.setState({
    parts: [],
    filteredParts: [],
    selectedPart: null,
    favorites: new Set(),
    recentPartIds: [],
    searchFilters: {},
    searchQuery: '',
    selectedCategory: '',
    selectedTags: [],
    loading: false,
    error: null,
    statistics: null
  });
  localStorage.clear();
});

describe('usePartStore CRUD operations', () => {
  it('creates, updates and deletes a part', async () => {
    const id = await usePartStore.getState().createPart(samplePart);
    expect(db.parts.add).toHaveBeenCalled();
    expect(usePartStore.getState().parts).toHaveLength(1);

    await usePartStore.getState().updatePart(id, {
      metadata: { ...samplePart.metadata, name: 'Updated' }
    });
    expect(db.parts.update).toHaveBeenCalledWith(id, expect.any(Object));
    expect(usePartStore.getState().parts[0].metadata.name).toBe('Updated');

    await usePartStore.getState().deletePart(id);
    expect(db.parts.delete).toHaveBeenCalledWith(id);
    expect(usePartStore.getState().parts).toHaveLength(0);
  });
});

describe('usePartStore filters and favorites', () => {
  it('filters by category and tags and manages favorites', async () => {
    const id1 = await usePartStore.getState().createPart(samplePart);
    const id2 = await usePartStore.getState().createPart({
      ...samplePart,
      metadata: { ...samplePart.metadata, name: 'Other', categories: ['Trans'], tags: ['tag2'] }
    });

    usePartStore.getState().filterByCategory('Engine');
    expect(usePartStore.getState().filteredParts).toHaveLength(1);

    usePartStore.getState().filterByCategory('');
    usePartStore.getState().filterByTags(['tag2']);
    expect(usePartStore.getState().filteredParts).toHaveLength(1);
    expect(usePartStore.getState().filteredParts[0].id).toBe(id2);

    usePartStore.getState().toggleFavorite(id1);
    expect(usePartStore.getState().favorites.has(id1)).toBe(true);

    usePartStore.getState().filterBySpecialCategory('favorites');
    expect(usePartStore.getState().filteredParts).toHaveLength(1);
    expect(usePartStore.getState().filteredParts[0].id).toBe(id1);
  });
});
