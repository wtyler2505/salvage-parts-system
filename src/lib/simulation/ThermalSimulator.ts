import * as THREE from 'three';

export interface ThermalProperties {
  thermalConductivity: number; // W/mK
  heatCapacity: number; // J/kgK
  density: number; // kg/m³
  emissivity: number; // 0-1
  absorptivity: number; // 0-1
  convectionCoefficient: number; // W/m²K
}

export interface HeatSource {
  id: string;
  position: THREE.Vector3;
  power: number; // Watts
  type: 'point' | 'surface' | 'volume';
  geometry?: THREE.BufferGeometry;
  temperature: number;
}

export interface ThermalNode {
  id: string;
  position: THREE.Vector3;
  temperature: number;
  mass: number;
  heatCapacity: number;
  connections: ThermalConnection[];
}

export interface ThermalConnection {
  nodeA: string;
  nodeB: string;
  conductance: number; // W/K
  type: 'conduction' | 'convection' | 'radiation';
}

export interface ThermalState {
  nodeTemperatures: Map<string, number>;
  heatFlows: Map<string, number>;
  totalHeatGeneration: number;
  averageTemperature: number;
  maxTemperature: number;
  thermalStresses: Map<string, number>;
}

export class ThermalSimulator {
  private nodes: Map<string, ThermalNode> = new Map();
  private heatSources: Map<string, HeatSource> = new Map();
  private connections: Map<string, ThermalConnection> = new Map();
  private materials: Map<string, ThermalProperties> = new Map();
  private state: ThermalState;
  private ambientTemperature = 20; // °C
  private timeStep = 0.01; // seconds

  constructor() {
    this.state = {
      nodeTemperatures: new Map(),
      heatFlows: new Map(),
      totalHeatGeneration: 0,
      averageTemperature: 0,
      maxTemperature: 0,
      thermalStresses: new Map()
    };

    this.initializeMaterials();
  }

  private initializeMaterials(): void {
    // Common materials database
    this.materials.set('aluminum', {
      thermalConductivity: 237,
      heatCapacity: 900,
      density: 2700,
      emissivity: 0.05,
      absorptivity: 0.05,
      convectionCoefficient: 25
    });

    this.materials.set('copper', {
      thermalConductivity: 401,
      heatCapacity: 385,
      density: 8960,
      emissivity: 0.04,
      absorptivity: 0.04,
      convectionCoefficient: 25
    });

    this.materials.set('steel', {
      thermalConductivity: 50,
      heatCapacity: 500,
      density: 7850,
      emissivity: 0.8,
      absorptivity: 0.8,
      convectionCoefficient: 20
    });

    this.materials.set('plastic', {
      thermalConductivity: 0.2,
      heatCapacity: 1500,
      density: 1200,
      emissivity: 0.9,
      absorptivity: 0.9,
      convectionCoefficient: 10
    });

    this.materials.set('silicon', {
      thermalConductivity: 148,
      heatCapacity: 700,
      density: 2330,
      emissivity: 0.6,
      absorptivity: 0.6,
      convectionCoefficient: 15
    });
  }

  // Node Management
  addThermalNode(
    id: string,
    position: THREE.Vector3,
    mass: number,
    material: string,
    initialTemperature: number = 20
  ): ThermalNode {
    const materialProps = this.materials.get(material) || this.materials.get('steel')!;
    
    const node: ThermalNode = {
      id,
      position,
      temperature: initialTemperature,
      mass,
      heatCapacity: materialProps.heatCapacity,
      connections: []
    };

    this.nodes.set(id, node);
    this.state.nodeTemperatures.set(id, initialTemperature);
    return node;
  }

  // Heat Source Management
  addHeatSource(
    id: string,
    position: THREE.Vector3,
    power: number,
    type: 'point' | 'surface' | 'volume' = 'point',
    geometry?: THREE.BufferGeometry
  ): HeatSource {
    const heatSource: HeatSource = {
      id,
      position,
      power,
      type,
      geometry,
      temperature: this.ambientTemperature
    };

    this.heatSources.set(id, heatSource);
    return heatSource;
  }

  // Connection Management
  addThermalConnection(
    nodeA: string,
    nodeB: string,
    material: string,
    crossSectionArea: number,
    length: number,
    type: 'conduction' | 'convection' | 'radiation' = 'conduction'
  ): ThermalConnection {
    const materialProps = this.materials.get(material) || this.materials.get('steel')!;
    
    let conductance: number;
    
    switch (type) {
      case 'conduction':
        conductance = (materialProps.thermalConductivity * crossSectionArea) / length;
        break;
      case 'convection':
        conductance = materialProps.convectionCoefficient * crossSectionArea;
        break;
      case 'radiation':
        // Stefan-Boltzmann law approximation
        const avgTemp = (this.state.nodeTemperatures.get(nodeA)! + this.state.nodeTemperatures.get(nodeB)!) / 2 + 273.15;
        const stefanBoltzmann = 5.67e-8;
        conductance = 4 * materialProps.emissivity * stefanBoltzmann * Math.pow(avgTemp, 3) * crossSectionArea;
        break;
      default:
        conductance = 1;
    }

    const connection: ThermalConnection = {
      nodeA,
      nodeB,
      conductance,
      type
    };

    const connectionId = `${nodeA}-${nodeB}`;
    this.connections.set(connectionId, connection);

    // Add to node connections
    const nodeAObj = this.nodes.get(nodeA);
    const nodeBObj = this.nodes.get(nodeB);
    if (nodeAObj) nodeAObj.connections.push(connection);
    if (nodeBObj) nodeBObj.connections.push(connection);

    return connection;
  }

  // Heat Generation from Electrical Components
  addElectricalHeatGeneration(componentId: string, power: number, position: THREE.Vector3): void {
    this.addHeatSource(`electrical_${componentId}`, position, power, 'point');
  }

  // Simulation Step
  step(deltaTime: number): void {
    this.timeStep = deltaTime;
    
    // Calculate heat flows
    this.calculateHeatFlows();
    
    // Update node temperatures
    this.updateNodeTemperatures();
    
    // Update heat source temperatures
    this.updateHeatSourceTemperatures();
    
    // Calculate thermal stresses
    this.calculateThermalStresses();
    
    // Update state metrics
    this.updateStateMetrics();
  }

  private calculateHeatFlows(): void {
    this.state.heatFlows.clear();

    // Heat flow through connections
    this.connections.forEach((connection, connectionId) => {
      const tempA = this.state.nodeTemperatures.get(connection.nodeA) || this.ambientTemperature;
      const tempB = this.state.nodeTemperatures.get(connection.nodeB) || this.ambientTemperature;
      
      let heatFlow: number;
      
      switch (connection.type) {
        case 'conduction':
          heatFlow = connection.conductance * (tempA - tempB);
          break;
        case 'convection':
          heatFlow = connection.conductance * (tempA - this.ambientTemperature);
          break;
        case 'radiation':
          const tempAK = tempA + 273.15;
          const tempBK = tempB + 273.15;
          heatFlow = connection.conductance * (Math.pow(tempAK, 4) - Math.pow(tempBK, 4));
          break;
        default:
          heatFlow = 0;
      }
      
      this.state.heatFlows.set(connectionId, heatFlow);
    });

    // Heat generation from sources
    this.heatSources.forEach(source => {
      this.state.heatFlows.set(`source_${source.id}`, source.power);
    });
  }

  private updateNodeTemperatures(): void {
    const newTemperatures = new Map<string, number>();

    this.nodes.forEach(node => {
      let netHeatFlow = 0;

      // Heat from sources
      this.heatSources.forEach(source => {
        const distance = node.position.distanceTo(source.position);
        if (distance < 1.0) { // Heat source affects nearby nodes
          const influence = Math.exp(-distance); // Exponential decay
          netHeatFlow += source.power * influence;
        }
      });

      // Heat from connections
      node.connections.forEach(connection => {
        const connectionId = `${connection.nodeA}-${connection.nodeB}`;
        const heatFlow = this.state.heatFlows.get(connectionId) || 0;
        
        if (connection.nodeA === node.id) {
          netHeatFlow -= heatFlow; // Heat leaving node A
        } else if (connection.nodeB === node.id) {
          netHeatFlow += heatFlow; // Heat entering node B
        }
      });

      // Convection to ambient
      const currentTemp = this.state.nodeTemperatures.get(node.id) || this.ambientTemperature;
      const convectionLoss = 10 * (currentTemp - this.ambientTemperature); // Simplified convection
      netHeatFlow -= convectionLoss;

      // Temperature change: dT/dt = Q / (m * c)
      const thermalMass = node.mass * node.heatCapacity;
      const tempChange = (netHeatFlow * this.timeStep) / thermalMass;
      const newTemp = currentTemp + tempChange;

      newTemperatures.set(node.id, newTemp);
    });

    // Update temperatures
    newTemperatures.forEach((temp, nodeId) => {
      this.state.nodeTemperatures.set(nodeId, temp);
      const node = this.nodes.get(nodeId);
      if (node) {
        node.temperature = temp;
      }
    });
  }

  private updateHeatSourceTemperatures(): void {
    this.heatSources.forEach(source => {
      // Find nearest node and use its temperature
      let nearestTemp = this.ambientTemperature;
      let minDistance = Infinity;

      this.nodes.forEach(node => {
        const distance = source.position.distanceTo(node.position);
        if (distance < minDistance) {
          minDistance = distance;
          nearestTemp = node.temperature;
        }
      });

      source.temperature = nearestTemp;
    });
  }

  private calculateThermalStresses(): void {
    this.state.thermalStresses.clear();

    this.nodes.forEach(node => {
      const tempDiff = node.temperature - this.ambientTemperature;
      
      // Simplified thermal stress calculation
      // σ = E * α * ΔT (where E = Young's modulus, α = thermal expansion coefficient)
      const thermalExpansionCoeff = 12e-6; // Typical for steel (1/K)
      const youngsModulus = 200e9; // Pa for steel
      const thermalStress = youngsModulus * thermalExpansionCoeff * tempDiff;
      
      this.state.thermalStresses.set(node.id, Math.abs(thermalStress));
    });
  }

  private updateStateMetrics(): void {
    const temperatures = Array.from(this.state.nodeTemperatures.values());
    
    this.state.totalHeatGeneration = Array.from(this.heatSources.values())
      .reduce((sum, source) => sum + source.power, 0);
    
    this.state.averageTemperature = temperatures.length > 0 
      ? temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length 
      : this.ambientTemperature;
    
    this.state.maxTemperature = temperatures.length > 0 
      ? Math.max(...temperatures) 
      : this.ambientTemperature;
  }

  // Visualization Methods
  getTemperatureGradient(): TemperatureGradientData[] {
    const gradientData: TemperatureGradientData[] = [];

    this.nodes.forEach(node => {
      gradientData.push({
        nodeId: node.id,
        position: node.position,
        temperature: node.temperature,
        color: this.temperatureToColor(node.temperature)
      });
    });

    return gradientData;
  }

  getHeatFlowVisualization(): HeatFlowVisualizationData[] {
    const flowData: HeatFlowVisualizationData[] = [];

    this.connections.forEach((connection, connectionId) => {
      const heatFlow = this.state.heatFlows.get(connectionId) || 0;
      const nodeA = this.nodes.get(connection.nodeA);
      const nodeB = this.nodes.get(connection.nodeB);

      if (nodeA && nodeB && Math.abs(heatFlow) > 0.1) {
        flowData.push({
          connectionId,
          startPosition: nodeA.position,
          endPosition: nodeB.position,
          heatFlow,
          intensity: Math.abs(heatFlow) / 100, // Normalize for visualization
          color: heatFlow > 0 ? new THREE.Color(1, 0, 0) : new THREE.Color(0, 0, 1)
        });
      }
    });

    return flowData;
  }

  getThermalStressVisualization(): ThermalStressVisualizationData[] {
    const stressData: ThermalStressVisualizationData[] = [];

    this.state.thermalStresses.forEach((stress, nodeId) => {
      const node = this.nodes.get(nodeId);
      if (node && stress > 1e6) { // Only show significant stresses (> 1 MPa)
        stressData.push({
          nodeId,
          position: node.position,
          stress,
          color: this.stressToColor(stress),
          intensity: Math.min(stress / 100e6, 1) // Normalize to 100 MPa max
        });
      }
    });

    return stressData;
  }

  private temperatureToColor(temperature: number): THREE.Color {
    // Map temperature to color (blue = cold, red = hot)
    const minTemp = 0;
    const maxTemp = 100;
    const normalized = Math.max(0, Math.min(1, (temperature - minTemp) / (maxTemp - minTemp)));
    
    if (normalized < 0.5) {
      // Blue to green
      return new THREE.Color(0, normalized * 2, 1 - normalized * 2);
    } else {
      // Green to red
      return new THREE.Color((normalized - 0.5) * 2, 1 - (normalized - 0.5) * 2, 0);
    }
  }

  private stressToColor(stress: number): THREE.Color {
    // Map stress to color (green = low, red = high)
    const maxStress = 100e6; // 100 MPa
    const normalized = Math.min(stress / maxStress, 1);
    return new THREE.Color(normalized, 1 - normalized, 0);
  }

  // Getters
  getState(): ThermalState {
    return this.state;
  }

  getNode(id: string): ThermalNode | undefined {
    return this.nodes.get(id);
  }

  getHeatSource(id: string): HeatSource | undefined {
    return this.heatSources.get(id);
  }

  setAmbientTemperature(temperature: number): void {
    this.ambientTemperature = temperature;
  }
}

// Supporting Interfaces
interface TemperatureGradientData {
  nodeId: string;
  position: THREE.Vector3;
  temperature: number;
  color: THREE.Color;
}

interface HeatFlowVisualizationData {
  connectionId: string;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  heatFlow: number;
  intensity: number;
  color: THREE.Color;
}

interface ThermalStressVisualizationData {
  nodeId: string;
  position: THREE.Vector3;
  stress: number;
  color: THREE.Color;
  intensity: number;
}