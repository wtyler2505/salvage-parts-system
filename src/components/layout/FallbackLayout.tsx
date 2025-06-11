import React, { useState } from 'react';
import { Maximize2, Minimize2, X, MoreVertical } from 'lucide-react';
import PartsManager from '../parts/PartsManager';
import EnhancedScene from '../enhanced/EnhancedScene';
import PropertyPanel from '../panels/PropertyPanel';
import PartLibraryPanel from '../panels/PartLibraryPanel';

interface Panel {
  id: string;
  title: string;
  component: React.ComponentType;
  componentName?: string;
  width: number;
  height: number;
  x: number;
  y: number;
  minimized: boolean;
  maximized: boolean;
}

const FallbackLayout: React.FC = () => {
  const [panels, setPanels] = useState<Panel[]>([
    {
      id: 'library',
      title: 'Part Library',
      component: PartLibraryPanel,
      componentName: 'PartLibraryPanel',
      width: 300,
      height: 600,
      x: 0,
      y: 0,
      minimized: false,
      maximized: false
    },
    {
      id: 'viewer',
      title: '3D Viewer',
      component: EnhancedScene,
      componentName: 'EnhancedScene',
      width: 800,
      height: 600,
      x: 320,
      y: 0,
      minimized: false,
      maximized: false
    },
    {
      id: 'properties',
      title: 'Properties',
      component: PropertyPanel,
      componentName: 'PropertyPanel',
      width: 300,
      height: 400,
      x: 1140,
      y: 0,
      minimized: false,
      maximized: false
    },
    {
      id: 'manager',
      title: 'Parts Manager',
      component: PartsManager,
      componentName: 'PartsManager',
      width: 800,
      height: 300,
      x: 320,
      y: 620,
      minimized: false,
      maximized: false
    }
  ]);

  const [dragState, setDragState] = useState<{
    panelId: string | null;
    startX: number;
    startY: number;
    startPanelX: number;
    startPanelY: number;
  }>({
    panelId: null,
    startX: 0,
    startY: 0,
    startPanelX: 0,
    startPanelY: 0
  });

  const handleDragStart = (e: React.MouseEvent, panelId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return;

    setDragState({
      panelId,
      startX: e.clientX,
      startY: e.clientY,
      startPanelX: panel.x,
      startPanelY: panel.y
    });

    // Add event listeners for drag and drop
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!dragState.panelId) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    setPanels(prev => prev.map(panel => {
      if (panel.id === dragState.panelId) {
        return {
          ...panel,
          x: dragState.startPanelX + deltaX,
          y: dragState.startPanelY + deltaY
        };
      }
      return panel;
    }));
  };

  const handleDragEnd = () => {
    setDragState({
      panelId: null,
      startX: 0,
      startY: 0,
      startPanelX: 0,
      startPanelY: 0
    });

    // Remove event listeners
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };

  const toggleMinimize = (panelId: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id === panelId) {
        return { ...panel, minimized: !panel.minimized, maximized: false };
      }
      return panel;
    }));
  };

  const toggleMaximize = (panelId: string) => {
    setPanels(prev => prev.map(panel => {
      if (panel.id === panelId) {
        return { ...panel, maximized: !panel.maximized, minimized: false };
      } else {
        // When maximizing one panel, ensure others are not maximized
        return panel.maximized ? { ...panel, maximized: false } : panel;
      }
    }));
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-gray-100">
      {panels.map(panel => {
        const PanelComponent = panel.component;
        
        // Skip rendering minimized panels
        if (panel.minimized) {
          return (
            <div 
              key={panel.id}
              className="absolute bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
              style={{ 
                width: 200,
                height: 40,
                left: panel.x,
                top: panel.y,
                zIndex: 10
              }}
            >
              <div 
                className="flex items-center justify-between p-2 bg-gray-100 cursor-move"
                onMouseDown={(e) => handleDragStart(e, panel.id)}
              >
                <span className="font-medium text-sm">{panel.title}</span>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => toggleMinimize(panel.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // Determine panel style based on maximized state
        const style = panel.maximized
          ? { 
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 20
            }
          : { 
              position: 'absolute',
              left: panel.x,
              top: panel.y,
              width: panel.width,
              height: panel.height,
              zIndex: 10
            };

        return (
          <div
            key={panel.id}
            id={`panel-${panel.componentName || panel.id}`}
            className="absolute bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
            style={style as React.CSSProperties}
          >
            <div 
              className="flex items-center justify-between p-2 bg-gray-100 cursor-move"
              onMouseDown={(e) => handleDragStart(e, panel.id)}
            >
              <span className="font-medium text-sm">{panel.title}</span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => toggleMinimize(panel.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Minimize2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => toggleMaximize(panel.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {panel.maximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
                <button className="p-1 hover:bg-gray-200 rounded">
                  <MoreVertical className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="w-full h-[calc(100%-32px)] overflow-auto">
              <PanelComponent />
            </div>
          </div>
        );
      })}

      {/* Minimized panel tray */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 p-1 flex space-x-2">
        {panels.filter(p => p.minimized).map(panel => (
          <button
            key={panel.id}
            onClick={() => toggleMinimize(panel.id)}
            className="px-3 py-1 bg-white rounded text-xs shadow hover:bg-gray-50"
          >
            {panel.title}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FallbackLayout;