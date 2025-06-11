import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationManager, CoupledResults } from '../../lib/simulation/SimulationManager';

interface SimulationVisualizationProps {
  simulationManager: SimulationManager;
  width: number;
  height: number;
}

const SimulationVisualization: React.FC<SimulationVisualizationProps> = ({
  simulationManager,
  width,
  height
}) => {
  const [results, setResults] = useState<CoupledResults | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'stress' | 'temperature' | 'electrical' | 'failure'>('stress');

  useEffect(() => {
    const interval = setInterval(() => {
      const latestResults = simulationManager.getLatestResults();
      setResults(latestResults);
    }, 100);

    return () => clearInterval(interval);
  }, [simulationManager]);

  return (
    <div className="relative" style={{ width, height }}>
      {/* Visualization Mode Selector */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex space-x-1">
          {[
            { id: 'stress', name: 'Stress', color: 'bg-red-500' },
            { id: 'temperature', name: 'Temperature', color: 'bg-orange-500' },
            { id: 'electrical', name: 'Electrical', color: 'bg-blue-500' },
            { id: 'failure', name: 'Failure', color: 'bg-purple-500' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setVisualizationMode(mode.id as any)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                visualizationMode === mode.id
                  ? `${mode.color} text-white`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Visualization */}
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <OrbitControls enablePan enableZoom enableRotate />
        
        {results && (
          <SimulationScene 
            results={results} 
            visualizationMode={visualizationMode}
          />
        )}
      </Canvas>

      {/* Data Overlay */}
      {results && (
        <SimulationDataOverlay 
          results={results} 
          visualizationMode={visualizationMode}
        />
      )}
    </div>
  );
};

interface SimulationSceneProps {
  results: CoupledResults;
  visualizationMode: 'stress' | 'temperature' | 'electrical' | 'failure';
}

const SimulationScene: React.FC<SimulationSceneProps> = ({ results, visualizationMode }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      // Animate based on simulation data
      groupRef.current.rotation.y += 0.001;
    }
  });

  const renderStressVisualization = () => {
    if (!results.mechanical) return null;

    const maxStress = results.mechanical.maxStress || 0;
    const stressColor = new THREE.Color().setHSL(
      Math.max(0, 1 - maxStress / 250e6) * 0.33, // Red for high stress
      1,
      0.5
    );

    return (
      <group>
        <Box args={[2, 2, 2]} position={[0, 0, 0]}>
          <meshStandardMaterial color={stressColor} />
        </Box>
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {`Max Stress: ${(maxStress / 1e6).toFixed(1)} MPa`}
        </Text>
      </group>
    );
  };

  const renderTemperatureVisualization = () => {
    if (!results.thermal) return null;

    const maxTemp = results.thermal.maxTemperature || 20;
    const tempColor = new THREE.Color().setHSL(
      Math.max(0, 1 - (maxTemp - 20) / 80) * 0.66, // Blue to red
      1,
      0.5
    );

    return (
      <group>
        <Sphere args={[1.5]} position={[0, 0, 0]}>
          <meshStandardMaterial color={tempColor} />
        </Sphere>
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {`Max Temperature: ${maxTemp.toFixed(1)}°C`}
        </Text>
        
        {/* Heat flow visualization */}
        <HeatFlowLines temperature={maxTemp} />
      </group>
    );
  };

  const renderElectricalVisualization = () => {
    if (!results.electrical) return null;

    const totalPower = results.electrical.totalPower || 0;
    const powerColor = new THREE.Color().setHSL(0.16, 1, 0.5); // Yellow

    return (
      <group>
        <Box args={[1, 3, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial color={powerColor} />
        </Box>
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {`Total Power: ${totalPower.toFixed(1)}W`}
        </Text>
        
        {/* Current flow visualization */}
        <CurrentFlowLines power={totalPower} />
      </group>
    );
  };

  const renderFailureVisualization = () => {
    if (!results.failure) return null;

    const reliability = results.failure.systemReliability || 1;
    const failureColor = new THREE.Color().setHSL(
      reliability * 0.33, // Green for high reliability
      1,
      0.5
    );

    return (
      <group>
        <Sphere args={[2]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={failureColor} 
            transparent 
            opacity={reliability}
          />
        </Sphere>
        <Text
          position={[0, 3, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {`Reliability: ${(reliability * 100).toFixed(1)}%`}
        </Text>
        
        {/* Failure indicators */}
        {results.failure.failures && results.failure.failures.length > 0 && (
          <FailureIndicators failures={results.failure.failures} />
        )}
      </group>
    );
  };

  return (
    <group ref={groupRef}>
      {visualizationMode === 'stress' && renderStressVisualization()}
      {visualizationMode === 'temperature' && renderTemperatureVisualization()}
      {visualizationMode === 'electrical' && renderElectricalVisualization()}
      {visualizationMode === 'failure' && renderFailureVisualization()}
      
      {/* Grid */}
      <gridHelper args={[20, 20]} />
    </group>
  );
};

const HeatFlowLines: React.FC<{ temperature: number }> = ({ temperature }) => {
  const points = [];
  const intensity = Math.min(temperature / 100, 1);
  
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const radius = 2 + intensity * 2;
    points.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      )
    );
  }

  return (
    <Line
      points={points}
      color="red"
      lineWidth={2}
      transparent
      opacity={intensity}
    />
  );
};

const CurrentFlowLines: React.FC<{ power: number }> = ({ power }) => {
  const points = [];
  const intensity = Math.min(power / 100, 1);
  
  // Create flowing current lines
  for (let i = 0; i < 5; i++) {
    const y = (i - 2) * 0.5;
    points.push(
      new THREE.Vector3(-3, y, 0),
      new THREE.Vector3(3, y, 0)
    );
  }

  return (
    <Line
      points={points}
      color="blue"
      lineWidth={3}
      transparent
      opacity={intensity}
    />
  );
};

const FailureIndicators: React.FC<{ failures: any[] }> = ({ failures }) => {
  return (
    <group>
      {failures.map((failure, index) => (
        <Sphere
          key={index}
          args={[0.2]}
          position={[
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          ]}
        >
          <meshStandardMaterial color="red" emissive="red" emissiveIntensity={0.5} />
        </Sphere>
      ))}
    </group>
  );
};

interface SimulationDataOverlayProps {
  results: CoupledResults;
  visualizationMode: 'stress' | 'temperature' | 'electrical' | 'failure';
}

const SimulationDataOverlay: React.FC<SimulationDataOverlayProps> = ({ 
  results, 
  visualizationMode 
}) => {
  const getDataForMode = () => {
    switch (visualizationMode) {
      case 'stress':
        return {
          title: 'Mechanical Analysis',
          data: [
            { label: 'Max Stress', value: `${((results.mechanical?.maxStress || 0) / 1e6).toFixed(1)} MPa` },
            { label: 'Max Displacement', value: `${((results.mechanical?.maxDisplacement || 0) * 1000).toFixed(2)} mm` },
            { label: 'Safety Factor', value: (results.mechanical?.safetyFactor || 0).toFixed(2) },
            { label: 'Fatigue Life', value: `${(results.mechanical?.fatigueLife || 0).toExponential(2)} cycles` }
          ]
        };
      
      case 'temperature':
        return {
          title: 'Thermal Analysis',
          data: [
            { label: 'Max Temperature', value: `${(results.thermal?.maxTemperature || 0).toFixed(1)}°C` },
            { label: 'Avg Temperature', value: `${(results.thermal?.averageTemperature || 0).toFixed(1)}°C` },
            { label: 'Heat Generation', value: `${(results.thermal?.totalHeatGeneration || 0).toFixed(1)}W` },
            { label: 'Max Thermal Stress', value: `${((Math.max(...Array.from(results.thermal?.thermalStresses?.values() || [0]))) / 1e6).toFixed(1)} MPa` }
          ]
        };
      
      case 'electrical':
        return {
          title: 'Electrical Analysis',
          data: [
            { label: 'Total Power', value: `${(results.electrical?.totalPower || 0).toFixed(1)}W` },
            { label: 'Efficiency', value: `${(results.electrical?.efficiency || 0).toFixed(1)}%` },
            { label: 'Max Voltage', value: `${Math.max(...Array.from(results.electrical?.nodeVoltages?.values() || [0])).toFixed(1)}V` },
            { label: 'Max Current', value: `${Math.max(...Array.from(results.electrical?.componentCurrents?.values() || [0])).toFixed(2)}A` }
          ]
        };
      
      case 'failure':
        return {
          title: 'Failure Analysis',
          data: [
            { label: 'System Reliability', value: `${((results.failure?.systemReliability || 1) * 100).toFixed(1)}%` },
            { label: 'Active Failures', value: (results.failure?.failures?.length || 0).toString() },
            { label: 'Risk Level', value: results.failure?.systemReliability > 0.9 ? 'Low' : results.failure?.systemReliability > 0.7 ? 'Medium' : 'High' },
            { label: 'MTBF', value: 'Calculating...' }
          ]
        };
      
      default:
        return { title: '', data: [] };
    }
  };

  const { title, data } = getDataForMode();

  return (
    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4 min-w-64">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{item.label}:</span>
            <span className="text-sm font-medium text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
      
      {/* Real-time timestamp */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Timestamp:</span>
          <span className="text-xs font-mono text-gray-700">
            {results.timestamp.toFixed(3)}s
          </span>
        </div>
      </div>
    </div>
  );
};

export default SimulationVisualization;