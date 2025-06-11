import Dexie, { Table } from 'dexie';
import { Part } from '../types';

export class PartsDatabase extends Dexie {
  parts!: Table<Part>;

  constructor() {
    super('PartsDatabase');
    this.version(1).stores({
      parts: '++id, name, category, subcategory, tags, availability, condition, createdAt'
    });
  }
}

export const db = new PartsDatabase();

// Sample data initialization
export const initializeSampleData = async () => {
  const count = await db.parts.count();
  if (count === 0) {
    const sampleParts: Omit<Part, 'id'>[] = [
      {
        name: 'Engine Block V8',
        category: 'Engine Components',
        subcategory: 'Engine Blocks',
        specifications: {
          displacement: '5.0L',
          cylinders: 8,
          material: 'Cast Iron',
          manufacturer: 'Ford'
        },
        tags: ['engine', 'v8', 'block', 'ford'],
        price: 2500,
        availability: 'in-stock',
        condition: 'refurbished',
        dimensions: {
          length: 600,
          width: 500,
          height: 400,
          weight: 150
        },
        materials: ['Cast Iron', 'Steel'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Transmission Assembly',
        category: 'Drivetrain',
        subcategory: 'Transmissions',
        specifications: {
          type: 'Manual',
          gears: 6,
          torque: '350 lb-ft',
          manufacturer: 'ZF'
        },
        tags: ['transmission', 'manual', '6-speed', 'zf'],
        price: 1800,
        availability: 'low-stock',
        condition: 'used',
        dimensions: {
          length: 800,
          width: 400,
          height: 300,
          weight: 85
        },
        materials: ['Aluminum', 'Steel'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'ECU Control Module',
        category: 'Electronics',
        subcategory: 'Control Units',
        specifications: {
          type: 'Engine Control Unit',
          voltage: '12V',
          processor: 'ARM Cortex-M4',
          memory: '2MB Flash'
        },
        tags: ['ecu', 'electronics', 'control', 'module'],
        price: 450,
        availability: 'in-stock',
        condition: 'new',
        dimensions: {
          length: 150,
          width: 100,
          height: 50,
          weight: 0.8
        },
        materials: ['Plastic', 'Silicon', 'Copper'],
        electricalProperties: {
          voltage: 12,
          current: 2.5,
          power: 30
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.parts.bulkAdd(sampleParts);
  }
};