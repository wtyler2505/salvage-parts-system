import * as THREE from 'three';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
  cpuUsage: number;
  gpuMemory: number;
}

export interface PerformanceConfig {
  targetFPS: number;
  maxDrawCalls: number;
  maxTriangles: number;
  enableAdaptiveQuality: boolean;
  enableFrustumCulling: boolean;
  enableOcclusion: boolean;
  lodDistances: [number, number, number];
}

export class PerformanceManager {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private frameCount = 0;
  private lastTime = 0;
  private fpsHistory: number[] = [];
  private adaptiveQualityLevel = 1.0;
  private performanceObserver?: PerformanceObserver;

  constructor(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, config: PerformanceConfig) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.config = config;
    this.metrics = this.initializeMetrics();
    
    this.setupPerformanceObserver();
    this.startMonitoring();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      programs: 0,
      cpuUsage: 0,
      gpuMemory: 0
    };
  }

  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.entryType === 'measure') {
            this.metrics.frameTime = entry.duration;
          }
        });
      });
      
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
    }
  }

  private startMonitoring(): void {
    const monitor = () => {
      this.updateMetrics();
      
      if (this.config.enableAdaptiveQuality) {
        this.adjustQuality();
      }
      
      requestAnimationFrame(monitor);
    };
    
    monitor();
  }

  private updateMetrics(): void {
    const now = performance.now();
    this.frameCount++;
    
    if (now - this.lastTime >= 1000) {
      this.metrics.fps = (this.frameCount * 1000) / (now - this.lastTime);
      this.fpsHistory.push(this.metrics.fps);
      
      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }
      
      this.frameCount = 0;
      this.lastTime = now;
      
      // Update renderer info
      const info = this.renderer.info;
      this.metrics.drawCalls = info.render.calls;
      this.metrics.triangles = info.render.triangles;
      this.metrics.geometries = info.memory.geometries;
      this.metrics.textures = info.memory.textures;
      this.metrics.programs = info.programs?.length || 0;
      
      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }
      
      // GPU memory estimation
      this.metrics.gpuMemory = this.estimateGPUMemory();
    }
  }

  private estimateGPUMemory(): number {
    let totalMemory = 0;
    
    // Estimate texture memory
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => {
          if (material instanceof THREE.MeshStandardMaterial) {
            ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap'].forEach(prop => {
              const texture = (material as any)[prop];
              if (texture && texture.image) {
                const { width, height } = texture.image;
                totalMemory += width * height * 4; // RGBA
              }
            });
          }
        });
      }
    });
    
    return totalMemory / 1024 / 1024; // MB
  }

  private adjustQuality(): void {
    const avgFPS = this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    
    if (avgFPS < this.config.targetFPS * 0.8) {
      // Reduce quality
      this.adaptiveQualityLevel = Math.max(0.5, this.adaptiveQualityLevel - 0.1);
      this.applyQualitySettings();
    } else if (avgFPS > this.config.targetFPS * 1.1 && this.adaptiveQualityLevel < 1.0) {
      // Increase quality
      this.adaptiveQualityLevel = Math.min(1.0, this.adaptiveQualityLevel + 0.05);
      this.applyQualitySettings();
    }
  }

  private applyQualitySettings(): void {
    // Adjust renderer settings
    const pixelRatio = Math.min(window.devicePixelRatio, this.adaptiveQualityLevel * 2);
    this.renderer.setPixelRatio(pixelRatio);
    
    // Adjust shadow quality
    if (this.renderer.shadowMap.enabled) {
      const shadowMapSize = Math.floor(1024 * this.adaptiveQualityLevel);
      this.renderer.shadowMap.setSize(shadowMapSize, shadowMapSize);
    }
    
    // Adjust LOD distances based on quality
    this.scene.traverse((object) => {
      if (object instanceof THREE.LOD) {
        object.levels.forEach((level, index) => {
          level.distance = this.config.lodDistances[index] * (2 - this.adaptiveQualityLevel);
        });
      }
    });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getQualityLevel(): number {
    return this.adaptiveQualityLevel;
  }

  public setConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public dispose(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}