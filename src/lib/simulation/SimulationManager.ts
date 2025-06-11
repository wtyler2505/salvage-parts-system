import { PhysicsSimulator } from './PhysicsSimulator';
import { ElectricalSimulator } from './ElectricalSimulator';
import { ThermalSimulator } from './ThermalSimulator';
import { MechanicalSimulator } from './MechanicalSimulator';
import { FailureSimulator } from './FailureSimulator';
import * as THREE from 'three';

export interface SimulationConfig {
  physics: {
    enabled: boolean;
    gravity: [number, number, number];
    timeStep: number;
    substeps: number;
  };
  electrical: {
    enabled: boolean;
    frequency: number;
    solverTolerance: number;
    maxIterations: number;
  };
  thermal: {
    enabled: boolean;
    ambientTemperature: number;
    convectionEnabled: boolean;
    radiationEnabled: boolean;
  };
  mechanical: {
    enabled: boolean;
    analysisType: 'static' | 'dynamic' | 'modal';
    meshDensity: 'coarse' | 'medium' | 'fine';
  };
  failure: {
    enabled: boolean;
    accelerationFactor: number;
    maintenanceSchedule: boolean;
  };
}

export interface SimulationState {
  isRunning: boolean;
  currentTime: number;
  timeStep: number;
  performance: {
    fps: number;
    physicsTime: number;
    electricalTime: number;
    thermalTime: number;
    mechanicalTime: number;
    failureTime: number;
  };
}

export interface CoupledResults {
  timestamp: number;
  physics: any;
  electrical: any;
  thermal: any;
  mechanical: any;
  failure: any;
  interactions: {
    electricalToThermal: number;
    thermalToMechanical: number;
    mechanicalToFailure: number;
  };
}

export class SimulationManager {
  private physicsSimulator: PhysicsSimulator;
  private electricalSimulator: ElectricalSimulator;
  private thermalSimulator: ThermalSimulator;
  private mechanicalSimulator: MechanicalSimulator;
  private failureSimulator: FailureSimulator;

  private config: SimulationConfig;
  private state: SimulationState;
  private results: CoupledResults[] = [];
  private animationFrameId: number | null = null;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.state = {
      isRunning: false,
      currentTime: 0,
      timeStep: config.physics.timeStep,
      performance: {
        fps: 0,
        physicsTime: 0,
        electricalTime: 0,
        thermalTime: 0,
        mechanicalTime: 0,
        failureTime: 0
      }
    };

    // Initialize simulators
    this.physicsSimulator = new PhysicsSimulator();
    this.electricalSimulator = new ElectricalSimulator();
    this.thermalSimulator = new ThermalSimulator();
    this.mechanicalSimulator = new MechanicalSimulator();
    this.failureSimulator = new FailureSimulator();

    this.setupCoupledSimulation();
  }

  private setupCoupledSimulation(): void {
    // Configure thermal simulator with ambient temperature
    this.thermalSimulator.setAmbientTemperature(this.config.thermal.ambientTemperature);
  }

  // Simulation Control
  start(): void {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.currentTime = 0;
    this.results = [];

    this.simulationLoop();
  }

  stop(): void {
    this.state.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  pause(): void {
    this.state.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resume(): void {
    if (!this.state.isRunning) {
      this.state.isRunning = true;
      this.simulationLoop();
    }
  }

  reset(): void {
    this.stop();
    this.state.currentTime = 0;
    this.results = [];
    
    // Reset all simulators
    this.physicsSimulator = new PhysicsSimulator();
    this.electricalSimulator = new ElectricalSimulator();
    this.thermalSimulator = new ThermalSimulator();
    this.mechanicalSimulator = new MechanicalSimulator();
    this.failureSimulator = new FailureSimulator();
    
    this.setupCoupledSimulation();
  }

  private simulationLoop(): void {
    if (!this.state.isRunning) return;

    const startTime = performance.now();
    
    // Perform coupled simulation step
    this.performCoupledStep(this.state.timeStep);
    
    // Update performance metrics
    const endTime = performance.now();
    const frameTime = endTime - startTime;
    this.state.performance.fps = 1000 / frameTime;

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.simulationLoop());
  }

  private performCoupledStep(deltaTime: number): void {
    const stepResults: CoupledResults = {
      timestamp: this.state.currentTime,
      physics: null,
      electrical: null,
      thermal: null,
      mechanical: null,
      failure: null,
      interactions: {
        electricalToThermal: 0,
        thermalToMechanical: 0,
        mechanicalToFailure: 0
      }
    };

    // 1. Physics Simulation
    if (this.config.physics.enabled) {
      const physicsStart = performance.now();
      this.physicsSimulator.step(deltaTime);
      this.state.performance.physicsTime = performance.now() - physicsStart;
    }

    // 2. Electrical Simulation
    if (this.config.electrical.enabled) {
      const electricalStart = performance.now();
      stepResults.electrical = this.electricalSimulator.solveCircuit();
      this.state.performance.electricalTime = performance.now() - electricalStart;

      // Couple electrical to thermal (Joule heating)
      this.coupleElectricalToThermal(stepResults.electrical);
    }

    // 3. Thermal Simulation
    if (this.config.thermal.enabled) {
      const thermalStart = performance.now();
      this.thermalSimulator.step(deltaTime);
      stepResults.thermal = this.thermalSimulator.getState();
      this.state.performance.thermalTime = performance.now() - thermalStart;

      // Couple thermal to mechanical (thermal stress)
      this.coupleThermalToMechanical(stepResults.thermal);
    }

    // 4. Mechanical Simulation (periodic, not every frame)
    if (this.config.mechanical.enabled && this.state.currentTime % 1.0 < deltaTime) {
      const mechanicalStart = performance.now();
      stepResults.mechanical = this.mechanicalSimulator.performStressAnalysis('current');
      this.state.performance.mechanicalTime = performance.now() - mechanicalStart;

      // Couple mechanical to failure
      this.coupleMechanicalToFailure(stepResults.mechanical);
    }

    // 5. Failure Simulation
    if (this.config.failure.enabled) {
      const failureStart = performance.now();
      const failures = this.failureSimulator.step(deltaTime * this.config.failure.accelerationFactor);
      stepResults.failure = { failures, systemReliability: this.failureSimulator.getSystemReliability() };
      this.state.performance.failureTime = performance.now() - failureStart;
    }

    // Store results
    this.results.push(stepResults);
    
    // Limit results history
    if (this.results.length > 1000) {
      this.results.shift();
    }

    this.state.currentTime += deltaTime;
  }

  // Coupling Methods
  private coupleElectricalToThermal(electricalState: any): void {
    if (!electricalState) return;

    // Convert electrical power dissipation to heat sources
    electricalState.componentPowers.forEach((power: number, componentId: string) => {
      if (power > 0.1) { // Only significant power dissipation
        const component = this.electricalSimulator.getComponent(componentId);
        if (component) {
          this.thermalSimulator.addElectricalHeatGeneration(componentId, power, component.position);
          
          // Update failure simulator with electrical stress
          this.failureSimulator.updateStressFactor(componentId, 'electrical_power', power);
        }
      }
    });

    // Check for overvoltage/overcurrent conditions
    electricalState.nodeVoltages.forEach((voltage: number, nodeId: string) => {
      if (voltage > 15) { // Assuming 12V system with 25% tolerance
        // Find components connected to this node
        // Simulate overvoltage effects
      }
    });
  }

  private coupleThermalToMechanical(thermalState: any): void {
    if (!thermalState) return;

    // Apply thermal loads to mechanical simulation
    thermalState.nodeTemperatures.forEach((temperature: number, nodeId: string) => {
      const thermalNode = this.thermalSimulator.getNode(nodeId);
      if (thermalNode && temperature > 50) { // Significant temperature
        // Calculate thermal expansion force
        const thermalExpansion = (temperature - 20) * 12e-6; // Thermal expansion coefficient
        const thermalForce = thermalExpansion * 200e9 * 0.001; // E * A * strain
        
        // Add thermal load to mechanical simulation
        this.mechanicalSimulator.addLoadCase(
          `thermal_${nodeId}`,
          'force',
          thermalForce,
          new THREE.Vector3(1, 0, 0), // Expansion direction
          thermalNode.position
        );

        // Update failure simulator with thermal stress
        this.failureSimulator.updateStressFactor(nodeId, 'temperature', temperature);
      }
    });
  }

  private coupleMechanicalToFailure(mechanicalResult: any): void {
    if (!mechanicalResult) return;

    // Update failure simulator with mechanical stresses
    const stressVisualization = this.mechanicalSimulator.getStressVisualization();
    
    stressVisualization.forEach(stressData => {
      this.failureSimulator.updateStressFactor(
        stressData.nodeId,
        'mechanical_stress',
        stressData.stress
      );

      // Check for immediate failure due to overstress
      if (stressData.stress > 250e6) { // Yield strength exceeded
        this.failureSimulator.simulateOvercurrent(stressData.nodeId, stressData.stress / 1e6, 1);
      }
    });

    // Update vibration stress from dynamic analysis
    if (mechanicalResult.naturalFrequencies) {
      mechanicalResult.naturalFrequencies.forEach((freq: number, index: number) => {
        if (freq < 100) { // Low frequency vibration
          // Apply vibration stress to all components
          this.failureSimulator.updateStressFactor('system', 'vibration', freq / 100);
        }
      });
    }
  }

  // Component Management
  addPhysicsComponent(
    id: string,
    position: THREE.Vector3,
    rotation: THREE.Quaternion,
    properties: any,
    geometry: THREE.BufferGeometry
  ): void {
    this.physicsSimulator.createRigidBody(id, position, rotation, properties, geometry);
    
    // Add corresponding components to other simulators
    this.thermalSimulator.addThermalNode(id, position, properties.mass, properties.material || 'steel');
    this.failureSimulator.addComponent(id, properties.componentType || 'mechanical');
  }

  addElectricalComponent(
    id: string,
    type: string,
    value: number,
    nodeA: string,
    nodeB: string,
    position: THREE.Vector3,
    properties: any = {}
  ): void {
    switch (type) {
      case 'resistor':
        this.electricalSimulator.addResistor(id, value, properties.tolerance || 0.05, nodeA, nodeB, position);
        break;
      case 'capacitor':
        this.electricalSimulator.addCapacitor(id, value, properties.voltage || 25, nodeA, nodeB, position);
        break;
      case 'inductor':
        this.electricalSimulator.addInductor(id, value, properties.current || 10, nodeA, nodeB, position);
        break;
      case 'voltage_source':
        this.electricalSimulator.addVoltageSource(id, value, nodeA, nodeB, position);
        break;
    }

    // Add to failure simulator
    this.failureSimulator.addComponent(id, type);
    this.failureSimulator.updateStressFactor(id, 'rated_voltage', properties.ratedVoltage || 12);
    this.failureSimulator.updateStressFactor(id, 'rated_current', properties.ratedCurrent || 1);
  }

  // Scenario Management
  runScenario(scenarioName: string, parameters: any): void {
    switch (scenarioName) {
      case 'overvoltage_test':
        this.runOvervoltageScenario(parameters);
        break;
      case 'thermal_cycling':
        this.runThermalCyclingScenario(parameters);
        break;
      case 'vibration_test':
        this.runVibrationTestScenario(parameters);
        break;
      case 'accelerated_aging':
        this.runAcceleratedAgingScenario(parameters);
        break;
    }
  }

  private runOvervoltageScenario(parameters: any): void {
    const { voltage, duration, componentId } = parameters;
    
    setTimeout(() => {
      this.failureSimulator.simulateOvervoltage(componentId, voltage, duration);
    }, 1000); // Start after 1 second
  }

  private runThermalCyclingScenario(parameters: any): void {
    const { minTemp, maxTemp, cycleTime, cycles } = parameters;
    
    let currentCycle = 0;
    const cycleInterval = setInterval(() => {
      if (currentCycle >= cycles) {
        clearInterval(cycleInterval);
        return;
      }

      // Heat up phase
      setTimeout(() => {
        this.thermalSimulator.setAmbientTemperature(maxTemp);
      }, 0);

      // Cool down phase
      setTimeout(() => {
        this.thermalSimulator.setAmbientTemperature(minTemp);
      }, cycleTime / 2);

      currentCycle++;
    }, cycleTime);
  }

  private runVibrationTestScenario(parameters: any): void {
    const { frequency, amplitude, duration } = parameters;
    
    // Apply vibration loads to all components
    const vibrationForce = amplitude * Math.pow(2 * Math.PI * frequency, 2);
    
    const endTime = this.state.currentTime + duration;
    const vibrationInterval = setInterval(() => {
      if (this.state.currentTime > endTime) {
        clearInterval(vibrationInterval);
        return;
      }

      // Apply sinusoidal vibration
      const force = vibrationForce * Math.sin(2 * Math.PI * frequency * this.state.currentTime);
      
      // Apply to all mechanical components
      this.mechanicalSimulator.addLoadCase(
        'vibration_test',
        'force',
        force,
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 0, 0)
      );
    }, 16); // ~60 FPS
  }

  private runAcceleratedAgingScenario(parameters: any): void {
    const { accelerationFactor, duration } = parameters;
    
    // Increase degradation rates
    this.config.failure.accelerationFactor = accelerationFactor;
    
    setTimeout(() => {
      this.config.failure.accelerationFactor = 1; // Reset to normal
    }, duration * 1000);
  }

  // Data Export and Analysis
  exportResults(format: 'json' | 'csv' | 'matlab'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.results, null, 2);
      
      case 'csv':
        return this.convertResultsToCSV();
      
      case 'matlab':
        return this.convertResultsToMatlab();
      
      default:
        return JSON.stringify(this.results);
    }
  }

  private convertResultsToCSV(): string {
    const headers = [
      'timestamp',
      'max_stress',
      'max_temperature',
      'total_power',
      'system_reliability'
    ];

    const rows = this.results.map(result => [
      result.timestamp,
      result.mechanical?.maxStress || 0,
      result.thermal?.maxTemperature || 0,
      result.electrical?.totalPower || 0,
      result.failure?.systemReliability || 1
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertResultsToMatlab(): string {
    let matlabCode = '% Simulation Results\n';
    matlabCode += 'clear; clc;\n\n';
    
    // Time vector
    const timeData = this.results.map(r => r.timestamp);
    matlabCode += `time = [${timeData.join(', ')}];\n`;
    
    // Stress data
    const stressData = this.results.map(r => r.mechanical?.maxStress || 0);
    matlabCode += `stress = [${stressData.join(', ')}];\n`;
    
    // Temperature data
    const tempData = this.results.map(r => r.thermal?.maxTemperature || 0);
    matlabCode += `temperature = [${tempData.join(', ')}];\n`;
    
    // Plotting commands
    matlabCode += '\n% Plotting\n';
    matlabCode += 'figure;\n';
    matlabCode += 'subplot(2,1,1);\n';
    matlabCode += 'plot(time, stress);\n';
    matlabCode += 'xlabel(\'Time (s)\');\n';
    matlabCode += 'ylabel(\'Max Stress (Pa)\');\n';
    matlabCode += 'title(\'Stress vs Time\');\n';
    matlabCode += 'subplot(2,1,2);\n';
    matlabCode += 'plot(time, temperature);\n';
    matlabCode += 'xlabel(\'Time (s)\');\n';
    matlabCode += 'ylabel(\'Max Temperature (°C)\');\n';
    matlabCode += 'title(\'Temperature vs Time\');\n';
    
    return matlabCode;
  }

  // Getters
  getState(): SimulationState {
    return this.state;
  }

  getConfig(): SimulationConfig {
    return this.config;
  }

  getResults(): CoupledResults[] {
    return this.results;
  }

  getLatestResults(): CoupledResults | null {
    return this.results.length > 0 ? this.results[this.results.length - 1] : null;
  }

  // Configuration Updates
  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.thermal?.ambientTemperature !== undefined) {
      this.thermalSimulator.setAmbientTemperature(newConfig.thermal.ambientTemperature);
    }
  }
}