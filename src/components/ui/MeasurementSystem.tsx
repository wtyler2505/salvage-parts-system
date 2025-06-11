import React from 'react';
import { Line, Text, Sphere } from '@react-three/drei';
import { useViewerStore } from '../../stores/useViewerStore';
import * as THREE from 'three';

const MeasurementSystem: React.FC = () => {
  const { 
    showMeasurements, 
    measurements, 
    currentMeasurementPoints,
    deleteMeasurement
  } = useViewerStore();
  
  if (!showMeasurements) return null;
  
  const getMidpoint = (start: THREE.Vector3, end: THREE.Vector3): THREE.Vector3 => {
    return new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  };
  
  return (
    <group>
      {/* Completed measurements */}
      {measurements.map((measurement) => (
        <group key={measurement.id}>
          {/* Line connecting points */}
          <Line 
            points={[measurement.startPoint, measurement.endPoint]}
            color="white"
            lineWidth={2}
          />
          
          {/* Distance label */}
          <Text
            position={getMidpoint(measurement.startPoint, measurement.endPoint)}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            backgroundOpacity={0.7}
            backgroundColor="black"
            padding={0.05}
            onClick={() => deleteMeasurement(measurement.id)}
          >
            {`${measurement.distance.toFixed(2)}m`}
          </Text>
          
          {/* Start point */}
          <Sphere position={measurement.startPoint} args={[0.05]}>
            <meshBasicMaterial color="red" />
          </Sphere>
          
          {/* End point */}
          <Sphere position={measurement.endPoint} args={[0.05]}>
            <meshBasicMaterial color="red" />
          </Sphere>
        </group>
      ))}
      
      {/* Current measurement in progress */}
      {currentMeasurementPoints.length > 0 && (
        <group>
          {/* First point */}
          <Sphere position={currentMeasurementPoints[0]} args={[0.05]}>
            <meshBasicMaterial color="yellow" />
          </Sphere>
          
          {/* Line and second point if available */}
          {currentMeasurementPoints.length > 1 && (
            <>
              <Line 
                points={[currentMeasurementPoints[0], currentMeasurementPoints[1]]}
                color="yellow"
                lineWidth={2}
              />
              <Sphere position={currentMeasurementPoints[1]} args={[0.05]}>
                <meshBasicMaterial color="yellow" />
              </Sphere>
            </>
          )}
        </group>
      )}
    </group>
  );
};

export default MeasurementSystem;