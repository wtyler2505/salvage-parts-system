import * as THREE from 'three';

export const createLODGeometry = (baseGeometry: THREE.BufferGeometry, lodLevels: number[] = [1, 0.5, 0.25]) => {
  const lod = new THREE.LOD();
  
  lodLevels.forEach((scale, index) => {
    const geometry = baseGeometry.clone();
    
    // Simplify geometry based on LOD level
    if (scale < 1) {
      // This would typically use a geometry simplification algorithm
      // For now, we'll just scale the geometry
      geometry.scale(scale, scale, scale);
    }
    
    const material = new THREE.MeshStandardMaterial({
      color: index === 0 ? 0x888888 : index === 1 ? 0x666666 : 0x444444
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    lod.addLevel(mesh, index * 50);
  });
  
  return lod;
};

export const calculateBoundingBox = (geometry: THREE.BufferGeometry) => {
  geometry.computeBoundingBox();
  return geometry.boundingBox;
};

export const centerGeometry = (geometry: THREE.BufferGeometry) => {
  const box = calculateBoundingBox(geometry);
  if (box) {
    const center = box.getCenter(new THREE.Vector3());
    geometry.translate(-center.x, -center.y, -center.z);
  }
  return geometry;
};

export const optimizeGeometry = (geometry: THREE.BufferGeometry) => {
  // Remove duplicate vertices
  geometry = THREE.BufferGeometryUtils.mergeVertices(geometry);
  
  // Compute normals if they don't exist
  if (!geometry.attributes.normal) {
    geometry.computeVertexNormals();
  }
  
  // Compute tangents for normal mapping
  if (geometry.attributes.uv && !geometry.attributes.tangent) {
    geometry.computeTangents();
  }
  
  return geometry;
};

export const createInstancedGeometry = (baseGeometry: THREE.BufferGeometry, count: number) => {
  const instancedGeometry = new THREE.InstancedBufferGeometry();
  instancedGeometry.copy(baseGeometry);
  instancedGeometry.instanceCount = count;
  
  // Create transformation matrices for instances
  const matrices = new Float32Array(count * 16);
  const matrix = new THREE.Matrix4();
  
  for (let i = 0; i < count; i++) {
    // Random positioning for demonstration
    matrix.setPosition(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    matrix.toArray(matrices, i * 16);
  }
  
  instancedGeometry.setAttribute('instanceMatrix', new THREE.InstancedBufferAttribute(matrices, 16));
  
  return instancedGeometry;
};