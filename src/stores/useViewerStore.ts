import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CameraState, SelectionState, ViewMode, SimulationSettings, LODSettings, Measurement } from '../types';
import * as THREE from 'three';

interface Annotation {
  id: string;
  position: THREE.Vector3;
  text: string;
  author?: string;
  createdAt: Date;
  color?: string;
}

interface ViewerStore {
  cameraState: CameraState;
  selectionState: SelectionState;
  currentViewMode: string;
  viewModes: ViewMode[];
  simulationSettings: SimulationSettings;
  lodSettings: LODSettings;
  showMeasurements: boolean;
  showGrid: boolean;
  showWireframe: boolean;
  explodedView: boolean;
  explodeFactor: number;
  annotations: Annotation[];
  isAddingAnnotation: boolean;
  measurements: Measurement[];
  currentMeasurementPoints: THREE.Vector3[];
  isMeasuring: boolean;
  
  // Actions
  setCameraState: (state: Partial<CameraState>) => void;
  selectPart: (partId: string, multiSelect?: boolean) => void;
  hoverPart: (partId: string | null) => void;
  clearSelection: () => void;
  setViewMode: (modeId: string) => void;
  updateSimulationSettings: (settings: Partial<SimulationSettings>) => void;
  updateLODSettings: (settings: Partial<LODSettings>) => void;
  toggleMeasurements: () => void;
  toggleGrid: () => void;
  toggleWireframe: () => void;
  setExplodedView: (enabled: boolean, factor?: number) => void;
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  updateAnnotation: (id: string, text: string) => void;
  deleteAnnotation: (id: string) => void;
  setIsAddingAnnotation: (isAdding: boolean) => void;
  setIsMeasuring: (isMeasuring: boolean) => void;
  addMeasurementPoint: (point: THREE.Vector3) => void;
  deleteMeasurement: (id: string) => void;
  clearMeasurements: () => void;
}

export const useViewerStore = create<ViewerStore>()(
  immer((set) => ({
    cameraState: {
      position: [5, 5, 5],
      target: [0, 0, 0],
      zoom: 1
    },
    selectionState: {
      selectedParts: [],
      hoveredPart: null,
      highlightMode: 'outline'
    },
    currentViewMode: 'normal',
    viewModes: [
      { id: 'normal', name: 'Normal', description: 'Standard rendering', icon: 'Eye' },
      { id: 'wireframe', name: 'Wireframe', description: 'Show mesh structure', icon: 'Grid3X3' },
      { id: 'xray', name: 'X-Ray', description: 'Transparent rendering', icon: 'Scan' },
      { id: 'exploded', name: 'Exploded', description: 'Separated components', icon: 'Maximize2' }
    ],
    simulationSettings: {
      physics: {
        enabled: false,
        showDebug: false,
        gravity: [0, -9.81, 0],
        timeStep: 1/60
      },
      electrical: {
        enabled: false,
        showCurrentFlow: false,
        voltage: 12
      },
      thermal: {
        enabled: false,
        ambientTemperature: 20,
        showHeatMap: false
      }
    },
    lodSettings: {
      enabled: true,
      distances: [10, 50, 200],
      maxInstances: 1000
    },
    showMeasurements: false,
    showGrid: true,
    showWireframe: false,
    explodedView: false,
    explodeFactor: 1.5,
    annotations: [],
    isAddingAnnotation: false,
    measurements: [],
    currentMeasurementPoints: [],
    isMeasuring: false,

    setCameraState: (state) => {
      set(draft => {
        Object.assign(draft.cameraState, state);
      });
    },

    selectPart: (partId: string, multiSelect = false) => {
      set(draft => {
        if (multiSelect) {
          const index = draft.selectionState.selectedParts.indexOf(partId);
          if (index >= 0) {
            draft.selectionState.selectedParts.splice(index, 1);
          } else {
            draft.selectionState.selectedParts.push(partId);
          }
        } else {
          draft.selectionState.selectedParts = [partId];
        }
      });
    },

    hoverPart: (partId) => {
      set(draft => {
        draft.selectionState.hoveredPart = partId;
      });
    },

    clearSelection: () => {
      set(draft => {
        draft.selectionState.selectedParts = [];
        draft.selectionState.hoveredPart = null;
      });
    },

    setViewMode: (modeId) => {
      set(draft => {
        draft.currentViewMode = modeId;
        draft.showWireframe = modeId === 'wireframe';
        draft.explodedView = modeId === 'exploded';
      });
    },

    updateSimulationSettings: (settings) => {
      set(draft => {
        Object.assign(draft.simulationSettings, settings);
      });
    },

    updateLODSettings: (settings) => {
      set(draft => {
        Object.assign(draft.lodSettings, settings);
      });
    },

    toggleMeasurements: () => {
      set(draft => {
        draft.showMeasurements = !draft.showMeasurements;
      });
    },

    toggleGrid: () => {
      set(draft => {
        draft.showGrid = !draft.showGrid;
      });
    },

    toggleWireframe: () => {
      set(draft => {
        draft.showWireframe = !draft.showWireframe;
      });
    },

    setExplodedView: (enabled, factor = 1.5) => {
      set(draft => {
        draft.explodedView = enabled;
        draft.explodeFactor = factor;
      });
    },
    
    addAnnotation: (annotation) => {
      set(draft => {
        draft.annotations.push({
          ...annotation,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          color: annotation.color || '#3B82F6'
        });
      });
    },
    
    updateAnnotation: (id, text) => {
      set(draft => {
        const annotation = draft.annotations.find(a => a.id === id);
        if (annotation) {
          annotation.text = text;
        }
      });
    },
    
    deleteAnnotation: (id) => {
      set(draft => {
        draft.annotations = draft.annotations.filter(a => a.id !== id);
      });
    },
    
    setIsAddingAnnotation: (isAdding) => {
      set(draft => {
        draft.isAddingAnnotation = isAdding;
      });
    },
    
    setIsMeasuring: (isMeasuring) => {
      set(draft => {
        draft.isMeasuring = isMeasuring;
        // Clear current measurement points when toggling off
        if (!isMeasuring) {
          draft.currentMeasurementPoints = [];
        }
      });
    },
    
    addMeasurementPoint: (point) => {
      set(draft => {
        // Add point to current measurement points
        draft.currentMeasurementPoints.push(point);
        
        // If we have 2 points, create a measurement
        if (draft.currentMeasurementPoints.length === 2) {
          const startPoint = draft.currentMeasurementPoints[0];
          const endPoint = draft.currentMeasurementPoints[1];
          
          // Calculate distance
          const distance = startPoint.distanceTo(endPoint);
          
          // Create measurement
          draft.measurements.push({
            id: crypto.randomUUID(),
            startPoint,
            endPoint,
            distance
          });
          
          // Clear current measurement points
          draft.currentMeasurementPoints = [];
        }
      });
    },
    
    deleteMeasurement: (id) => {
      set(draft => {
        draft.measurements = draft.measurements.filter(m => m.id !== id);
      });
    },
    
    clearMeasurements: () => {
      set(draft => {
        draft.measurements = [];
      });
    }
  }))
);