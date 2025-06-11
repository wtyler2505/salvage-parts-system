import * as THREE from 'three';

interface OctreeNode {
  bounds: THREE.Box3;
  objects: THREE.Object3D[];
  children: OctreeNode[];
  level: number;
}

export class OctreeManager {
  private root: OctreeNode;
  private maxObjects: number;
  private maxLevels: number;
  private frustum: THREE.Frustum = new THREE.Frustum();
  private matrix: THREE.Matrix4 = new THREE.Matrix4();

  constructor(bounds: THREE.Box3, maxObjects = 10, maxLevels = 5) {
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.root = this.createNode(bounds, 0);
  }

  private createNode(bounds: THREE.Box3, level: number): OctreeNode {
    return {
      bounds: bounds.clone(),
      objects: [],
      children: [],
      level
    };
  }

  public insert(object: THREE.Object3D): void {
    this.insertIntoNode(this.root, object);
  }

  private insertIntoNode(node: OctreeNode, object: THREE.Object3D): void {
    // If object doesn't fit in bounds, don't insert
    const objectBounds = new THREE.Box3().setFromObject(object);
    if (!node.bounds.intersectsBox(objectBounds)) {
      return;
    }

    // If we can fit more objects or we're at max level, add to this node
    if (node.objects.length < this.maxObjects || node.level >= this.maxLevels) {
      node.objects.push(object);
      return;
    }

    // If no children exist, create them
    if (node.children.length === 0) {
      this.subdivide(node);
    }

    // Try to insert into children
    let inserted = false;
    for (const child of node.children) {
      if (child.bounds.containsBox(objectBounds)) {
        this.insertIntoNode(child, object);
        inserted = true;
        break;
      }
    }

    // If couldn't insert into any child, keep in this node
    if (!inserted) {
      node.objects.push(object);
    }
  }

  private subdivide(node: OctreeNode): void {
    const bounds = node.bounds;
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const halfSize = size.clone().multiplyScalar(0.5);

    // Create 8 child nodes
    for (let x = 0; x < 2; x++) {
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 2; z++) {
          const childMin = new THREE.Vector3(
            center.x + (x - 0.5) * halfSize.x,
            center.y + (y - 0.5) * halfSize.y,
            center.z + (z - 0.5) * halfSize.z
          );
          const childMax = childMin.clone().add(halfSize);
          const childBounds = new THREE.Box3(childMin, childMax);
          
          node.children.push(this.createNode(childBounds, node.level + 1));
        }
      }
    }
  }

  public frustumCull(camera: THREE.Camera): THREE.Object3D[] {
    this.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this.frustum.setFromProjectionMatrix(this.matrix);
    
    const visibleObjects: THREE.Object3D[] = [];
    this.cullNode(this.root, visibleObjects);
    return visibleObjects;
  }

  private cullNode(node: OctreeNode, visibleObjects: THREE.Object3D[]): void {
    // Check if node bounds intersect with frustum
    if (!this.frustum.intersectsBox(node.bounds)) {
      return;
    }

    // Add objects in this node
    for (const object of node.objects) {
      const objectBounds = new THREE.Box3().setFromObject(object);
      if (this.frustum.intersectsBox(objectBounds)) {
        visibleObjects.push(object);
      }
    }

    // Recursively check children
    for (const child of node.children) {
      this.cullNode(child, visibleObjects);
    }
  }

  public query(bounds: THREE.Box3): THREE.Object3D[] {
    const results: THREE.Object3D[] = [];
    this.queryNode(this.root, bounds, results);
    return results;
  }

  private queryNode(node: OctreeNode, bounds: THREE.Box3, results: THREE.Object3D[]): void {
    if (!node.bounds.intersectsBox(bounds)) {
      return;
    }

    for (const object of node.objects) {
      const objectBounds = new THREE.Box3().setFromObject(object);
      if (bounds.intersectsBox(objectBounds)) {
        results.push(object);
      }
    }

    for (const child of node.children) {
      this.queryNode(child, bounds, results);
    }
  }

  public remove(object: THREE.Object3D): boolean {
    return this.removeFromNode(this.root, object);
  }

  private removeFromNode(node: OctreeNode, object: THREE.Object3D): boolean {
    const index = node.objects.indexOf(object);
    if (index !== -1) {
      node.objects.splice(index, 1);
      return true;
    }

    for (const child of node.children) {
      if (this.removeFromNode(child, object)) {
        return true;
      }
    }

    return false;
  }

  public clear(): void {
    this.root.objects = [];
    this.root.children = [];
  }

  public getStats(): { totalNodes: number; totalObjects: number; maxDepth: number } {
    let totalNodes = 0;
    let totalObjects = 0;
    let maxDepth = 0;

    const traverse = (node: OctreeNode) => {
      totalNodes++;
      totalObjects += node.objects.length;
      maxDepth = Math.max(maxDepth, node.level);

      for (const child of node.children) {
        traverse(child);
      }
    };

    traverse(this.root);

    return { totalNodes, totalObjects, maxDepth };
  }
}