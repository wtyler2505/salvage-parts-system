// Web Worker for geometry processing
const ctx: Worker = self as any;

interface GeometryData {
  positions: Float32Array;
  normals: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
}

interface SimplificationParams {
  targetRatio: number;
  preserveBoundaries: boolean;
  preserveUVs: boolean;
}

interface OptimizationParams {
  mergeVertices: boolean;
  computeNormals: boolean;
  computeTangents: boolean;
  removeDuplicates: boolean;
}

// Quadric Error Metrics for mesh simplification
class QuadricErrorMetrics {
  private vertices: Float32Array;
  private faces: Uint32Array;
  private quadrics: Map<number, number[]> = new Map();

  constructor(vertices: Float32Array, faces: Uint32Array) {
    this.vertices = vertices;
    this.faces = faces;
    this.computeQuadrics();
  }

  private computeQuadrics(): void {
    // Initialize quadrics for each vertex
    for (let i = 0; i < this.vertices.length / 3; i++) {
      this.quadrics.set(i, new Array(10).fill(0));
    }

    // Compute quadrics from face planes
    for (let i = 0; i < this.faces.length; i += 3) {
      const v1 = this.faces[i] * 3;
      const v2 = this.faces[i + 1] * 3;
      const v3 = this.faces[i + 2] * 3;

      // Calculate face normal
      const p1 = [this.vertices[v1], this.vertices[v1 + 1], this.vertices[v1 + 2]];
      const p2 = [this.vertices[v2], this.vertices[v2 + 1], this.vertices[v2 + 2]];
      const p3 = [this.vertices[v3], this.vertices[v3 + 1], this.vertices[v3 + 2]];

      const normal = this.computeFaceNormal(p1, p2, p3);
      const d = -(normal[0] * p1[0] + normal[1] * p1[1] + normal[2] * p1[2]);

      // Create quadric matrix
      const quadric = this.createQuadric(normal[0], normal[1], normal[2], d);

      // Add to vertex quadrics
      this.addQuadricToVertex(this.faces[i], quadric);
      this.addQuadricToVertex(this.faces[i + 1], quadric);
      this.addQuadricToVertex(this.faces[i + 2], quadric);
    }
  }

  private computeFaceNormal(p1: number[], p2: number[], p3: number[]): number[] {
    const v1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
    const v2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];
    
    const normal = [
      v1[1] * v2[2] - v1[2] * v2[1],
      v1[2] * v2[0] - v1[0] * v2[2],
      v1[0] * v2[1] - v1[1] * v2[0]
    ];

    const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
    if (length > 0) {
      normal[0] /= length;
      normal[1] /= length;
      normal[2] /= length;
    }

    return normal;
  }

  private createQuadric(a: number, b: number, c: number, d: number): number[] {
    return [
      a * a, a * b, a * c, a * d,
      b * b, b * c, b * d,
      c * c, c * d,
      d * d
    ];
  }

  private addQuadricToVertex(vertexIndex: number, quadric: number[]): void {
    const existing = this.quadrics.get(vertexIndex)!;
    for (let i = 0; i < quadric.length; i++) {
      existing[i] += quadric[i];
    }
  }

  public simplify(targetRatio: number): { vertices: Float32Array; faces: Uint32Array } {
    const targetFaces = Math.floor((this.faces.length / 3) * targetRatio);
    
    // Create edge list with costs
    const edges = this.createEdgeList();
    
    // Sort edges by cost
    edges.sort((a, b) => a.cost - b.cost);

    // Collapse edges until target is reached
    let currentFaces = this.faces.length / 3;
    const collapsedVertices = new Set<number>();
    const vertexMapping = new Map<number, number>();

    for (const edge of edges) {
      if (currentFaces <= targetFaces) break;
      if (collapsedVertices.has(edge.v1) || collapsedVertices.has(edge.v2)) continue;

      // Collapse edge
      collapsedVertices.add(edge.v2);
      vertexMapping.set(edge.v2, edge.v1);
      currentFaces -= this.countAffectedFaces(edge.v2);
    }

    // Rebuild geometry
    return this.rebuildGeometry(collapsedVertices, vertexMapping);
  }

  private createEdgeList(): Array<{ v1: number; v2: number; cost: number }> {
    const edges: Array<{ v1: number; v2: number; cost: number }> = [];
    const edgeSet = new Set<string>();

    for (let i = 0; i < this.faces.length; i += 3) {
      const v1 = this.faces[i];
      const v2 = this.faces[i + 1];
      const v3 = this.faces[i + 2];

      this.addEdge(edges, edgeSet, v1, v2);
      this.addEdge(edges, edgeSet, v2, v3);
      this.addEdge(edges, edgeSet, v3, v1);
    }

    return edges;
  }

  private addEdge(edges: Array<{ v1: number; v2: number; cost: number }>, edgeSet: Set<string>, v1: number, v2: number): void {
    const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
    if (edgeSet.has(key)) return;

    edgeSet.add(key);
    const cost = this.computeEdgeCost(v1, v2);
    edges.push({ v1: Math.min(v1, v2), v2: Math.max(v1, v2), cost });
  }

  private computeEdgeCost(v1: number, v2: number): number {
    const q1 = this.quadrics.get(v1)!;
    const q2 = this.quadrics.get(v2)!;
    
    // Combine quadrics
    const combined = q1.map((val, i) => val + q2[i]);
    
    // Compute optimal position (simplified)
    const pos1 = [this.vertices[v1 * 3], this.vertices[v1 * 3 + 1], this.vertices[v1 * 3 + 2]];
    const pos2 = [this.vertices[v2 * 3], this.vertices[v2 * 3 + 1], this.vertices[v2 * 3 + 2]];
    const midpoint = [(pos1[0] + pos2[0]) / 2, (pos1[1] + pos2[1]) / 2, (pos1[2] + pos2[2]) / 2];
    
    // Evaluate quadric at midpoint
    return this.evaluateQuadric(combined, midpoint);
  }

  private evaluateQuadric(quadric: number[], point: number[]): number {
    const [x, y, z] = point;
    return (
      quadric[0] * x * x + 2 * quadric[1] * x * y + 2 * quadric[2] * x * z + 2 * quadric[3] * x +
      quadric[4] * y * y + 2 * quadric[5] * y * z + 2 * quadric[6] * y +
      quadric[7] * z * z + 2 * quadric[8] * z +
      quadric[9]
    );
  }

  private countAffectedFaces(vertex: number): number {
    let count = 0;
    for (let i = 0; i < this.faces.length; i += 3) {
      if (this.faces[i] === vertex || this.faces[i + 1] === vertex || this.faces[i + 2] === vertex) {
        count++;
      }
    }
    return count;
  }

  private rebuildGeometry(collapsedVertices: Set<number>, vertexMapping: Map<number, number>): { vertices: Float32Array; faces: Uint32Array } {
    // Create new vertex array
    const newVertices: number[] = [];
    const vertexIndexMap = new Map<number, number>();
    let newIndex = 0;

    for (let i = 0; i < this.vertices.length / 3; i++) {
      if (!collapsedVertices.has(i)) {
        vertexIndexMap.set(i, newIndex++);
        newVertices.push(this.vertices[i * 3], this.vertices[i * 3 + 1], this.vertices[i * 3 + 2]);
      }
    }

    // Create new face array
    const newFaces: number[] = [];
    for (let i = 0; i < this.faces.length; i += 3) {
      let v1 = this.faces[i];
      let v2 = this.faces[i + 1];
      let v3 = this.faces[i + 2];

      // Remap collapsed vertices
      while (vertexMapping.has(v1)) v1 = vertexMapping.get(v1)!;
      while (vertexMapping.has(v2)) v2 = vertexMapping.get(v2)!;
      while (vertexMapping.has(v3)) v3 = vertexMapping.get(v3)!;

      // Skip degenerate faces
      if (v1 === v2 || v2 === v3 || v3 === v1) continue;

      const newV1 = vertexIndexMap.get(v1);
      const newV2 = vertexIndexMap.get(v2);
      const newV3 = vertexIndexMap.get(v3);

      if (newV1 !== undefined && newV2 !== undefined && newV3 !== undefined) {
        newFaces.push(newV1, newV2, newV3);
      }
    }

    return {
      vertices: new Float32Array(newVertices),
      faces: new Uint32Array(newFaces)
    };
  }
}

// Message handlers
ctx.onmessage = function(e) {
  const { type, data, id } = e.data;

  try {
    switch (type) {
      case 'SIMPLIFY_GEOMETRY':
        const simplified = simplifyGeometry(data.geometry, data.params);
        ctx.postMessage({ type: 'GEOMETRY_SIMPLIFIED', data: simplified, id });
        break;

      case 'OPTIMIZE_GEOMETRY':
        const optimized = optimizeGeometry(data.geometry, data.params);
        ctx.postMessage({ type: 'GEOMETRY_OPTIMIZED', data: optimized, id });
        break;

      case 'COMPUTE_NORMALS':
        const withNormals = computeNormals(data.geometry);
        ctx.postMessage({ type: 'NORMALS_COMPUTED', data: withNormals, id });
        break;

      case 'MERGE_VERTICES':
        const merged = mergeVertices(data.geometry, data.tolerance);
        ctx.postMessage({ type: 'VERTICES_MERGED', data: merged, id });
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    ctx.postMessage({ type: 'ERROR', error: error.message, id });
  }
};

function simplifyGeometry(geometry: GeometryData, params: SimplificationParams): GeometryData {
  const qem = new QuadricErrorMetrics(geometry.positions, geometry.indices);
  const result = qem.simplify(params.targetRatio);

  return {
    positions: result.vertices,
    normals: new Float32Array(0), // Will be computed separately
    uvs: new Float32Array(0), // Simplified
    indices: result.faces
  };
}

function optimizeGeometry(geometry: GeometryData, params: OptimizationParams): GeometryData {
  let result = { ...geometry };

  if (params.mergeVertices) {
    result = mergeVertices(result, 0.0001);
  }

  if (params.computeNormals) {
    result = computeNormals(result);
  }

  return result;
}

function computeNormals(geometry: GeometryData): GeometryData {
  const positions = geometry.positions;
  const indices = geometry.indices;
  const normals = new Float32Array(positions.length);

  // Initialize normals to zero
  normals.fill(0);

  // Calculate face normals and accumulate
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i] * 3;
    const b = indices[i + 1] * 3;
    const c = indices[i + 2] * 3;

    const v1 = [positions[a], positions[a + 1], positions[a + 2]];
    const v2 = [positions[b], positions[b + 1], positions[b + 2]];
    const v3 = [positions[c], positions[c + 1], positions[c + 2]];

    // Calculate edge vectors
    const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

    // Calculate cross product (face normal)
    const normal = [
      edge1[1] * edge2[2] - edge1[2] * edge2[1],
      edge1[2] * edge2[0] - edge1[0] * edge2[2],
      edge1[0] * edge2[1] - edge1[1] * edge2[0]
    ];

    // Accumulate normals for each vertex
    for (let j = 0; j < 3; j++) {
      const vertexIndex = indices[i + j] * 3;
      normals[vertexIndex] += normal[0];
      normals[vertexIndex + 1] += normal[1];
      normals[vertexIndex + 2] += normal[2];
    }
  }

  // Normalize the accumulated normals
  for (let i = 0; i < normals.length; i += 3) {
    const length = Math.sqrt(
      normals[i] * normals[i] +
      normals[i + 1] * normals[i + 1] +
      normals[i + 2] * normals[i + 2]
    );

    if (length > 0) {
      normals[i] /= length;
      normals[i + 1] /= length;
      normals[i + 2] /= length;
    }
  }

  return {
    ...geometry,
    normals
  };
}

function mergeVertices(geometry: GeometryData, tolerance: number): GeometryData {
  const positions = geometry.positions;
  const indices = geometry.indices;
  const normals = geometry.normals;
  const uvs = geometry.uvs;

  const newPositions: number[] = [];
  const newNormals: number[] = [];
  const newUVs: number[] = [];
  const newIndices: number[] = [];
  const vertexMap = new Map<string, number>();

  function getVertexKey(index: number): string {
    const x = Math.round(positions[index * 3] / tolerance) * tolerance;
    const y = Math.round(positions[index * 3 + 1] / tolerance) * tolerance;
    const z = Math.round(positions[index * 3 + 2] / tolerance) * tolerance;
    return `${x},${y},${z}`;
  }

  // Process each vertex
  for (let i = 0; i < indices.length; i++) {
    const originalIndex = indices[i];
    const key = getVertexKey(originalIndex);

    let newIndex = vertexMap.get(key);
    if (newIndex === undefined) {
      newIndex = newPositions.length / 3;
      vertexMap.set(key, newIndex);

      // Add vertex data
      newPositions.push(
        positions[originalIndex * 3],
        positions[originalIndex * 3 + 1],
        positions[originalIndex * 3 + 2]
      );

      if (normals.length > 0) {
        newNormals.push(
          normals[originalIndex * 3],
          normals[originalIndex * 3 + 1],
          normals[originalIndex * 3 + 2]
        );
      }

      if (uvs.length > 0) {
        newUVs.push(
          uvs[originalIndex * 2],
          uvs[originalIndex * 2 + 1]
        );
      }
    }

    newIndices.push(newIndex);
  }

  return {
    positions: new Float32Array(newPositions),
    normals: new Float32Array(newNormals),
    uvs: new Float32Array(newUVs),
    indices: new Uint32Array(newIndices)
  };
}

export {};