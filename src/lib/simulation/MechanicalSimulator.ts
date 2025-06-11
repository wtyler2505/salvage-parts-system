import * as THREE from 'three';

export interface MechanicalProperties {
  youngsModulus: number; // Pa
  poissonsRatio: number;
  density: number; // kg/m³
  yieldStrength: number; // Pa
  ultimateStrength: number; // Pa
  fatigueLimit: number; // Pa
  hardness: number; // HV
}

export interface LoadCase {
  id: string;
  type: 'force' | 'pressure' | 'displacement' | 'acceleration';
  magnitude: number;
  direction: THREE.Vector3;
  position: THREE.Vector3;
  area?: number; // For pressure loads
}

export interface Constraint {
  id: string;
  type: 'fixed' | 'pinned' | 'roller' | 'spring';
  position: THREE.Vector3;
  direction?: THREE.Vector3;
  stiffness?: number; // For spring constraints
}

export interface MeshElement {
  id: string;
  nodes: string[];
  type: 'tetrahedron' | 'hexahedron' | 'triangle' | 'quad';
  material: string;
  volume: number;
}

export interface MeshNode {
  id: string;
  position: THREE.Vector3;
  displacement: THREE.Vector3;
  stress: THREE.Vector3;
  strain: THREE.Vector3;
}

export interface AnalysisResult {
  maxStress: number;
  maxDisplacement: number;
  safetyFactor: number;
  fatigueLife: number;
  naturalFrequencies: number[];
  modeShapes: Array<{ frequency: number; shape: THREE.Vector3[] }>;
}

export class MechanicalSimulator {
  private materials: Map<string, MechanicalProperties> = new Map();
  private nodes: Map<string, MeshNode> = new Map();
  private elements: Map<string, MeshElement> = new Map();
  private loadCases: Map<string, LoadCase> = new Map();
  private constraints: Map<string, Constraint> = new Map();
  private analysisResults: Map<string, AnalysisResult> = new Map();

  constructor() {
    this.initializeMaterials();
  }

  private initializeMaterials(): void {
    // Common engineering materials
    this.materials.set('steel', {
      youngsModulus: 200e9,
      poissonsRatio: 0.3,
      density: 7850,
      yieldStrength: 250e6,
      ultimateStrength: 400e6,
      fatigueLimit: 200e6,
      hardness: 200
    });

    this.materials.set('aluminum', {
      youngsModulus: 70e9,
      poissonsRatio: 0.33,
      density: 2700,
      yieldStrength: 276e6,
      ultimateStrength: 310e6,
      fatigueLimit: 130e6,
      hardness: 95
    });

    this.materials.set('titanium', {
      youngsModulus: 116e9,
      poissonsRatio: 0.32,
      density: 4500,
      yieldStrength: 880e6,
      ultimateStrength: 950e6,
      fatigueLimit: 500e6,
      hardness: 334
    });

    this.materials.set('plastic_abs', {
      youngsModulus: 2.3e9,
      poissonsRatio: 0.35,
      density: 1050,
      yieldStrength: 40e6,
      ultimateStrength: 45e6,
      fatigueLimit: 20e6,
      hardness: 20
    });
  }

  // Mesh Generation
  generateMesh(geometry: THREE.BufferGeometry, material: string, elementSize: number = 0.1): void {
    const vertices = geometry.attributes.position.array;
    const indices = geometry.index?.array;

    if (!indices) {
      console.error('Geometry must have indices for mesh generation');
      return;
    }

    // Create nodes from vertices
    for (let i = 0; i < vertices.length; i += 3) {
      const nodeId = `node_${i / 3}`;
      const node: MeshNode = {
        id: nodeId,
        position: new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]),
        displacement: new THREE.Vector3(0, 0, 0),
        stress: new THREE.Vector3(0, 0, 0),
        strain: new THREE.Vector3(0, 0, 0)
      };
      this.nodes.set(nodeId, node);
    }

    // Create elements from faces
    for (let i = 0; i < indices.length; i += 3) {
      const elementId = `element_${i / 3}`;
      const nodeIds = [
        `node_${indices[i]}`,
        `node_${indices[i + 1]}`,
        `node_${indices[i + 2]}`
      ];

      const element: MeshElement = {
        id: elementId,
        nodes: nodeIds,
        type: 'triangle',
        material,
        volume: this.calculateElementVolume(nodeIds)
      };
      this.elements.set(elementId, element);
    }
  }

  private calculateElementVolume(nodeIds: string[]): number {
    if (nodeIds.length === 3) {
      // Triangle area calculation
      const node1 = this.nodes.get(nodeIds[0])!;
      const node2 = this.nodes.get(nodeIds[1])!;
      const node3 = this.nodes.get(nodeIds[2])!;

      const v1 = node2.position.clone().sub(node1.position);
      const v2 = node3.position.clone().sub(node1.position);
      const area = v1.cross(v2).length() / 2;
      
      return area * 0.001; // Assume 1mm thickness for 2D elements
    }
    return 0;
  }

  // Load and Constraint Management
  addLoadCase(
    id: string,
    type: 'force' | 'pressure' | 'displacement' | 'acceleration',
    magnitude: number,
    direction: THREE.Vector3,
    position: THREE.Vector3,
    area?: number
  ): LoadCase {
    const loadCase: LoadCase = {
      id,
      type,
      magnitude,
      direction: direction.normalize(),
      position,
      area
    };
    this.loadCases.set(id, loadCase);
    return loadCase;
  }

  addConstraint(
    id: string,
    type: 'fixed' | 'pinned' | 'roller' | 'spring',
    position: THREE.Vector3,
    direction?: THREE.Vector3,
    stiffness?: number
  ): Constraint {
    const constraint: Constraint = {
      id,
      type,
      position,
      direction,
      stiffness
    };
    this.constraints.set(id, constraint);
    return constraint;
  }

  // Stress Analysis using Finite Element Method
  performStressAnalysis(analysisId: string): AnalysisResult {
    console.log('Performing stress analysis...');

    // Build global stiffness matrix
    const globalStiffness = this.buildGlobalStiffnessMatrix();
    
    // Build load vector
    const loadVector = this.buildLoadVector();
    
    // Apply constraints
    this.applyConstraints(globalStiffness, loadVector);
    
    // Solve for displacements
    const displacements = this.solveLinearSystem(globalStiffness, loadVector);
    
    // Calculate stresses and strains
    this.calculateStressesAndStrains(displacements);
    
    // Calculate safety factors and fatigue life
    const result = this.calculateAnalysisResults();
    
    this.analysisResults.set(analysisId, result);
    return result;
  }

  private buildGlobalStiffnessMatrix(): number[][] {
    const nodeCount = this.nodes.size;
    const dof = nodeCount * 3; // 3 DOF per node (x, y, z)
    const K = Array(dof).fill(null).map(() => Array(dof).fill(0));

    this.elements.forEach(element => {
      const elementStiffness = this.calculateElementStiffnessMatrix(element);
      this.assembleElementMatrix(elementStiffness, element, K);
    });

    return K;
  }

  private calculateElementStiffnessMatrix(element: MeshElement): number[][] {
    const material = this.materials.get(element.material)!;
    const E = material.youngsModulus;
    const nu = material.poissonsRatio;

    // Simplified stiffness matrix for triangular element
    const D = this.calculateMaterialMatrix(E, nu);
    const B = this.calculateStrainDisplacementMatrix(element);
    
    // K = B^T * D * B * volume
    const BT = this.transpose(B);
    const DB = this.multiply(D, B);
    const K = this.multiply(BT, DB);
    
    return this.scalarMultiply(K, element.volume);
  }

  private calculateMaterialMatrix(E: number, nu: number): number[][] {
    const factor = E / ((1 + nu) * (1 - 2 * nu));
    return [
      [factor * (1 - nu), factor * nu, 0],
      [factor * nu, factor * (1 - nu), 0],
      [0, 0, factor * (1 - 2 * nu) / 2]
    ];
  }

  private calculateStrainDisplacementMatrix(element: MeshElement): number[][] {
    // Simplified B matrix for triangular element
    // In practice, this would involve shape function derivatives
    return [
      [1, 0, -1, 0, 0, 0],
      [0, 1, 0, -1, 0, 0],
      [1, 1, -1, -1, 0, 0]
    ];
  }

  private assembleElementMatrix(elementMatrix: number[][], element: MeshElement, globalMatrix: number[][]): void {
    const nodeIndices = element.nodes.map(nodeId => {
      const nodeIndex = Array.from(this.nodes.keys()).indexOf(nodeId);
      return nodeIndex * 3; // 3 DOF per node
    });

    for (let i = 0; i < elementMatrix.length; i++) {
      for (let j = 0; j < elementMatrix[i].length; j++) {
        const globalI = nodeIndices[Math.floor(i / 3)] + (i % 3);
        const globalJ = nodeIndices[Math.floor(j / 3)] + (j % 3);
        globalMatrix[globalI][globalJ] += elementMatrix[i][j];
      }
    }
  }

  private buildLoadVector(): number[] {
    const nodeCount = this.nodes.size;
    const F = new Array(nodeCount * 3).fill(0);

    this.loadCases.forEach(loadCase => {
      const nearestNode = this.findNearestNode(loadCase.position);
      if (nearestNode) {
        const nodeIndex = Array.from(this.nodes.keys()).indexOf(nearestNode.id);
        const baseIndex = nodeIndex * 3;

        switch (loadCase.type) {
          case 'force':
            F[baseIndex] += loadCase.magnitude * loadCase.direction.x;
            F[baseIndex + 1] += loadCase.magnitude * loadCase.direction.y;
            F[baseIndex + 2] += loadCase.magnitude * loadCase.direction.z;
            break;
          case 'pressure':
            const area = loadCase.area || 1;
            const force = loadCase.magnitude * area;
            F[baseIndex] += force * loadCase.direction.x;
            F[baseIndex + 1] += force * loadCase.direction.y;
            F[baseIndex + 2] += force * loadCase.direction.z;
            break;
        }
      }
    });

    return F;
  }

  private findNearestNode(position: THREE.Vector3): MeshNode | null {
    let nearestNode: MeshNode | null = null;
    let minDistance = Infinity;

    this.nodes.forEach(node => {
      const distance = node.position.distanceTo(position);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    });

    return nearestNode;
  }

  private applyConstraints(stiffnessMatrix: number[][], loadVector: number[]): void {
    this.constraints.forEach(constraint => {
      const nearestNode = this.findNearestNode(constraint.position);
      if (nearestNode) {
        const nodeIndex = Array.from(this.nodes.keys()).indexOf(nearestNode.id);
        const baseIndex = nodeIndex * 3;

        switch (constraint.type) {
          case 'fixed':
            // Set displacement to zero for all DOF
            for (let i = 0; i < 3; i++) {
              this.applyConstraintToMatrix(stiffnessMatrix, loadVector, baseIndex + i);
            }
            break;
          case 'pinned':
            // Set displacement to zero for translation DOF
            for (let i = 0; i < 3; i++) {
              this.applyConstraintToMatrix(stiffnessMatrix, loadVector, baseIndex + i);
            }
            break;
        }
      }
    });
  }

  private applyConstraintToMatrix(matrix: number[][], vector: number[], dofIndex: number): void {
    // Set row to identity
    for (let j = 0; j < matrix[dofIndex].length; j++) {
      matrix[dofIndex][j] = j === dofIndex ? 1 : 0;
    }
    
    // Set column to zero (except diagonal)
    for (let i = 0; i < matrix.length; i++) {
      if (i !== dofIndex) {
        matrix[i][dofIndex] = 0;
      }
    }
    
    // Set load to zero
    vector[dofIndex] = 0;
  }

  private solveLinearSystem(matrix: number[][], vector: number[]): number[] {
    // Simplified Gaussian elimination
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
        if (Math.abs(augmented[i][i]) > 1e-10) {
          const factor = augmented[k][i] / augmented[i][i];
          for (let j = i; j <= n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
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
      if (Math.abs(augmented[i][i]) > 1e-10) {
        solution[i] /= augmented[i][i];
      }
    }

    return solution;
  }

  private calculateStressesAndStrains(displacements: number[]): void {
    this.nodes.forEach((node, nodeId) => {
      const nodeIndex = Array.from(this.nodes.keys()).indexOf(nodeId);
      const baseIndex = nodeIndex * 3;

      // Update node displacements
      node.displacement.set(
        displacements[baseIndex] || 0,
        displacements[baseIndex + 1] || 0,
        displacements[baseIndex + 2] || 0
      );

      // Calculate strains (simplified)
      const strain = node.displacement.clone().multiplyScalar(0.001); // Simplified strain calculation
      node.strain.copy(strain);

      // Calculate stresses using Hooke's law
      // σ = E * ε (simplified for demonstration)
      const stress = strain.clone().multiplyScalar(200e9); // Assuming steel
      node.stress.copy(stress);
    });
  }

  private calculateAnalysisResults(): AnalysisResult {
    let maxStress = 0;
    let maxDisplacement = 0;

    this.nodes.forEach(node => {
      const stressMagnitude = node.stress.length();
      const displacementMagnitude = node.displacement.length();

      maxStress = Math.max(maxStress, stressMagnitude);
      maxDisplacement = Math.max(maxDisplacement, displacementMagnitude);
    });

    // Calculate safety factor (simplified)
    const yieldStrength = 250e6; // Assuming steel
    const safetyFactor = maxStress > 0 ? yieldStrength / maxStress : Infinity;

    // Calculate fatigue life using S-N curve (simplified)
    const fatigueLimit = 200e6; // Assuming steel
    const fatigueLife = maxStress < fatigueLimit ? Infinity : Math.pow(10, 6 - Math.log10(maxStress / fatigueLimit));

    return {
      maxStress,
      maxDisplacement,
      safetyFactor,
      fatigueLife,
      naturalFrequencies: [100, 250, 400], // Placeholder
      modeShapes: [] // Placeholder
    };
  }

  // Modal Analysis for Vibration
  performModalAnalysis(): { frequency: number; shape: THREE.Vector3[] }[] {
    // Simplified modal analysis
    const modes: { frequency: number; shape: THREE.Vector3[] }[] = [];

    // Calculate first few natural frequencies (simplified)
    const frequencies = [100, 250, 400, 600, 800]; // Hz

    frequencies.forEach((freq, index) => {
      const shape: THREE.Vector3[] = [];
      
      this.nodes.forEach(node => {
        // Generate simplified mode shape
        const amplitude = Math.sin((index + 1) * Math.PI * node.position.x / 10);
        shape.push(new THREE.Vector3(0, amplitude, 0));
      });

      modes.push({ frequency: freq, shape });
    });

    return modes;
  }

  // Tolerance Analysis
  performToleranceAnalysis(tolerances: Map<string, number>): ToleranceAnalysisResult {
    const results: ToleranceAnalysisResult = {
      worstCaseStack: 0,
      statisticalStack: 0,
      cpk: 0,
      yieldPrediction: 0
    };

    // Monte Carlo simulation for tolerance stack-up
    const iterations = 10000;
    const stackResults: number[] = [];

    for (let i = 0; i < iterations; i++) {
      let totalStack = 0;
      
      tolerances.forEach((tolerance, dimensionId) => {
        // Generate random variation within tolerance
        const variation = (Math.random() - 0.5) * 2 * tolerance;
        totalStack += variation;
      });
      
      stackResults.push(totalStack);
    }

    // Calculate statistics
    const mean = stackResults.reduce((sum, val) => sum + val, 0) / stackResults.length;
    const variance = stackResults.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stackResults.length;
    const stdDev = Math.sqrt(variance);

    results.statisticalStack = 3 * stdDev; // 3-sigma
    results.worstCaseStack = Array.from(tolerances.values()).reduce((sum, tol) => sum + tol, 0);
    results.cpk = 1.33; // Placeholder
    results.yieldPrediction = 99.7; // Placeholder

    return results;
  }

  // Utility Methods
  private transpose(matrix: number[][]): number[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }

  private multiply(a: number[][], b: number[][]): number[][] {
    const result = Array(a.length).fill(null).map(() => Array(b[0].length).fill(0));
    
    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b[0].length; j++) {
        for (let k = 0; k < b.length; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }
    
    return result;
  }

  private scalarMultiply(matrix: number[][], scalar: number): number[][] {
    return matrix.map(row => row.map(val => val * scalar));
  }

  // Getters
  getAnalysisResult(id: string): AnalysisResult | undefined {
    return this.analysisResults.get(id);
  }

  getStressVisualization(): StressVisualizationData[] {
    const stressData: StressVisualizationData[] = [];

    this.nodes.forEach(node => {
      const stressMagnitude = node.stress.length();
      if (stressMagnitude > 1e6) { // Only show significant stresses
        stressData.push({
          nodeId: node.id,
          position: node.position,
          stress: stressMagnitude,
          color: this.stressToColor(stressMagnitude),
          displacement: node.displacement
        });
      }
    });

    return stressData;
  }

  private stressToColor(stress: number): THREE.Color {
    const maxStress = 250e6; // Yield strength of steel
    const normalized = Math.min(stress / maxStress, 1);
    
    if (normalized < 0.5) {
      return new THREE.Color(0, normalized * 2, 1 - normalized * 2);
    } else {
      return new THREE.Color((normalized - 0.5) * 2, 1 - (normalized - 0.5) * 2, 0);
    }
  }
}

// Supporting Interfaces
interface ToleranceAnalysisResult {
  worstCaseStack: number;
  statisticalStack: number;
  cpk: number;
  yieldPrediction: number;
}

interface StressVisualizationData {
  nodeId: string;
  position: THREE.Vector3;
  stress: number;
  color: THREE.Color;
  displacement: THREE.Vector3;
}