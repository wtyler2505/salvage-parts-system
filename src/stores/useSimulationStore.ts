import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { SimulationManager, SimulationConfig, CoupledResults } from '../lib/simulation/SimulationManager';

interface SimulationStore {
  simulationManager: SimulationManager | null;
  config: SimulationConfig;
  isRunning: boolean;
  currentTime: number;
  results: CoupledResults[];
  selectedComponent: string | null;
  visualizationMode: 'stress' | 'temperature' | 'electrical' | 'failure';
  
  // Actions
  initializeSimulation: (config: SimulationConfig) => void;
  updateConfig: (newConfig: Partial<SimulationConfig>) => void;
  startSimulation: () => void;
  pauseSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  setVisualizationMode: (mode: 'stress' | 'temperature' | 'electrical' | 'failure') => void;
  selectComponent: (componentId: string | null) => void;
  addPhysicsComponent: (id: string, properties: any) => void;
  addElectricalComponent: (id: string, type: string, properties: any) => void;
  runTestScenario: (scenario: string, parameters: any) => void;
  exportResults: (format: 'json' | 'csv' | 'matlab') => string;
}

const defaultConfig: SimulationConfig = {
  physics: {
    enabled: true,
    gravity: [0, -9.81, 0],
    timeStep: 1/60,
    substeps: 1
  },
  electrical: {
    enabled: true,
    frequency: 60,
    solverTolerance: 1e-6,
    maxIterations: 100
  },
  thermal: {
    enabled: true,
    ambientTemperature: 25,
    convectionEnabled: true,
    radiationEnabled: true
  },
  mechanical: {
    enabled: true,
    analysisType: 'static',
    meshDensity: 'medium'
  },
  failure: {
    enabled: true,
    accelerationFactor: 1,
    maintenanceSchedule: false
  }
};

export const useSimulationStore = create<SimulationStore>()(
  immer((set, get) => ({
    simulationManager: null,
    config: defaultConfig,
    isRunning: false,
    currentTime: 0,
    results: [],
    selectedComponent: null,
    visualizationMode: 'stress',

    initializeSimulation: (config) => {
      set(state => {
        state.config = config;
        state.simulationManager = new SimulationManager(config);
      });
    },

    updateConfig: (newConfig) => {
      set(state => {
        state.config = { ...state.config, ...newConfig };
        if (state.simulationManager) {
          state.simulationManager.updateConfig(newConfig);
        }
      });
    },

    startSimulation: () => {
      const { simulationManager } = get();
      if (simulationManager) {
        simulationManager.start();
        set(state => {
          state.isRunning = true;
        });
      }
    },

    pauseSimulation: () => {
      const { simulationManager } = get();
      if (simulationManager) {
        simulationManager.pause();
        set(state => {
          state.isRunning = false;
        });
      }
    },

    stopSimulation: () => {
      const { simulationManager } = get();
      if (simulationManager) {
        simulationManager.stop();
        set(state => {
          state.isRunning = false;
          state.currentTime = 0;
        });
      }
    },

    resetSimulation: () => {
      const { simulationManager } = get();
      if (simulationManager) {
        simulationManager.reset();
        set(state => {
          state.isRunning = false;
          state.currentTime = 0;
          state.results = [];
        });
      }
    },

    setVisualizationMode: (mode) => {
      set(state => {
        state.visualizationMode = mode;
      });
    },

    selectComponent: (componentId) => {
      set(state => {
        state.selectedComponent = componentId;
      });
    },

    addPhysicsComponent: (id, properties) => {
      const { simulationManager } = get();
      if (simulationManager) {
        // Add component to simulation
        // This would be implemented based on the specific component type
      }
    },

    addElectricalComponent: (id, type, properties) => {
      const { simulationManager } = get();
      if (simulationManager) {
        simulationManager.addElectricalComponent(
          id,
          type,
          properties.value || 0,
          properties.nodeA || 'ground',
          properties.nodeB || 'node1',
          properties.position || { x: 0, y: 0, z: 0 },
          properties
        );
      }
    },

    runTestScenario: (scenario, parameters) => {
      const { simulationManager } = get();
      if (simulationManager) {
        simulationManager.runScenario(scenario, parameters);
      }
    },

    exportResults: (format) => {
      const { simulationManager } = get();
      if (simulationManager) {
        return simulationManager.exportResults(format);
      }
      return '';
    }
  }))
);