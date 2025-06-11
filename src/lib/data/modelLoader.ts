import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

export class ModelLoader {
  private gltfLoader: GLTFLoader;
  private objLoader: OBJLoader;
  private stlLoader: STLLoader;
  private cache: Map<string, THREE.Object3D> = new Map();

  constructor() {
    this.gltfLoader = new GLTFLoader();
    this.objLoader = new OBJLoader();
    this.stlLoader = new STLLoader();
  }

  async loadModel(url: string, format: 'gltf' | 'obj' | 'stl' = 'gltf'): Promise<THREE.Object3D> {
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url)!.clone();
    }

    let model: THREE.Object3D;

    try {
      switch (format) {
        case 'gltf':
          const gltf = await this.loadGLTF(url);
          model = gltf.scene;
          break;
        case 'obj':
          model = await this.loadOBJ(url);
          break;
        case 'stl':
          const geometry = await this.loadSTL(url);
          model = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial());
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      // Cache the loaded model
      this.cache.set(url, model);
      return model.clone();
    } catch (error) {
      console.error(`Failed to load model from ${url}:`, error);
      // Return a fallback geometry
      return this.createFallbackModel();
    }
  }

  private loadGLTF(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(url, resolve, undefined, reject);
    });
  }

  private loadOBJ(url: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      this.objLoader.load(url, resolve, undefined, reject);
    });
  }

  private loadSTL(url: string): Promise<THREE.BufferGeometry> {
    return new Promise((resolve, reject) => {
      this.stlLoader.load(url, resolve, undefined, reject);
    });
  }

  private createFallbackModel(): THREE.Object3D {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
    return new THREE.Mesh(geometry, material);
  }

  // Progressive loading with multiple LOD levels
  async loadModelWithLOD(
    baseUrl: string, 
    lodSuffixes: string[] = ['_high', '_medium', '_low']
  ): Promise<THREE.LOD> {
    const lod = new THREE.LOD();
    
    for (let i = 0; i < lodSuffixes.length; i++) {
      try {
        const url = baseUrl.replace(/\.[^/.]+$/, `${lodSuffixes[i]}$&`);
        const model = await this.loadModel(url);
        lod.addLevel(model, i * 50); // Distance thresholds: 0, 50, 100
      } catch (error) {
        console.warn(`Failed to load LOD level ${i} for ${baseUrl}`);
        // Use fallback for missing LOD levels
        if (i === 0) {
          lod.addLevel(this.createFallbackModel(), 0);
        }
      }
    }
    
    return lod;
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const modelLoader = new ModelLoader();