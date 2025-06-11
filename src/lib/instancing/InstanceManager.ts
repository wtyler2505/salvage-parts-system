import * as THREE from 'three';

interface InstanceData {
  id: string;
  matrix: THREE.Matrix4;
  color: THREE.Color;
  visible: boolean;
  userData: any;
}

export class InstanceManager {
  private geometry: THREE.BufferGeometry;
  private material: THREE.Material;
  private instancedMesh: THREE.InstancedMesh;
  private instances: Map<string, InstanceData> = new Map();
  private maxInstances: number;
  private currentCount = 0;
  private needsUpdate = false;

  // Attribute arrays
  private matrixArray: Float32Array;
  private colorArray: Float32Array;
  private visibilityArray: Float32Array;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, maxInstances: number) {
    this.geometry = geometry;
    this.material = material;
    this.maxInstances = maxInstances;

    // Create instanced mesh
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
    
    // Initialize attribute arrays
    this.matrixArray = new Float32Array(maxInstances * 16);
    this.colorArray = new Float32Array(maxInstances * 3);
    this.visibilityArray = new Float32Array(maxInstances);

    // Set up instance attributes
    this.setupInstanceAttributes();
  }

  private setupInstanceAttributes(): void {
    // Color attribute
    const colorAttribute = new THREE.InstancedBufferAttribute(this.colorArray, 3);
    this.instancedMesh.geometry.setAttribute('instanceColor', colorAttribute);

    // Visibility attribute
    const visibilityAttribute = new THREE.InstancedBufferAttribute(this.visibilityArray, 1);
    this.instancedMesh.geometry.setAttribute('instanceVisibility', visibilityAttribute);

    // Update material to use instance attributes
    if (this.material instanceof THREE.ShaderMaterial) {
      this.updateShaderMaterial();
    } else {
      this.createInstancedMaterial();
    }
  }

  private createInstancedMaterial(): void {
    const originalMaterial = this.material as THREE.MeshStandardMaterial;
    
    const instancedMaterial = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsLib.common,
        ...THREE.UniformsLib.lights,
        map: { value: originalMaterial.map },
        normalMap: { value: originalMaterial.normalMap },
        roughnessMap: { value: originalMaterial.roughnessMap },
        metalnessMap: { value: originalMaterial.metalnessMap },
        roughness: { value: originalMaterial.roughness },
        metalness: { value: originalMaterial.metalness }
      },
      vertexShader: `
        #include <common>
        #include <uv_pars_vertex>
        #include <normal_pars_vertex>
        #include <lights_pars_begin>
        
        attribute vec3 instanceColor;
        attribute float instanceVisibility;
        
        varying vec3 vInstanceColor;
        varying float vInstanceVisibility;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          vInstanceColor = instanceColor;
          vInstanceVisibility = instanceVisibility;
          vUv = uv;
          
          vec3 transformed = position;
          vec3 objectNormal = normal;
          
          #include <normal_vertex>
          
          vec4 worldPosition = instanceMatrix * vec4(transformed, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          gl_Position = projectionMatrix * modelViewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        #include <common>
        #include <uv_pars_fragment>
        #include <lights_pars_begin>
        
        uniform sampler2D map;
        uniform sampler2D normalMap;
        uniform sampler2D roughnessMap;
        uniform sampler2D metalnessMap;
        uniform float roughness;
        uniform float metalness;
        
        varying vec3 vInstanceColor;
        varying float vInstanceVisibility;
        varying vec3 vNormal;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        
        void main() {
          if (vInstanceVisibility < 0.5) discard;
          
          vec4 diffuseColor = texture2D(map, vUv);
          diffuseColor.rgb *= vInstanceColor;
          
          vec3 normal = normalize(vNormal);
          
          // Simple lighting calculation
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float NdotL = max(dot(normal, lightDir), 0.0);
          
          vec3 color = diffuseColor.rgb * (0.3 + 0.7 * NdotL);
          
          gl_FragColor = vec4(color, diffuseColor.a);
        }
      `,
      lights: true,
      transparent: true
    });

    this.instancedMesh.material = instancedMaterial;
  }

  private updateShaderMaterial(): void {
    const material = this.material as THREE.ShaderMaterial;
    
    // Add instance attributes to vertex shader
    material.vertexShader = material.vertexShader.replace(
      '#include <common>',
      `
        #include <common>
        attribute vec3 instanceColor;
        attribute float instanceVisibility;
        varying vec3 vInstanceColor;
        varying float vInstanceVisibility;
      `
    );

    material.vertexShader = material.vertexShader.replace(
      'void main() {',
      `
        void main() {
          vInstanceColor = instanceColor;
          vInstanceVisibility = instanceVisibility;
      `
    );

    // Add instance attributes to fragment shader
    material.fragmentShader = material.fragmentShader.replace(
      '#include <common>',
      `
        #include <common>
        varying vec3 vInstanceColor;
        varying float vInstanceVisibility;
      `
    );

    material.fragmentShader = material.fragmentShader.replace(
      'void main() {',
      `
        void main() {
          if (vInstanceVisibility < 0.5) discard;
      `
    );
  }

  public addInstance(id: string, matrix: THREE.Matrix4, color: THREE.Color = new THREE.Color(1, 1, 1), userData: any = {}): boolean {
    if (this.currentCount >= this.maxInstances) {
      console.warn('Maximum instances reached');
      return false;
    }

    const instance: InstanceData = {
      id,
      matrix: matrix.clone(),
      color: color.clone(),
      visible: true,
      userData
    };

    this.instances.set(id, instance);
    
    // Update arrays
    const index = this.currentCount;
    matrix.toArray(this.matrixArray, index * 16);
    color.toArray(this.colorArray, index * 3);
    this.visibilityArray[index] = 1.0;

    this.instancedMesh.setMatrixAt(index, matrix);
    this.currentCount++;
    this.needsUpdate = true;

    return true;
  }

  public removeInstance(id: string): boolean {
    const instance = this.instances.get(id);
    if (!instance) return false;

    this.instances.delete(id);
    this.rebuildArrays();
    this.needsUpdate = true;

    return true;
  }

  public updateInstance(id: string, matrix?: THREE.Matrix4, color?: THREE.Color, visible?: boolean): boolean {
    const instance = this.instances.get(id);
    if (!instance) return false;

    if (matrix) {
      instance.matrix.copy(matrix);
    }
    if (color) {
      instance.color.copy(color);
    }
    if (visible !== undefined) {
      instance.visible = visible;
    }

    this.rebuildArrays();
    this.needsUpdate = true;

    return true;
  }

  private rebuildArrays(): void {
    let index = 0;
    
    for (const instance of this.instances.values()) {
      instance.matrix.toArray(this.matrixArray, index * 16);
      instance.color.toArray(this.colorArray, index * 3);
      this.visibilityArray[index] = instance.visible ? 1.0 : 0.0;
      
      this.instancedMesh.setMatrixAt(index, instance.matrix);
      index++;
    }

    this.currentCount = index;
    this.instancedMesh.count = this.currentCount;
  }

  public update(): void {
    if (!this.needsUpdate) return;

    // Update instance attributes
    const colorAttribute = this.instancedMesh.geometry.getAttribute('instanceColor') as THREE.InstancedBufferAttribute;
    const visibilityAttribute = this.instancedMesh.geometry.getAttribute('instanceVisibility') as THREE.InstancedBufferAttribute;

    colorAttribute.array = this.colorArray;
    visibilityAttribute.array = this.visibilityArray;

    colorAttribute.needsUpdate = true;
    visibilityAttribute.needsUpdate = true;
    this.instancedMesh.instanceMatrix.needsUpdate = true;

    this.needsUpdate = false;
  }

  public getMesh(): THREE.InstancedMesh {
    return this.instancedMesh;
  }

  public getInstance(id: string): InstanceData | undefined {
    return this.instances.get(id);
  }

  public getAllInstances(): Map<string, InstanceData> {
    return new Map(this.instances);
  }

  public getCount(): number {
    return this.currentCount;
  }

  public getMaxInstances(): number {
    return this.maxInstances;
  }

  public dispose(): void {
    this.geometry.dispose();
    if (Array.isArray(this.material)) {
      this.material.forEach(mat => mat.dispose());
    } else {
      this.material.dispose();
    }
    this.instances.clear();
  }
}