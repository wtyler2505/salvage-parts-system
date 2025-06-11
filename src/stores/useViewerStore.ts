import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CameraState, SelectionState, ViewMode, SimulationSettings, LODSettings } from '../types';
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
    }
  }))
);