import React from 'react';
import { Eye, Grid3X3, Scan, Maximize2, Settings } from 'lucide-react';
import { useViewerStore } from '../../stores/useViewerStore';

const ViewModeSelector: React.FC = () => {
  const {
    currentViewMode,
    viewModes,
    showWireframe,
    explodedView,
    explodeFactor,
    setViewMode,
    toggleWireframe,
    setExplodedView
  } = useViewerStore();

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Eye': return Eye;
      case 'Grid3X3': return Grid3X3;
      case 'Scan': return Scan;
      case 'Maximize2': return Maximize2;
      default: return Eye;
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="flex items-center space-x-1">
        {viewModes.map(mode => {
          const Icon = getIcon(mode.icon);
          const isActive = currentViewMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`p-2 rounded-lg transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={mode.description}
            >
              <Icon className="w-5 h-5" />
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {mode.name}
              </div>
            </button>
          );
        })}
        
        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        {/* Additional Controls */}
        <div className="flex items-center space-x-1">
          {/* Wireframe Toggle */}
          <button
            onClick={toggleWireframe}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showWireframe
                ? 'bg-orange-500 text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title="Toggle Wireframe"
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          
          {/* Settings */}
          <button
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
            title="View Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Exploded View Controls */}
      {explodedView && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600 whitespace-nowrap">Explode:</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={explodeFactor}
              onChange={(e) => setExplodedView(true, parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-xs text-gray-600 w-8 text-right">
              {explodeFactor.toFixed(1)}x
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewModeSelector;