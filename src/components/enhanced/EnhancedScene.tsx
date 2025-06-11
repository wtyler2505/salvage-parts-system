import React, { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Stats, Preload } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { 
  EffectComposer, 
  SSAO, 
  Bloom, 
  SMAA,
  N8AO
} from '@react-three/postprocessing';
import { NormalPass, BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// Import our performance systems
import { PerformanceManager } from '../../lib/performance/PerformanceManager';
import { OctreeManager } from '../../lib/spatial/OctreeManager';
import { InstanceManager } from '../../lib/instancing/InstanceManager';
import { LODManager } from '../../lib/lod/LODManager';
import { WorkerPool } from '../../lib/workers/WorkerPool';
import { UndoRedoManager } from '../../lib/undo/UndoRedoManager';
import { AutoSaveManager } from '../../lib/autosave/AutoSaveManager';

// Import UI components
import PerformanceOverlay from '../performance/PerformanceOverlay';
import KonamiCode from '../easter-eggs/KonamiCode';
import AchievementSystem from '../achievements/AchievementSystem';
import PartTetris from '../mini-games/PartTetris';

// Import enhanced components
import { useViewerStore } from '../../stores/useViewerStore';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';

interface EnhancedSceneProps {
  enablePerformanceOptimizations?: boolean;
  enableEasterEggs?: boolean;
  enableAchievements?: boolean;
}

// Create a custom effects component to properly handle NormalPass
const PostProcessingEffects: React.FC<{ enabled: boolean; useSSAO: boolean }> = ({ enabled, useSSAO }) => {
  const { scene, camera } = useThree();
  
  if (!enabled) return null;

  return (
    <EffectComposer
      multisampling={0}
      disableNormalPass={false}
    >
      {useSSAO ? (
        <>
          {/* Add NormalPass as a primitive object for SSAO */}
          <primitive object={new NormalPass(scene, camera)} />
          
          {/* SSAO with optimized settings */}
          <SSAO
            blendFunction={BlendFunction.MULTIPLY}
            samples={16}
            radius={0.05}
            intensity={20}
            luminanceInfluence={0.3}
            distanceThreshold={0.5}
            distanceFalloff={0.1}
            rangeThreshold={0.001}
            rangeFalloff={0.01}
            minRadiusScale={0.5}
            bias={0.5}
            normalDepthBuffer
          />
        </>
      ) : (
        /* N8AO as a more performant alternative that doesn't need NormalPass */
        <N8AO
          aoRadius={0.5}
          intensity={1}
          aoSamples={16}
          denoiseSamples={4}
          denoiseRadius={12}
          distanceFalloff={1}
          color="black"
        />
      )}
      
      {/* Bloom effect */}
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.8}
        luminanceSmoothing={0.025}
        mipmapBlur
      />
      
      {/* Anti-aliasing */}
      <SMAA />
    </EffectComposer>
  );
};

// Scene content component
const SceneContent: React.FC<{
  performanceManager: PerformanceManager | null;
  enableEffects: boolean;
  useSSAO: boolean;
}> = ({ performanceManager, enableEffects, useSSAO }) => {
  const { showGrid, simulationSettings } = useViewerStore();
  const { parts } = useSalvagePartStore();
  
  useFrame((state) => {
    if (performanceManager) {
      // Update performance manager with current frame data
      const fps = 1 / state.clock.getDelta();
      // performanceManager.update would be called here
    }
  });

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Environment */}
      <Environment preset="studio" />
      
      {/* Grid */}
      {showGrid && (
        <Grid
          renderOrder={-1}
          position={[0, -0.01, 0]}
          infiniteGrid
          cellSize={1}
          cellThickness={0.5}
          sectionSize={10}
          sectionThickness={1}
          fadeDistance={100}
          fadeStrength={1}
        />
      )}
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        dampingFactor={0.05}
        enableDamping
      />
      
      {/* Sample geometry for testing */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      
      <mesh position={[2, 0.5, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      
      <mesh position={[-2, 0.75, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 1.5, 32]} />
        <meshStandardMaterial color="#4ecdc4" />
      </mesh>
      
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      
      {/* Post-processing effects */}
      <PostProcessingEffects enabled={enableEffects} useSSAO={useSSAO} />
      
      {/* Performance stats */}
      <Stats />
    </>
  );
};

const EnhancedScene: React.FC<EnhancedSceneProps> = ({
  enablePerformanceOptimizations = true,
  enableEasterEggs = true,
  enableAchievements = true
}) => {
  const { parts } = useSalvagePartStore();
  
  // Performance systems
  const [performanceManager, setPerformanceManager] = useState<PerformanceManager | null>(null);
  const [octreeManager, setOctreeManager] = useState<OctreeManager | null>(null);
  const [lodManager, setLODManager] = useState<LODManager | null>(null);
  const [workerPool, setWorkerPool] = useState<WorkerPool | null>(null);
  const [undoRedoManager] = useState(() => new UndoRedoManager(100));
  const [autoSaveManager] = useState(() => new AutoSaveManager({
    interval: 60000, // 60 seconds
    maxSaves: 10,
    enableConflictDetection: true,
    enableCompression: true,
    storageKey: 'salvage_parts_autosave'
  }));

  // UI state
  const [showPerformanceOverlay, setShowPerformanceOverlay] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTetris, setShowTetris] = useState(false);
  const [konamiActivated, setKonamiActivated] = useState(false);
  const [enablePostProcessing, setEnablePostProcessing] = useState(true);
  const [useSSAO, setUseSSAO] = useState(false); // Default to N8AO for better compatibility

  // Initialize performance systems
  const initializePerformanceSystems = (gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
    if (!enablePerformanceOptimizations) return;

    // Performance Manager
    const perfManager = new PerformanceManager(gl, scene, camera, {
      targetFPS: 60,
      maxDrawCalls: 1000,
      maxTriangles: 100000,
      enableAdaptiveQuality: true,
      enableFrustumCulling: true,
      enableOcclusion: true,
      lodDistances: [50, 100, 200]
    });
    setPerformanceManager(perfManager);

    // Octree for spatial indexing
    const bounds = new THREE.Box3(
      new THREE.Vector3(-100, -100, -100),
      new THREE.Vector3(100, 100, 100)
    );
    const octree = new OctreeManager(bounds, 10, 5);
    setOctreeManager(octree);

    // LOD Manager
    const lod = new LODManager(camera, scene, [50, 100, 200]);
    setLODManager(lod);

    // Worker Pool for heavy computations
    const workers = new WorkerPool('/src/workers/geometryProcessor.ts', 4);
    setWorkerPool(workers);

    console.log('Performance systems initialized');
  };

  // Scene setup component
  const SceneSetup: React.FC = () => {
    const { gl, scene, camera } = useThree();
    
    useEffect(() => {
      initializePerformanceSystems(gl, scene, camera);
      
      // Trigger first steps achievement
      if (enableAchievements && (window as any).updateAchievementProgress) {
        (window as any).updateAchievementProgress('first_steps', 1);
      }
    }, [gl, scene, camera]);

    return null;
  };

  // Handle Konami code activation
  const handleKonamiActivation = () => {
    setKonamiActivated(true);
    setShowTetris(true);
    
    if (enableAchievements && (window as any).updateAchievementProgress) {
      (window as any).updateAchievementProgress('konami_master', 1);
      (window as any).updateAchievementProgress('easter_egg_hunter', 1);
    }
    
    setTimeout(() => setKonamiActivated(false), 5000);
  };

  // Handle achievement unlocks
  const handleAchievementUnlocked = (achievement: any) => {
    console.log('Achievement unlocked:', achievement.title);
    
    // Play sound effect or show special effects
    if (achievement.rarity === 'legendary') {
      // Special effects for legendary achievements
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Performance overlay toggle
      if (e.key === 'F3') {
        e.preventDefault();
        setShowPerformanceOverlay(!showPerformanceOverlay);
      }
      
      // Achievements panel toggle
      if (e.key === 'F4') {
        e.preventDefault();
        setShowAchievements(!showAchievements);
      }
      
      // Toggle SSAO/N8AO
      if (e.key === 'F5') {
        e.preventDefault();
        setUseSSAO(!useSSAO);
      }
      
      // Undo/Redo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoRedoManager.undo();
      }
      
      if (e.ctrlKey && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        undoRedoManager.redo();
      }
      
      // Manual save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        autoSaveManager.save(null, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPerformanceOverlay, showAchievements, useSSAO, undoRedoManager, autoSaveManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      performanceManager?.dispose();
      workerPool?.dispose();
      autoSaveManager?.dispose();
    };
  }, [performanceManager, workerPool, autoSaveManager]);

  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* Main 3D Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          {/* Scene setup */}
          <SceneSetup />
          
          {/* Physics World */}
          <Physics 
            gravity={[0, -9.81, 0]}
            timeStep={1/60}
          >
            <SceneContent 
              performanceManager={performanceManager}
              enableEffects={enablePostProcessing}
              useSSAO={useSSAO}
            />
          </Physics>

          {/* Preload assets */}
          <Preload all />
        </Suspense>
      </Canvas>

      {/* Performance Overlay */}
      {performanceManager && (
        <PerformanceOverlay
          performanceManager={performanceManager}
          visible={showPerformanceOverlay}
          position="top-right"
        />
      )}

      {/* Easter Eggs */}
      {enableEasterEggs && (
        <KonamiCode
          onActivate={handleKonamiActivation}
          scene={new THREE.Scene()} // This would be the actual scene reference
        />
      )}

      {/* Achievements Panel */}
      {enableAchievements && showAchievements && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-3/4 m-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Achievements</h2>
              <button
                onClick={() => setShowAchievements(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <div className="h-full overflow-hidden">
              <AchievementSystem onAchievementUnlocked={handleAchievementUnlocked} />
            </div>
          </div>
        </div>
      )}

      {/* Mini-games */}
      {showTetris && (
        <PartTetris onClose={() => setShowTetris(false)} />
      )}

      {/* Control Panel */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 space-y-2">
        <div className="text-sm font-medium text-gray-900">Controls</div>
        
        <button
          onClick={() => setEnablePostProcessing(!enablePostProcessing)}
          className={`w-full px-3 py-1 text-xs rounded transition-colors ${
            enablePostProcessing 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Effects: {enablePostProcessing ? 'ON' : 'OFF'}
        </button>
        
        <button
          onClick={() => setUseSSAO(!useSSAO)}
          className={`w-full px-3 py-1 text-xs rounded transition-colors ${
            useSSAO 
              ? 'bg-blue-500 text-white' 
              : 'bg-orange-500 text-white'
          }`}
        >
          AO: {useSSAO ? 'SSAO' : 'N8AO'}
        </button>
      </div>

      {/* Help overlay */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg text-sm">
        <div className="space-y-1">
          <div><kbd className="bg-gray-700 px-1 rounded">F3</kbd> Performance Overlay</div>
          <div><kbd className="bg-gray-700 px-1 rounded">F4</kbd> Achievements</div>
          <div><kbd className="bg-gray-700 px-1 rounded">F5</kbd> Toggle AO Method</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Z</kbd> Undo</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+Y</kbd> Redo</div>
          <div><kbd className="bg-gray-700 px-1 rounded">Ctrl+S</kbd> Save</div>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="absolute top-4 left-4 text-white text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-save enabled</span>
        </div>
      </div>

      {/* Konami activation effect */}
      {konamiActivated && (
        <div className="fixed inset-0 pointer-events-none z-40">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default EnhancedScene;