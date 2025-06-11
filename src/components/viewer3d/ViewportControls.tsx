import React from 'react';
import { useThree } from '@react-three/fiber';
import { useViewerStore } from '../../stores/useViewerStore';

const ViewportControls: React.FC = () => {
  const { camera } = useThree();
  const { setCameraState } = useViewerStore();

  // Auto-save camera state periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCameraState({
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [0, 0, 0], // This would be dynamic in a real implementation
        zoom: camera.zoom
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [camera, setCameraState]);

  return null;
};

export default ViewportControls;