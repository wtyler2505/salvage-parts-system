import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF } from '@react-three/drei';
import { Package } from 'lucide-react';
import { usePartStore } from '../../stores/usePartStore';

interface PartPreviewProps {
  partId: string;
  width?: number;
  height?: number;
}

const PartModel: React.FC<{ partId: string }> = ({ partId }) => {
  const { parts } = usePartStore();
  const part = parts.find(p => p.id === partId);
  
  // Try to load the model if URL exists
  const modelUrl = part?.models?.primary?.url;
  
  if (modelUrl) {
    try {
      const { scene } = useGLTF(modelUrl);
      return <primitive object={scene} scale={0.5} />;
    } catch (error) {
      console.error('Error loading model:', error);
      // Fall back to placeholder
    }
  }
  
  // Placeholder geometry based on part type
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#64748B" />
    </mesh>
  );
};

const PartPreview: React.FC<PartPreviewProps> = ({ partId, width = 300, height = 200 }) => {
  const { parts } = usePartStore();
  const part = parts.find(p => p.id === partId);
  
  if (!part) {
    return (
      <div 
        style={{ width, height }}
        className="bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center"
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Package className="w-10 h-10 mx-auto mb-2" />
          <p className="text-sm">Part not found</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      style={{ width, height }}
      className="bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700"
    >
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <PartModel partId={partId} />
          <Environment preset="studio" />
          <OrbitControls 
            enablePan={false}
            minDistance={2}
            maxDistance={10}
            autoRotate
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>
      
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 truncate">
        {part.metadata.name}
      </div>
    </div>
  );
};

export default PartPreview;