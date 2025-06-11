import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, Stats, Plane } from '@react-three/drei';
import { Physics, Debug } from '@react-three/rapier';
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing';
import { useViewerStore } from '../../stores/useViewerStore';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';
import PartModel from './PartModel';
import ViewportControls from './ViewportControls';
import SelectionOutline from './SelectionOutline';
import { AnnotationSystem } from '../collaboration/AnnotationSystem';
import MeasurementSystem from '../ui/MeasurementSystem';

const Scene: React.FC = () => {
  const {
    showGrid,
    simulationSettings,
    cameraState,
    isAddingAnnotation,
    addAnnotation,
    setIsAddingAnnotation,
    showMeasurements
  } = useViewerStore();
  const { parts } = useSalvagePartStore();

  const handleSceneClick = (event: any) => {
    if (!isAddingAnnotation) return;
    
    // Prevent event from propagating
    event.stopPropagation();
    
    // Get intersection point
    const intersects = event.intersections;
    if (intersects.length > 0) {
      const point = intersects[0].point.clone();
      
      // Add annotation at intersection point
      addAnnotation({
        position: point,
        text: 'New annotation',
        author: 'User'
      });
      
      // Exit annotation mode
      setIsAddingAnnotation(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-900">
      <Canvas
        camera={{
          position: cameraState.position,
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/* Environment and Lighting */}
          <Environment preset="studio" />
          <ambientLight intensity={0.2} />
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

          {/* Physics World */}
          <Physics 
            enabled={simulationSettings.physics.enabled} 
            gravity={[0, simulationSettings.physics.gravity[1], 0]}
            timeStep={simulationSettings.physics.timeStep}
            onClick={handleSceneClick}
          >
            {/* Sample Parts - In a real app, these would be loaded dynamically */}
            <PartModel 
              partId="engine-block-v8"
              position={[0, 2, 0]}
              scale={0.01}
              mass={10}
              collisionShape="box"
            />
            <PartModel 
              partId="transmission-assembly"
              position={[3, 1, 0]}
              scale={0.01}
              mass={5}
              collisionShape="cylinder"
            />
            <PartModel 
              partId="ecu-control-module"
              position={[-2, 1, 2]}
              scale={0.1}
              mass={0.5}
              collisionShape="box"
            />
            
            {/* Ground plane with physics */}
            <RigidBody type="fixed" position={[0, -0.5, 0]} restitution={0.2} friction={0.7}>
              <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <meshStandardMaterial color="#f0f0f0" />
              </Plane>
            </RigidBody>
            
            {/* Debug visualization for physics if enabled */}
            {simulationSettings.physics.showDebug && (
              <Debug />
            )}
            
            {/* Measurement System */}
            {showMeasurements && (
              <MeasurementSystem />
            />
          </Physics>

          {/* Annotation System */}
          <AnnotationSystem />

          {/* Controls */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            target={cameraState.target}
          />

          {/* Viewport Controls and Effects */}
          <ViewportControls />
          <SelectionOutline />

          {/* Post-processing Effects */}
          <EffectComposer
            multisampling={0}
            disableNormalPass={false}
          >
            <SSAO 
              samples={30}
              radius={0.1}
              intensity={20}
              luminanceInfluence={0.7}
              color="black"
              worldDistanceThreshold={0.0}
              worldDistanceFalloff={0.0}
              worldProximityThreshold={0.0}
              worldProximityFalloff={0.0}
            />
            <Bloom intensity={0.5} threshold={1} />
          </EffectComposer>

          {/* Performance Monitor */}
          <Stats />
        </Suspense>
      </Canvas>
      
    </div>
  );
};

export default Scene;