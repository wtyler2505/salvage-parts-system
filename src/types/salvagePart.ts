export interface SalvagePart {
  id: string;
  metadata: {
    name: string;
    manufacturer: string;
    model: string;
    partNumbers: string[];
    categories: string[];
    tags: string[];
    dateAdded: Date;
    lastModified: Date;
    notes: string;
    condition: 'new' | 'used' | 'salvaged' | 'broken';
    quantity: number;
    location: string;
    value: number;
    source: string;
  };
  
  specifications: {
    electrical?: {
      voltage: string;
      current: string;
      power: string;
      resistance: number;
      capacitance: number;
      inductance: number;
      frequency: string;
    };
    mechanical?: {
      dimensions: { x: number; y: number; z: number };
      weight: number;
      material: string;
      torque: string;
      rpm: number;
      force: string;
      pressure: string;
    };
    thermal?: {
      operatingTemp: { min: number; max: number };
      thermalResistance: number;
      heatDissipation: number;
    };
    custom: Record<string, any>;
  };
  
  models: {
    primary: ModelData;
    lods: ModelData[];
    collision: ModelData;
    cross_section?: ModelData;
  };
  
  components: PartComponent[];
  
  documentation: {
    datasheets: Document[];
    manuals: Document[];
    schematics: Document[];
    images: Image[];
    videos: Video[];
  };
  
  simulation: {
    physics: PhysicsProperties;
    electrical: ElectricalProperties;
    thermal: ThermalProperties;
  };
}

export interface ModelData {
  id: string;
  url: string;
  format: 'gltf' | 'obj' | 'stl' | 'step';
  size: number;
  checksum: string;
  thumbnail?: string;
  metadata: {
    vertices: number;
    faces: number;
    materials: string[];
    animations: string[];
  };
}

export interface PartComponent {
  id: string;
  name: string;
  type: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  properties: Record<string, any>;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'text';
  url: string;
  size: number;
  uploadDate: Date;
  tags: string[];
}

export interface Image {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  size: number;
  dimensions: { width: number; height: number };
  uploadDate: Date;
  tags: string[];
}

export interface Video {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: number;
  size: number;
  uploadDate: Date;
  tags: string[];
}

export interface PhysicsProperties {
  mass: number;
  density: number;
  friction: number;
  restitution: number;
  collisionShape: 'box' | 'sphere' | 'cylinder' | 'mesh';
}

export interface ElectricalProperties {
  conductivity: number;
  resistivity: number;
  dielectric: number;
  breakdown: number;
}

export interface ThermalProperties {
  conductivity: number;
  capacity: number;
  expansion: number;
  emissivity: number;
}

export interface SearchFilters {
  text?: string;
  categories?: string[];
  tags?: string[];
  condition?: string[];
  manufacturer?: string[];
  dateRange?: { start: Date; end: Date };
  valueRange?: { min: number; max: number };
  specifications?: Record<string, any>;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  parts: SalvagePart[];
}