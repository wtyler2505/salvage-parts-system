import React from 'react';
import { Grid, Eye, Layers, Maximize, Sparkles, Zap, MessageSquare, Magnet, Ruler } from 'lucide-react';
import { useViewerStore } from '../../stores/useViewerStore';

const SceneControlsPanel = () => {
  const { 
    showGrid, 
    showWireframe, 
    explodedView, 
    explodeFactor,
    simulationSettings,
    isAddingAnnotation,
    isMeasuring,
    toggleGrid, 
    toggleWireframe, 
    toggleMeasurements,
    setIsMeasuring,
    setExplodedView,
    setIsAddingAnnotation
  } = useViewerStore();

  const handleExplodeFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExplodedView(true, parseFloat(e.target.value));
  };
  
  const handlePhysicsToggle = () => {
    useViewerStore.setState(state => ({ simulationSettings: { ...state.simulationSettings, physics: { ...state.simulationSettings.physics, enabled: !state.simulationSettings.physics.enabled } } }));
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 overflow-auto">
      <div className="p-4 space-y-6">
        {/* Display Options */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Eye className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            Display Options
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Grid className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Grid</span>
              </div>
              <button
                onClick={toggleGrid}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                  showGrid ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showGrid ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Layers className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Wireframe</span>
              </div>
              <button
                onClick={toggleWireframe}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                  showWireframe ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showWireframe ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Assembly View */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Maximize className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            Assembly View
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Exploded View</span>
              <button
                onClick={() => setExplodedView(!explodedView, explodeFactor)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                  explodedView ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    explodedView ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {explodedView && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Explode Factor</span>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {explodeFactor.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={explodeFactor}
                  onChange={handleExplodeFactorChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Measurements */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Ruler className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            Measurements
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Measurements</span>
              <button
                onClick={toggleMeasurements}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                  showMeasurements ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showMeasurements ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Measurement Mode</span>
              <button
                onClick={() => setIsMeasuring(!isMeasuring)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                  isMeasuring ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isMeasuring ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {isMeasuring && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
                Click two points on the 3D model to measure the distance between them
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Physics Simulation */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Magnet className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            Physics Simulation
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable Physics</span>
              <button
                onClick={handlePhysicsToggle}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                  simulationSettings.physics.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    simulationSettings.physics.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {simulationSettings.physics.enabled && (
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs text-green-800 dark:text-green-300">
                Physics simulation is active. Objects will respond to gravity and collisions.
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Annotations */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            Annotations
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Add Annotation Mode</span>
              <button
                onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                className={`relative inline-flex h-5 w-10 items-center rounded-full ${
                  isAddingAnnotation ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    isAddingAnnotation ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {isAddingAnnotation && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-300">
                Click anywhere on the 3D model to place an annotation
              </div>
            )}
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700"></div>
        
        {/* Effects */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
            Effects
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Post-Processing</span>
              </div>
              <button
                disabled
                className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Ambient Occlusion</span>
              <button
                disabled
                className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300">Bloom</span>
              <button
                disabled
                className="relative inline-flex h-5 w-10 items-center rounded-full bg-gray-200 dark:bg-gray-700 opacity-50 cursor-not-allowed"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Coming Soon Section */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">Coming Soon</h4>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Advanced rendering options, shadows, and environment controls will be available in the next update.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SceneControlsPanel;