import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { Mesh, Vector3 } from 'three';
import { useViewerStore } from '../../stores/useViewerStore';

interface PartModelProps {
  partId: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

const PartModel: React.FC<PartModelProps> = ({
  partId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  const meshRef = useRef<Mesh>(null);
  const {
    selectionState,
    showWireframe,
    explodedView,
    explodeFactor,
    selectPart,
    hoverPart,
    simulationSettings
  } = useViewerStore();

  const isSelected = selectionState.selectedParts.includes(partId);
  const isHovered = selectionState.hoveredPart === partId;

  // Calculate exploded position
  const explodedPosition = useMemo(() => {
    if (!explodedView) return position;
    
    const basePos = new Vector3(...position);
    const direction = basePos.clone().normalize();
    const distance = basePos.length() * explodeFactor;
    
    return direction.multiplyScalar(distance).toArray() as [number, number, number];
  }, [position, explodedView, explodeFactor]);

  // Animate position changes
  useFrame(() => {
    if (meshRef.current) {
      const targetPos = new Vector3(...explodedPosition);
      meshRef.current.position.lerp(targetPos, 0.1);
    }
  });

  // Determine geometry based on part type (in a real app, this would load from 3D files)
  const renderGeometry = () => {
    switch (partId) {
      case 'engine-block-v8':
        return <Box args={[6, 4, 5]} />;
      case 'transmission-assembly':
        return <Cylinder args={[2, 2, 8, 8]} rotation={[0, 0, Math.PI / 2]} />;
      case 'ecu-control-module':
        return <Box args={[1.5, 1, 0.5]} />;
      default:
        return <Box args={[1, 1, 1]} />;
    }
  };

  const materialProps = {
    color: isSelected ? '#3B82F6' : isHovered ? '#06B6D4' : '#64748B',
    wireframe: showWireframe,
    transparent: true,
    opacity: showWireframe ? 0.3 : 1,
    metalness: 0.7,
    roughness: 0.3
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    selectPart(partId, event.shiftKey);
  };

  const handlePointerOver = () => {
    hoverPart(partId);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    hoverPart(null);
    document.body.style.cursor = 'default';
  };

  const ModelContent = () => (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      castShadow
      receiveShadow
    >
      {renderGeometry()}
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );

  // Wrap in physics if enabled
  if (simulationSettings.physics.enabled) {
    return (
      <RigidBody type="dynamic" position={position}>
        <ModelContent />
      </RigidBody>
    );
  }

  return <ModelContent />;
};

export default PartModel;