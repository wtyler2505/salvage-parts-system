import Dexie, { Table } from 'dexie';
import { Part } from '../types';

export class PartsDatabase extends Dexie {
  parts!: Table<Part>;

  constructor() {
    super('PartsDatabase');
    this.version(1).stores({
      parts: '++id, metadata.name, metadata.manufacturer, metadata.model, [metadata.categories+metadata.tags], metadata.condition, metadata.dateAdded, metadata.value'
    });
  }
  
  // Helper methods for searching and filtering
  async searchParts(filters: any): Promise<Part[]> {
    let query = this.parts.toCollection();
    
    // Text search
    if (filters.text) {
      const searchText = filters.text.toLowerCase();
      query = query.filter(part => 
        part.metadata.name.toLowerCase().includes(searchText) ||
        part.metadata.manufacturer.toLowerCase().includes(searchText) ||
        part.metadata.model.toLowerCase().includes(searchText) ||
        part.metadata.tags.some(tag => tag.toLowerCase().includes(searchText)) ||
        part.metadata.categories.some(cat => cat.toLowerCase().includes(searchText))
      );
    }
    
    // Category filter
    if (filters.categories?.length) {
      query = query.filter(part => 
        filters.categories.some((cat: string) => part.metadata.categories.includes(cat))
      );
    }
    
    // Tags filter
    if (filters.tags?.length) {
      query = query.filter(part => 
        filters.tags.some((tag: string) => part.metadata.tags.includes(tag))
      );
    }
    
    // Condition filter
    if (filters.condition?.length) {
      query = query.filter(part => 
        filters.condition.includes(part.metadata.condition)
      );
    }
    
    // Date range filter
    if (filters.dateRange) {
      query = query.filter(part => 
        part.metadata.dateAdded >= filters.dateRange.start &&
        part.metadata.dateAdded <= filters.dateRange.end
      );
    }
    
    // Value range filter
    if (filters.valueRange) {
      query = query.filter(part => 
        part.metadata.value >= filters.valueRange.min &&
        part.metadata.value <= filters.valueRange.max
      );
    }
    
    return await query.toArray();
  }
  
  async getPartStatistics() {
    const parts = await this.parts.toArray();
    
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
    
    return {
      totalParts,
      partsByCondition,
      partsByCategory,
      totalValue
    };
  }
}

export const db = new PartsDatabase();

// Sample data initialization
export const initializeSampleData = async () => {
  const count = await db.parts.count();
  if (count === 0) {
    const sampleParts: Omit<Part, 'id'>[] = [
      {
        metadata: {
          name: 'Engine Block V8',
          manufacturer: 'Ford',
          model: 'Coyote',
          partNumbers: ['FR3E-6015-AA'],
          categories: ['Engine Components', 'Engine Blocks'],
          tags: ['engine', 'v8', 'block', 'ford'],
          dateAdded: new Date(),
          lastModified: new Date(),
          notes: 'Ford Mustang GT 5.0L Coyote V8 engine block, aluminum construction',
          condition: 'used',
          quantity: 1,
          location: 'Warehouse A',
          value: 2500,
          source: 'Salvage Yard'
        },
        specifications: {
          mechanical: {
            dimensions: { x: 600, y: 500, z: 400 },
            weight: 150,
            material: 'Cast Iron',
            torque: '',
            rpm: 0,
            force: '',
            pressure: ''
          },
          custom: {
            displacement: '5.0L',
            cylinders: 8,
            material: 'Cast Iron',
            manufacturer: 'Ford'
          }
        },
        models: {
          primary: { 
            id: '', 
            url: '/models/engine-block-v8.gltf', 
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
          physics: { mass: 150, density: 7200, friction: 0.5, restitution: 0.2, collisionShape: 'box' },
          electrical: { conductivity: 0, resistivity: 0, dielectric: 1, breakdown: 0 },
          thermal: { conductivity: 50, capacity: 450, expansion: 12e-6, emissivity: 0.8 }
        }
      },
      {
        metadata: {
          name: 'Transmission Assembly',
          manufacturer: 'ZF',
          model: 'Manual 6-speed',
          partNumbers: ['ZF-6S-850'],
          categories: ['Drivetrain', 'Transmissions'],
          tags: ['transmission', 'manual', '6-speed', 'zf'],
          dateAdded: new Date(),
          lastModified: new Date(),
          notes: 'Manual 6-speed transmission, good condition',
          condition: 'used',
          quantity: 1,
          location: 'Warehouse A',
          value: 1800,
          source: 'Salvage Yard'
        },
        specifications: {
          mechanical: {
            dimensions: { x: 800, y: 400, z: 300 },
            weight: 85,
            material: 'Aluminum, Steel',
            torque: '350 lb-ft',
            rpm: 0,
            force: '',
            pressure: ''
          },
          custom: {
            type: 'Manual',
            gears: 6,
            torque: '350 lb-ft',
            manufacturer: 'ZF'
          }
        },
        models: {
          primary: { 
            id: '', 
            url: '/models/transmission-assembly.gltf', 
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
          physics: { mass: 85, density: 2700, friction: 0.3, restitution: 0.2, collisionShape: 'box' },
          electrical: { conductivity: 0, resistivity: 0, dielectric: 1, breakdown: 0 },
          thermal: { conductivity: 0, capacity: 0, expansion: 0, emissivity: 0 }
        }
      },
      {
        metadata: {
          name: 'ECU Control Module',
          manufacturer: 'Bosch',
          model: 'ECU-X1',
          partNumbers: ['ECU-X1-2023'],
          categories: ['Electronics', 'Control Units'],
          tags: ['ecu', 'electronics', 'control', 'module'],
          dateAdded: new Date(),
          lastModified: new Date(),
          notes: 'Engine Control Unit for modern vehicles',
          condition: 'new',
          quantity: 1,
          location: 'Quality Control',
          value: 450,
          source: 'Manufacturer'
        },
        specifications: {
          electrical: {
            voltage: '12V',
            current: '2.5A',
            power: '30W',
            resistance: 0,
            capacitance: 0,
            inductance: 0,
            frequency: ''
          },
          mechanical: {
            dimensions: { x: 150, y: 100, z: 50 },
            weight: 0.8,
            material: 'Plastic, Silicon, Copper',
            torque: '',
            rpm: 0,
            force: '',
            pressure: ''
          },
          custom: {
            type: 'Engine Control Unit',
            voltage: '12V',
            processor: 'ARM Cortex-M4',
            memory: '2MB Flash'
          }
        },
        models: {
          primary: { 
            id: '', 
            url: '/models/ecu-module.gltf', 
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
          physics: { mass: 0.8, density: 1200, friction: 0.5, restitution: 0.2, collisionShape: 'box' },
          electrical: { conductivity: 5.8e7, resistivity: 1.68e-8, dielectric: 3.9, breakdown: 30e6 },
          thermal: { conductivity: 0.2, capacity: 1500, expansion: 70e-6, emissivity: 0.9 }
        }
      }
    ];

    // Add sample parts to database
    for (const part of sampleParts) {
      await db.parts.add(part as any);
    }
  }
};