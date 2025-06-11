import React, { useRef, useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import { Box, Sphere, Cylinder, useGLTF } from '@react-three/drei';
import { RigidBody, CuboidCollider, BallCollider, CylinderCollider } from '@react-three/rapier';
import { Mesh, Vector3, Euler, Quaternion } from 'three';
import { useViewerStore } from '../../stores/useViewerStore';
import { useSalvagePartStore } from '../../stores/useSalvagePartStore';

interface PartModelProps {
  partId: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  mass?: number;
  restitution?: number;
  friction?: number;
  collisionShape?: 'box' | 'sphere' | 'cylinder' | 'mesh';
  isStatic?: boolean;
}

const PartModel: React.FC<PartModelProps> = ({
  partId,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  mass = 1,
  restitution = 0.2,
  friction = 0.5,
  collisionShape = 'box',
  isStatic = false
}) => {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useThree();
  const {
    selectionState,
    showWireframe,
    explodedView,
    explodeFactor,
    selectPart,
    hoverPart,
    simulationSettings
  } = useViewerStore();
  const { parts } = useSalvagePartStore();

  const isSelected = selectionState.selectedParts.includes(partId);
  const isHovered = selectionState.hoveredPart === partId;
  
  // Find part data from store
  const partData = useMemo(() => {
    return parts.find(part => part.id === partId);
  }, [parts, partId]);
  
  // Get physics properties from part data or use defaults
  const physicsProps = useMemo(() => {
    if (!partData) return { mass, restitution, friction };
    
    return {
      mass: partData.simulation?.physics?.mass || mass,
      restitution: partData.simulation?.physics?.restitution || restitution,
      friction: partData.simulation?.physics?.friction || friction,
      collisionShape: partData.simulation?.physics?.collisionShape || collisionShape
    };
  }, [partData, mass, restitution, friction, collisionShape]);

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

  // Determine geometry and collider based on part type
  const { geometry, collider } = useMemo(() => {
    switch (partId) {
      case 'engine-block-v8':
        return {
          geometry: <Box args={[6, 4, 5]} />,
          collider: <CuboidCollider args={[3, 2, 2.5]} />
        };
      case 'transmission-assembly':
        return {
          geometry: <Cylinder args={[2, 2, 8, 8]} rotation={[0, 0, Math.PI / 2]} />,
          collider: <CylinderCollider args={[4, 2]} rotation={[0, 0, Math.PI / 2]} />
        };
      case 'ecu-control-module':
        return {
          geometry: <Box args={[1.5, 1, 0.5]} />,
          collider: <CuboidCollider args={[0.75, 0.5, 0.25]} />
        };
      default:
        return {
          geometry: <Box args={[1, 1, 1]} />,
          collider: <CuboidCollider args={[0.5, 0.5, 0.5]} />
        };
    }
  }, [partId]);

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

  // Model content without physics
  const ModelContent: React.FC = () => (
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
      {geometry}
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );

  // Model content with physics
  const PhysicsModelContent: React.FC = () => {
    // Convert rotation from array to Euler
    const eulerRotation = new Euler(...rotation);
    // Convert Euler to Quaternion for Rapier
    const quaternion = new Quaternion().setFromEuler(eulerRotation);
    
    return (
      <RigidBody
        position={position}
        rotation={[quaternion.x, quaternion.y, quaternion.z, quaternion.w]}
        mass={physicsProps.mass}
        restitution={physicsProps.restitution}
        friction={physicsProps.friction}
        type={isStatic ? 'fixed' : 'dynamic'}
        colliders={false}
      >
        <mesh
          ref={meshRef}
          scale={scale}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          castShadow
          receiveShadow
        >
          {geometry}
          <meshStandardMaterial {...materialProps} />
        </mesh>
        {collider}
      </RigidBody>
    );
  };

  // Return physics model or regular model based on simulation settings
  if (simulationSettings.physics.enabled) {
    return <PhysicsModelContent />;
  }

  return <ModelContent />;
};

export default PartModel;