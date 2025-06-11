import React from 'react';
import { Ruler, Move, RotateCcw, Maximize } from 'lucide-react';
import { useViewerStore } from '../../stores/useViewerStore';

const MeasurementTools: React.FC = () => {
  const { showMeasurements, toggleMeasurements } = useViewerStore();
  const [activetool, setActiveTool] = React.useState<string | null>(null);

  const tools = [
    { id: 'distance', name: 'Distance', icon: Ruler },
    { id: 'move', name: 'Move', icon: Move },
    { id: 'rotate', name: 'Rotate', icon: RotateCcw },
    { id: 'scale', name: 'Scale', icon: Maximize }
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="flex items-center space-x-1">
        {/* Measurement Toggle */}
        <button
          onClick={toggleMeasurements}
          className={`p-2 rounded-lg transition-all duration-200 ${
            showMeasurements
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
          title="Toggle Measurements"
        >
          <Ruler className="w-5 h-5" />
        </button>

        {showMeasurements && (
          <>
            {/* Separator */}
            <div className="w-px h-6 bg-gray-300 mx-1" />
            
            {/* Measurement Tools */}
            {tools.map(tool => {
              const Icon = tool.icon;
              const isActive = activetool === tool.id;
              
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(isActive ? null : tool.id)}
                  className={`p-2 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  title={tool.name}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {tool.name}
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Active Tool Info */}
      {activetool && showMeasurements && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            {activetool === 'distance' && 'Click two points to measure distance'}
            {activetool === 'move' && 'Drag to move selected parts'}
            {activetool === 'rotate' && 'Drag to rotate selected parts'}
            {activetool === 'scale' && 'Drag to scale selected parts'}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeasurementTools;