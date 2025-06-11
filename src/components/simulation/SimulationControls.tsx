import React, { useState, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Settings, Download, Upload, Zap, Thermometer, Wrench, AlertTriangle } from 'lucide-react';
import { SimulationManager, SimulationConfig } from '../../lib/simulation/SimulationManager';

interface SimulationControlsProps {
  simulationManager: SimulationManager;
  onConfigChange: (config: SimulationConfig) => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ 
  simulationManager, 
  onConfigChange 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<SimulationConfig>(simulationManager.getConfig());
  const [showSettings, setShowSettings] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [performance, setPerformance] = useState({
    fps: 0,
    physicsTime: 0,
    electricalTime: 0,
    thermalTime: 0,
    mechanicalTime: 0,
    failureTime: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const state = simulationManager.getState();
      setIsRunning(state.isRunning);
      setCurrentTime(state.currentTime);
      setPerformance(state.performance);
    }, 100);

    return () => clearInterval(interval);
  }, [simulationManager]);

  const handleStart = () => {
    simulationManager.start();
  };

  const handlePause = () => {
    if (isRunning) {
      simulationManager.pause();
    } else {
      simulationManager.resume();
    }
  };

  const handleStop = () => {
    simulationManager.stop();
  };

  const handleReset = () => {
    simulationManager.reset();
  };

  const handleConfigUpdate = (newConfig: Partial<SimulationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    simulationManager.updateConfig(newConfig);
    onConfigChange(updatedConfig);
  };

  const handleExportResults = (format: 'json' | 'csv' | 'matlab') => {
    const data = simulationManager.exportResults(format);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_results.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const runScenario = (scenarioName: string, parameters: any) => {
    simulationManager.runScenario(scenarioName, parameters);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Simulation Controls</h3>
          <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`} />
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleStart}
            disabled={isRunning}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Start Simulation"
          >
            <Play className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePause}
            className="p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            title={isRunning ? "Pause" : "Resume"}
          >
            <Pause className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleStop}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            title="Stop Simulation"
          >
            <Square className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleReset}
            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Simulation Time</div>
          <div className="text-lg font-semibold text-gray-900">{formatTime(currentTime)}</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">FPS</div>
          <div className="text-lg font-semibold text-gray-900">{performance.fps.toFixed(1)}</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Physics Time</div>
          <div className="text-lg font-semibold text-gray-900">{performance.physicsTime.toFixed(1)}ms</div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Total Time</div>
          <div className="text-lg font-semibold text-gray-900">
            {(performance.physicsTime + performance.electricalTime + performance.thermalTime + performance.mechanicalTime + performance.failureTime).toFixed(1)}ms
          </div>
        </div>
      </div>

      {/* Simulation Modules */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.physics.enabled}
            onChange={(e) => handleConfigUpdate({ 
              physics: { ...config.physics, enabled: e.target.checked } 
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Wrench className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Physics</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.electrical.enabled}
            onChange={(e) => handleConfigUpdate({ 
              electrical: { ...config.electrical, enabled: e.target.checked } 
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Zap className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Electrical</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.thermal.enabled}
            onChange={(e) => handleConfigUpdate({ 
              thermal: { ...config.thermal, enabled: e.target.checked } 
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Thermometer className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Thermal</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config.failure.enabled}
            onChange={(e) => handleConfigUpdate({ 
              failure: { ...config.failure, enabled: e.target.checked } 
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <AlertTriangle className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Failure</span>
        </div>
      </div>

      {/* Test Scenarios */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Test Scenarios</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => runScenario('overvoltage_test', { voltage: 18, duration: 5, componentId: 'test_component' })}
            className="px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Overvoltage Test
          </button>
          
          <button
            onClick={() => runScenario('thermal_cycling', { minTemp: -20, maxTemp: 80, cycleTime: 60, cycles: 10 })}
            className="px-3 py-2 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
          >
            Thermal Cycling
          </button>
          
          <button
            onClick={() => runScenario('vibration_test', { frequency: 50, amplitude: 0.5, duration: 30 })}
            className="px-3 py-2 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Vibration Test
          </button>
          
          <button
            onClick={() => runScenario('accelerated_aging', { accelerationFactor: 100, duration: 60 })}
            className="px-3 py-2 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
          >
            Accelerated Aging
          </button>
        </div>
      </div>

      {/* Export Controls */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Data Export</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExportResults('json')}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              JSON
            </button>
            <button
              onClick={() => handleExportResults('csv')}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              CSV
            </button>
            <button
              onClick={() => handleExportResults('matlab')}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              MATLAB
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Simulation Settings</h4>
          
          {/* Physics Settings */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700">Physics</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600">Time Step (s)</label>
                <input
                  type="number"
                  step="0.001"
                  value={config.physics.timeStep}
                  onChange={(e) => handleConfigUpdate({
                    physics: { ...config.physics, timeStep: parseFloat(e.target.value) }
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600">Substeps</label>
                <input
                  type="number"
                  value={config.physics.substeps}
                  onChange={(e) => handleConfigUpdate({
                    physics: { ...config.physics, substeps: parseInt(e.target.value) }
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {/* Thermal Settings */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700">Thermal</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600">Ambient Temperature (°C)</label>
                <input
                  type="number"
                  value={config.thermal.ambientTemperature}
                  onChange={(e) => handleConfigUpdate({
                    thermal: { ...config.thermal, ambientTemperature: parseFloat(e.target.value) }
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={config.thermal.convectionEnabled}
                    onChange={(e) => handleConfigUpdate({
                      thermal: { ...config.thermal, convectionEnabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">Convection</span>
                </label>
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={config.thermal.radiationEnabled}
                    onChange={(e) => handleConfigUpdate({
                      thermal: { ...config.thermal, radiationEnabled: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">Radiation</span>
                </label>
              </div>
            </div>
          </div>

          {/* Failure Settings */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700">Failure Analysis</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600">Acceleration Factor</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={config.failure.accelerationFactor}
                  onChange={(e) => handleConfigUpdate({
                    failure: { ...config.failure, accelerationFactor: parseFloat(e.target.value) }
                  })}
                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-1">
                  <input
                    type="checkbox"
                    checked={config.failure.maintenanceSchedule}
                    onChange={(e) => handleConfigUpdate({
                      failure: { ...config.failure, maintenanceSchedule: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600">Maintenance Schedule</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationControls;