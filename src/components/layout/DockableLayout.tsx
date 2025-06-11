import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Layout as LayoutIcon, Settings, Maximize2, Minimize2, X, MoreHorizontal } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { useLayoutStore } from '../../stores/useLayoutStore';
import GoldenLayoutWrapper from './GoldenLayoutWrapper';
import FallbackLayout from './FallbackLayout';

interface Panel {
  id: string;
  title: string;
  componentName: string;
  component: React.ComponentType<any>;
  description?: string;
  icon?: React.ComponentType<any>;
  closable?: boolean;
  resizable?: boolean;
  minWidth?: number;
  minHeight?: number;
}

interface DockableLayoutProps {
  panels: Panel[];
  defaultLayout?: any;
  componentMap?: Map<string, React.ComponentType<any>>;
  fallbackToCustomLayout?: boolean;
  onLayoutChange?: (layout: any) => void;
}

const DockableLayout: React.FC<DockableLayoutProps> = ({ 
  panels, 
  defaultLayout,
  componentMap,
  fallbackToCustomLayout = true,
  onLayoutChange
}) => {
  const {
    layout,
    theme,
    shortcuts,
    workspaces,
    currentWorkspace,
    updateLayout,
    setTheme,
    saveWorkspace,
    loadWorkspace,
    createPopoutWindow
  } = useLayoutStore();

  const [draggedPanel, setDraggedPanel] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<any[]>([]);
  const [resizing, setResizing] = useState<{ panelId: string; direction: string } | null>(null);
  const [useGoldenLayout, setUseGoldenLayout] = useState(true);
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const combo = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`;
      const action = shortcuts[combo];
      
      if (action) {
        e.preventDefault();
        executeShortcut(action);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  const executeShortcut = (action: string) => {
    switch (action) {
      case 'toggleTheme':
        setTheme(theme === 'dark' ? 'light' : 'dark');
        break;
      case 'saveWorkspace':
        saveWorkspace(currentWorkspace);
        break;
      case 'resetLayout':
        updateLayout(defaultLayout);
        break;
      // Add more shortcuts as needed
    }
  };

  const handlePanelDragStart = (panelId: string, e: React.DragEvent) => {
    setDraggedPanel(panelId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Generate drop zones
    const zones = generateDropZones();
    setDropZones(zones);
  };

  const handlePanelDragEnd = () => {
    setDraggedPanel(null);
    setDropZones([]);
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (draggedPanel) {
      const newLayout = updateLayoutForDrop(draggedPanel, zoneId);
      updateLayout(newLayout);
      saveWorkspace(currentWorkspace);
    }
  };

  const generateDropZones = () => {
    // Generate drop zones for docking
    return [
      { id: 'left', type: 'dock', position: 'left' },
      { id: 'right', type: 'dock', position: 'right' },
      { id: 'top', type: 'dock', position: 'top' },
      { id: 'bottom', type: 'dock', position: 'bottom' },
      { id: 'center', type: 'tab', position: 'center' }
    ];
  };

  const updateLayoutForDrop = (panelId: string, zoneId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (!panel) return layout;

    const componentName = panel.componentName;
    const newLayout = JSON.parse(JSON.stringify(layout));

    const removeComponent = (node: any) => {
      if (!node.content) return;
      node.content = node.content.filter((child: any) => {
        if (child.type === 'component' && child.componentName === componentName) {
          return false;
        }
        removeComponent(child);
        return !(child.content && child.content.length === 0);
      });
    };

    removeComponent(newLayout.root);

    const newComp = { type: 'component', componentName, title: panel.title };

    switch (zoneId) {
      case 'left':
        newLayout.root.content.unshift({ type: 'column', width: 20, content: [newComp] });
        break;
      case 'right':
        newLayout.root.content.push({ type: 'column', width: 20, content: [newComp] });
        break;
      case 'top':
        newLayout.root.content[0].content.unshift(newComp);
        break;
      case 'bottom':
        newLayout.root.content[0].content.push(newComp);
        break;
      default:
        if (newLayout.root.content[1] && newLayout.root.content[1].content[0]) {
          const stack = newLayout.root.content[1].content[0];
          if (!Array.isArray(stack.content)) stack.content = [stack.content];
          stack.content.push(newComp);
        }
        break;
    }

    return newLayout;
  };

  const handlePopout = (panelId: string) => {
    const panel = panels.find(p => p.id === panelId);
    if (panel) {
      createPopoutWindow(panel);
    }
  };

  const handleLayoutError = (error: string) => {
    console.error('Layout error:', error);
    setLayoutError(error);
    if (fallbackToCustomLayout) {
      setUseGoldenLayout(false);
    }
  };

  const PanelHeader: React.FC<{ panel: Panel; onPopout: () => void; onClose: () => void }> = ({
    panel,
    onPopout,
    onClose
  }) => (
    <div
      id={`panel-${panel.id}-header`}
      className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-move"
      draggable
      onDragStart={(e) => handlePanelDragStart(panel.id, e)}
      onDragEnd={handlePanelDragEnd}
    >
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <div className="flex items-center space-x-2">
            {panel.icon && <panel.icon className="w-4 h-4" />}
            <span className="text-sm font-medium">{panel.title}</span>
          </div>
        </Tooltip.Trigger>
        {panel.description && (
          <Tooltip.Content
            side="top"
            sideOffset={4}
            className="px-2 py-1 rounded text-xs bg-gray-700 text-white"
          >
            {panel.description}
            <Tooltip.Arrow className="fill-gray-700" />
          </Tooltip.Content>
        )}
      </Tooltip.Root>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={onPopout}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          title="Pop out to new window"
        >
          <Monitor className="w-3 h-3" />
        </button>
        
        {panel.closable && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Close panel"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        
        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
          <MoreHorizontal className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  const ResizeHandle: React.FC<{ direction: string; onResize: (direction: string) => void }> = ({ 
    direction, 
    onResize 
  }) => (
    <div
      className={`absolute ${
        direction === 'right' ? 'right-0 top-0 bottom-0 w-1 cursor-ew-resize' :
        direction === 'bottom' ? 'bottom-0 left-0 right-0 h-1 cursor-ns-resize' :
        'w-1 h-1'
      } bg-transparent hover:bg-blue-500 transition-colors`}
      onMouseDown={() => onResize(direction)}
    />
  );

  return (
    <Tooltip.Provider>
      <div className={`h-full w-full ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex items-center space-x-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-1 flex-1">
          {workspaces.map(workspace => (
            <button
              key={workspace.id}
              onClick={() => loadWorkspace(workspace.id)}
              className={`px-3 py-1 text-sm rounded ${
                currentWorkspace === workspace.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {workspace.name}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => saveWorkspace(`workspace_${Date.now()}`)}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 flex items-center space-x-1"
          >
            <LayoutIcon className="w-3 h-3" />
            <span>Save Layout</span>
          </button>
          
          {fallbackToCustomLayout && (
            <button
              onClick={() => setUseGoldenLayout(!useGoldenLayout)}
              className={`px-3 py-1 text-sm rounded flex items-center space-x-1 ${
                useGoldenLayout 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <LayoutIcon className="w-3 h-3" />
              <span>{useGoldenLayout ? 'Golden Layout' : 'Custom Layout'}</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative" ref={layoutRef}>
        {useGoldenLayout && !layoutError ? (
          <GoldenLayoutWrapper
            config={defaultLayout}
            componentMap={componentMap}
            onLayoutChange={(layout) => {
              updateLayout(layout);
              onLayoutChange?.(layout);
            }}
          />
        ) : (
          <FallbackLayout />
        )}

        {draggedPanel && dropZones.map(zone => (
          <div
            key={zone.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, zone.id)}
            className={`absolute border-2 border-dashed border-blue-500 opacity-75 pointer-events-none ${
              zone.position === 'left' ? 'inset-y-0 left-0 w-1/4' :
              zone.position === 'right' ? 'inset-y-0 right-0 w-1/4' :
              zone.position === 'top' ? 'inset-x-0 top-0 h-1/4' :
              zone.position === 'bottom' ? 'inset-x-0 bottom-0 h-1/4' :
              'inset-1/4'
            }`}
          />
        ))}
      </div>
      </div>
    </Tooltip.Provider>
  );
};

export default DockableLayout;