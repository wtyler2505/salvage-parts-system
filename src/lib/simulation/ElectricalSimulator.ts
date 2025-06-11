import * as THREE from 'three';

export interface Component {
  id: string;
  type: 'resistor' | 'capacitor' | 'inductor' | 'voltage_source' | 'current_source' | 'diode' | 'transistor';
  value: number;
  tolerance?: number;
  nodes: [string, string]; // Connected nodes
  position: THREE.Vector3;
  properties: Record<string, any>;
}

export interface Connection {
  id: string;
  nodeA: string;
  nodeB: string;
  resistance: number; // Wire resistance
}

export interface CircuitNode {
  id: string;
  voltage: number;
  position: THREE.Vector3;
  connections: string[];
}

export interface ElectricalState {
  nodeVoltages: Map<string, number>;
  componentCurrents: Map<string, number>;
  componentPowers: Map<string, number>;
  totalPower: number;
  efficiency: number;
}

export class ElectricalSimulator {
  private components: Map<string, Component> = new Map();
  private connections: Map<string, Connection> = new Map();
  private nodes: Map<string, CircuitNode> = new Map();
  private state: ElectricalState;
  private animationData: Map<string, ElectronFlow> = new Map();

  constructor() {
    this.state = {
      nodeVoltages: new Map(),
      componentCurrents: new Map(),
      componentPowers: new Map(),
      totalPower: 0,
      efficiency: 0
    };
  }

  // Component Creation Methods
  addResistor(id: string, value: number, tolerance: number, nodeA: string, nodeB: string, position: THREE.Vector3): Component {
    const component: Component = {
      id,
      type: 'resistor',
      value,
      tolerance,
      nodes: [nodeA, nodeB],
      position,
      properties: { tolerance }
    };
    this.components.set(id, component);
    return component;
  }

  addCapacitor(id: string, value: number, voltage: number, nodeA: string, nodeB: string, position: THREE.Vector3): Component {
    const component: Component = {
      id,
      type: 'capacitor',
      value,
      nodes: [nodeA, nodeB],
      position,
      properties: { maxVoltage: voltage, charge: 0, energy: 0 }
    };
    this.components.set(id, component);
    return component;
  }

  addInductor(id: string, value: number, current: number, nodeA: string, nodeB: string, position: THREE.Vector3): Component {
    const component: Component = {
      id,
      type: 'inductor',
      value,
      nodes: [nodeA, nodeB],
      position,
      properties: { maxCurrent: current, flux: 0, energy: 0 }
    };
    this.components.set(id, component);
    return component;
  }

  addVoltageSource(id: string, voltage: number, nodeA: string, nodeB: string, position: THREE.Vector3): Component {
    const component: Component = {
      id,
      type: 'voltage_source',
      value: voltage,
      nodes: [nodeA, nodeB],
      position,
      properties: { internalResistance: 0.01 }
    };
    this.components.set(id, component);
    return component;
  }

  addSemiconductor(id: string, type: string, params: any, nodeA: string, nodeB: string, position: THREE.Vector3): Component {
    const component: Component = {
      id,
      type: type as any,
      value: 0,
      nodes: [nodeA, nodeB],
      position,
      properties: { ...params, operatingPoint: { voltage: 0, current: 0 } }
    };
    this.components.set(id, component);
    return component;
  }

  // Circuit Analysis using Modified Nodal Analysis (MNA)
  solveCircuit(): ElectricalState {
    const nodeList = Array.from(this.nodes.keys()).filter(node => node !== 'ground');
    const voltageSourceList = Array.from(this.components.values()).filter(comp => comp.type === 'voltage_source');
    
    const n = nodeList.length;
    const m = voltageSourceList.length;
    const matrixSize = n + m;

    // Create admittance matrix [G] and current vector [I]
    const G = this.createMatrix(matrixSize, matrixSize);
    const I = new Array(matrixSize).fill(0);

    // Fill conductance matrix
    this.components.forEach(component => {
      this.addComponentToMatrix(component, G, I, nodeList);
    });

    // Add voltage source constraints
    voltageSourceList.forEach((source, index) => {
      const nodeAIndex = nodeList.indexOf(source.nodes[0]);
      const nodeBIndex = nodeList.indexOf(source.nodes[1]);
      
      if (nodeAIndex >= 0) {
        G[nodeAIndex][n + index] = 1;
        G[n + index][nodeAIndex] = 1;
      }
      if (nodeBIndex >= 0) {
        G[nodeBIndex][n + index] = -1;
        G[n + index][nodeBIndex] = -1;
      }
      
      I[n + index] = source.value;
    });

    // Solve [G][V] = [I] using Gaussian elimination
    const solution = this.gaussianElimination(G, I);

    // Extract node voltages and branch currents
    this.state.nodeVoltages.clear();
    this.state.componentCurrents.clear();
    this.state.componentPowers.clear();

    // Set ground voltage
    this.state.nodeVoltages.set('ground', 0);

    // Set node voltages
    nodeList.forEach((node, index) => {
      this.state.nodeVoltages.set(node, solution[index]);
      if (this.nodes.has(node)) {
        this.nodes.get(node)!.voltage = solution[index];
      }
    });

    // Calculate component currents and powers
    this.components.forEach(component => {
      const current = this.calculateComponentCurrent(component);
      const power = this.calculateComponentPower(component, current);
      
      this.state.componentCurrents.set(component.id, current);
      this.state.componentPowers.set(component.id, power);
    });

    // Calculate total power and efficiency
    this.calculateSystemMetrics();

    return this.state;
  }

  private createMatrix(rows: number, cols: number): number[][] {
    return Array(rows).fill(null).map(() => Array(cols).fill(0));
  }

  private addComponentToMatrix(component: Component, G: number[][], I: number[], nodeList: string[]): void {
    const nodeAIndex = nodeList.indexOf(component.nodes[0]);
    const nodeBIndex = nodeList.indexOf(component.nodes[1]);

    switch (component.type) {
      case 'resistor':
        const conductance = 1 / component.value;
        if (nodeAIndex >= 0) {
          G[nodeAIndex][nodeAIndex] += conductance;
          if (nodeBIndex >= 0) {
            G[nodeAIndex][nodeBIndex] -= conductance;
          }
        }
        if (nodeBIndex >= 0) {
          G[nodeBIndex][nodeBIndex] += conductance;
          if (nodeAIndex >= 0) {
            G[nodeBIndex][nodeAIndex] -= conductance;
          }
        }
        break;

      case 'current_source':
        if (nodeAIndex >= 0) {
          I[nodeAIndex] += component.value;
        }
        if (nodeBIndex >= 0) {
          I[nodeBIndex] -= component.value;
        }
        break;

      case 'capacitor':
        // For DC analysis, capacitors are open circuits
        // For AC analysis, use impedance Z = 1/(jωC)
        break;

      case 'inductor':
        // For DC analysis, inductors are short circuits
        // For AC analysis, use impedance Z = jωL
        break;
    }
  }

  private gaussianElimination(matrix: number[][], vector: number[]): number[] {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [...row, vector[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      // Find pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }

      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Make all rows below this one 0 in current column
      for (let k = i + 1; k < n; k++) {
        const factor = augmented[k][i] / augmented[i][i];
        for (let j = i; j <= n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }

    // Back substitution
    const solution = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      solution[i] = augmented[i][n];
      for (let j = i + 1; j < n; j++) {
        solution[i] -= augmented[i][j] * solution[j];
      }
      solution[i] /= augmented[i][i];
    }

    return solution;
  }

  private calculateComponentCurrent(component: Component): number {
    const voltageA = this.state.nodeVoltages.get(component.nodes[0]) || 0;
    const voltageB = this.state.nodeVoltages.get(component.nodes[1]) || 0;
    const voltageDiff = voltageA - voltageB;

    switch (component.type) {
      case 'resistor':
        return voltageDiff / component.value;
      
      case 'voltage_source':
        // Current through voltage source needs to be calculated from circuit solution
        return 0; // Placeholder
      
      case 'capacitor':
        // I = C * dV/dt (for transient analysis)
        return 0; // Placeholder for DC analysis
      
      case 'inductor':
        // V = L * dI/dt (for transient analysis)
        return voltageDiff / 0.001; // Small resistance for DC analysis
      
      default:
        return 0;
    }
  }

  private calculateComponentPower(component: Component, current: number): number {
    const voltageA = this.state.nodeVoltages.get(component.nodes[0]) || 0;
    const voltageB = this.state.nodeVoltages.get(component.nodes[1]) || 0;
    const voltage = Math.abs(voltageA - voltageB);

    return voltage * Math.abs(current);
  }

  private calculateSystemMetrics(): void {
    this.state.totalPower = Array.from(this.state.componentPowers.values()).reduce((sum, power) => sum + power, 0);
    
    // Calculate efficiency (simplified)
    const sourcePower = Array.from(this.components.values())
      .filter(comp => comp.type === 'voltage_source')
      .reduce((sum, source) => {
        const current = this.state.componentCurrents.get(source.id) || 0;
        return sum + source.value * Math.abs(current);
      }, 0);
    
    this.state.efficiency = sourcePower > 0 ? (this.state.totalPower / sourcePower) * 100 : 0;
  }

  // Visualization Methods
  showCurrentFlow(animated: boolean = true): ElectronFlowData[] {
    const flowData: ElectronFlowData[] = [];

    this.components.forEach(component => {
      const current = this.state.componentCurrents.get(component.id) || 0;
      if (Math.abs(current) > 0.001) { // Only show significant currents
        const flow: ElectronFlowData = {
          componentId: component.id,
          current,
          direction: current > 0 ? 1 : -1,
          speed: Math.abs(current) * 10, // Scale for visualization
          particles: this.generateElectronParticles(component, current)
        };
        flowData.push(flow);
      }
    });

    return flowData;
  }

  showVoltageGradient(): VoltageGradientData[] {
    const gradientData: VoltageGradientData[] = [];

    this.nodes.forEach(node => {
      const voltage = this.state.nodeVoltages.get(node.id) || 0;
      gradientData.push({
        nodeId: node.id,
        voltage,
        position: node.position,
        color: this.voltageToColor(voltage)
      });
    });

    return gradientData;
  }

  showPowerDissipation(): PowerDissipationData[] {
    const powerData: PowerDissipationData[] = [];

    this.components.forEach(component => {
      const power = this.state.componentPowers.get(component.id) || 0;
      if (power > 0.001) {
        powerData.push({
          componentId: component.id,
          power,
          position: component.position,
          heatIntensity: power / 10, // Scale for visualization
          color: this.powerToColor(power)
        });
      }
    });

    return powerData;
  }

  showMagneticFields(): MagneticFieldData[] {
    const fieldData: MagneticFieldData[] = [];

    this.components.forEach(component => {
      if (component.type === 'inductor') {
        const current = this.state.componentCurrents.get(component.id) || 0;
        const fieldStrength = Math.abs(current) * component.value;
        
        fieldData.push({
          componentId: component.id,
          fieldStrength,
          position: component.position,
          fieldLines: this.generateMagneticFieldLines(component.position, fieldStrength)
        });
      }
    });

    return fieldData;
  }

  private generateElectronParticles(component: Component, current: number): ElectronParticle[] {
    const particles: ElectronParticle[] = [];
    const particleCount = Math.min(Math.abs(current) * 100, 50);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        position: component.position.clone(),
        velocity: new THREE.Vector3(current > 0 ? 1 : -1, 0, 0),
        life: Math.random() * 2 + 1
      });
    }

    return particles;
  }

  private voltageToColor(voltage: number): THREE.Color {
    // Map voltage to color (blue = negative, red = positive)
    const normalized = Math.max(-1, Math.min(1, voltage / 12)); // Normalize to ±12V
    if (normalized >= 0) {
      return new THREE.Color(normalized, 0, 0); // Red for positive
    } else {
      return new THREE.Color(0, 0, -normalized); // Blue for negative
    }
  }

  private powerToColor(power: number): THREE.Color {
    // Map power to heat color (black -> red -> yellow -> white)
    const normalized = Math.min(1, power / 100); // Normalize to 100W max
    return new THREE.Color(normalized, normalized * 0.5, 0);
  }

  private generateMagneticFieldLines(center: THREE.Vector3, strength: number): THREE.Vector3[] {
    const fieldLines: THREE.Vector3[] = [];
    const radius = strength * 2;

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      for (let r = 0.1; r < radius; r += 0.1) {
        fieldLines.push(new THREE.Vector3(
          center.x + Math.cos(angle) * r,
          center.y + Math.sin(angle) * r,
          center.z
        ));
      }
    }

    return fieldLines;
  }

  // Getters
  getState(): ElectricalState {
    return this.state;
  }

  getComponent(id: string): Component | undefined {
    return this.components.get(id);
  }

  getNode(id: string): CircuitNode | undefined {
    return this.nodes.get(id);
  }
}

// Supporting Interfaces
interface ElectronFlow {
  componentId: string;
  particles: ElectronParticle[];
  speed: number;
}

interface ElectronParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

interface ElectronFlowData {
  componentId: string;
  current: number;
  direction: number;
  speed: number;
  particles: ElectronParticle[];
}

interface VoltageGradientData {
  nodeId: string;
  voltage: number;
  position: THREE.Vector3;
  color: THREE.Color;
}

interface PowerDissipationData {
  componentId: string;
  power: number;
  position: THREE.Vector3;
  heatIntensity: number;
  color: THREE.Color;
}

interface MagneticFieldData {
  componentId: string;
  fieldStrength: number;
  position: THREE.Vector3;
  fieldLines: THREE.Vector3[];
}