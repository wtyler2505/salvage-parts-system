import * as THREE from 'three';

interface LODLevel {
  distance: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  triangleCount: number;
}

export class LODManager {
  private lodObjects: Map<string, THREE.LOD> = new Map();
  private camera: THREE.Camera;
  private scene: THREE.Scene;
  private distances: [number, number, number];
  private autoUpdate = true;

  constructor(camera: THREE.Camera, scene: THREE.Scene, distances: [number, number, number] = [50, 100, 200]) {
    this.camera = camera;
    this.scene = scene;
    this.distances = distances;
  }

  public createLOD(
    id: string,
    highGeometry: THREE.BufferGeometry,
    mediumGeometry: THREE.BufferGeometry,
    lowGeometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[]
  ): THREE.LOD {
    const lod = new THREE.LOD();

    // High detail level
    const highMesh = new THREE.Mesh(highGeometry, material);
    lod.addLevel(highMesh, 0);

    // Medium detail level
    const mediumMesh = new THREE.Mesh(mediumGeometry, material);
    lod.addLevel(mediumMesh, this.distances[0]);

    // Low detail level
    const lowMesh = new THREE.Mesh(lowGeometry, material);
    lod.addLevel(lowMesh, this.distances[1]);

    // Impostor level (billboard)
    const impostorGeometry = this.createImpostorGeometry();
    const impostorMaterial = this.createImpostorMaterial(highGeometry, material);
    const impostorMesh = new THREE.Mesh(impostorGeometry, impostorMaterial);
    lod.addLevel(impostorMesh, this.distances[2]);

    this.lodObjects.set(id, lod);
    this.scene.add(lod);

    return lod;
  }

  private createImpostorGeometry(): THREE.PlaneGeometry {
    return new THREE.PlaneGeometry(2, 2);
  }

  private createImpostorMaterial(originalGeometry: THREE.BufferGeometry, originalMaterial: THREE.Material | THREE.Material[]): THREE.Material {
    // Create a texture from the original object
    const renderTarget = new THREE.WebGLRenderTarget(256, 256);
    const impostorTexture = renderTarget.texture;

    return new THREE.MeshBasicMaterial({
      map: impostorTexture,
      transparent: true,
      alphaTest: 0.5
    });
  }

  public simplifyGeometry(geometry: THREE.BufferGeometry, targetRatio: number): THREE.BufferGeometry {
    // Simple geometry simplification using vertex decimation
    const positions = geometry.attributes.position.array as Float32Array;
    const indices = geometry.index?.array as Uint32Array;
    
    if (!indices) {
      console.warn('Geometry must have indices for simplification');
      return geometry.clone();
    }

    const targetTriangles = Math.floor((indices.length / 3) * targetRatio);
    const simplifiedGeometry = geometry.clone();

    // Implement quadric error metrics or edge collapse algorithm
    // For now, using simple vertex removal
    const newIndices: number[] = [];
    const step = Math.ceil((indices.length / 3) / targetTriangles);

    for (let i = 0; i < indices.length; i += step * 3) {
      if (i + 2 < indices.length) {
        newIndices.push(indices[i], indices[i + 1], indices[i + 2]);
      }
    }

    simplifiedGeometry.setIndex(newIndices);
    simplifiedGeometry.computeVertexNormals();

    return simplifiedGeometry;
  }

  public generateLODLevels(geometry: THREE.BufferGeometry): LODLevel[] {
    const levels: LODLevel[] = [];

    // High detail (100%)
    levels.push({
      distance: 0,
      geometry: geometry.clone(),
      material: new THREE.MeshStandardMaterial(),
      triangleCount: this.getTriangleCount(geometry)
    });

    // Medium detail (50%)
    const mediumGeometry = this.simplifyGeometry(geometry, 0.5);
    levels.push({
      distance: this.distances[0],
      geometry: mediumGeometry,
      material: new THREE.MeshStandardMaterial(),
      triangleCount: this.getTriangleCount(mediumGeometry)
    });

    // Low detail (25%)
    const lowGeometry = this.simplifyGeometry(geometry, 0.25);
    levels.push({
      distance: this.distances[1],
      geometry: lowGeometry,
      material: new THREE.MeshStandardMaterial(),
      triangleCount: this.getTriangleCount(lowGeometry)
    });

    return levels;
  }

  private getTriangleCount(geometry: THREE.BufferGeometry): number {
    if (geometry.index) {
      return geometry.index.count / 3;
    } else {
      return geometry.attributes.position.count / 3;
    }
  }

  public updateLOD(): void {
    if (!this.autoUpdate) return;

    this.lodObjects.forEach((lod) => {
      lod.update(this.camera);
    });
  }

  public setDistances(distances: [number, number, number]): void {
    this.distances = distances;
    
    this.lodObjects.forEach((lod) => {
      lod.levels.forEach((level, index) => {
        if (index < this.distances.length) {
          level.distance = this.distances[index];
        }
      });
    });
  }

  public setAutoUpdate(enabled: boolean): void {
    this.autoUpdate = enabled;
  }

  public getLOD(id: string): THREE.LOD | undefined {
    return this.lodObjects.get(id);
  }

  public removeLOD(id: string): boolean {
    const lod = this.lodObjects.get(id);
    if (lod) {
      this.scene.remove(lod);
      this.lodObjects.delete(id);
      
      // Dispose geometries and materials
      lod.levels.forEach(level => {
        const mesh = level.object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => mat.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
      
      return true;
    }
    return false;
  }

  public getStats(): { totalLODs: number; totalLevels: number; averageTriangles: number } {
    let totalLevels = 0;
    let totalTriangles = 0;

    this.lodObjects.forEach((lod) => {
      totalLevels += lod.levels.length;
      lod.levels.forEach(level => {
        const mesh = level.object as THREE.Mesh;
        if (mesh.geometry) {
          totalTriangles += this.getTriangleCount(mesh.geometry);
        }
      });
    });

    return {
      totalLODs: this.lodObjects.size,
      totalLevels,
      averageTriangles: totalLevels > 0 ? totalTriangles / totalLevels : 0
    };
  }

  public dispose(): void {
    this.lodObjects.forEach((lod, id) => {
      this.removeLOD(id);
    });
    this.lodObjects.clear();
  }
}