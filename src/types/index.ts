export interface Part {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  specifications: Record<string, any>;
  tags: string[];
  price?: number;
  availability: 'in-stock' | 'low-stock' | 'out-of-stock';
  condition: 'new' | 'refurbished' | 'used' | 'damaged';
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  materials: string[];
  electricalProperties?: {
    voltage?: number;
    current?: number;
    resistance?: number;
    power?: number;
  };
  thermalProperties?: {
    maxTemperature?: number;
    thermalConductivity?: number;
    heatCapacity?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewMode {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  zoom: number;
}

export interface SelectionState {
  selectedParts: string[];
  hoveredPart: string | null;
  highlightMode: 'outline' | 'glow' | 'wireframe';
}

export interface SimulationSettings {
  physics: {
    enabled: boolean;
    showDebug?: boolean;
    gravity: [number, number, number];
    timeStep: number;
  };
  electrical: {
    enabled: boolean;
    showCurrentFlow: boolean;
    voltage: number;
  };
  thermal: {
    enabled: boolean;
    ambientTemperature: number;
    showHeatMap: boolean;
  };
}

export interface Measurement {
  id: string;
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  distance: number;
}

export interface LODSettings {
  enabled: boolean;
  distances: [number, number, number]; // near, medium, far
  maxInstances: number;
}