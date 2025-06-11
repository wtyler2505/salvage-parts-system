import React, { useEffect, useRef, useState } from 'react';
import { GoldenLayout, LayoutConfig, ComponentContainer } from 'golden-layout';
import PartsManager from '../parts/PartsManager';
import EnhancedScene from '../enhanced/EnhancedScene';
import PerformanceOverlay from '../performance/PerformanceOverlay';
import PropertyPanel from '../panels/PropertyPanel';
import PartLibraryPanel from '../panels/PartLibraryPanel';

interface GoldenLayoutWrapperProps {
  config?: LayoutConfig;
  onLayoutChange?: (config: LayoutConfig) => void;
}

// Component registry for Golden Layout
const componentRegistry = {
  'PartsManager': PartsManager,
  'EnhancedScene': EnhancedScene,
  'PropertyPanel': PropertyPanel,
  'PartLibraryPanel': PartLibraryPanel,
  'PerformanceOverlay': PerformanceOverlay
};

const defaultConfig: LayoutConfig = {
  root: {
    type: 'row',
    content: [
      {
        type: 'stack',
        width: 25,
        content: [
          {
            type: 'component',
            componentType: 'PartLibraryPanel',
            title: 'Part Library',
            isClosable: false
          }
        ]
      },
      {
        type: 'column',
        width: 50,
        content: [
          {
            type: 'component',
            componentType: 'EnhancedScene',
            title: '3D Viewer',
            isClosable: false,
            height: 70
          },
          {
            type: 'component',
            componentType: 'PartsManager',
            title: 'Parts Manager',
            isClosable: false,
            height: 30
          }
        ]
      },
      {
        type: 'stack',
        width: 25,
        content: [
          {
            type: 'component',
            componentType: 'PropertyPanel',
            title: 'Properties',
            isClosable: false
          }
        ]
      }
    ]
  }
};

const GoldenLayoutWrapper: React.FC<GoldenLayoutWrapperProps> = ({
  config = defaultConfig,
  onLayoutChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<GoldenLayout | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      // Create Golden Layout instance
      const layout = new GoldenLayout(config, containerRef.current);

      // Register components
      Object.entries(componentRegistry).forEach(([name, Component]) => {
        layout.registerComponentFactoryFunction(name, (container: ComponentContainer) => {
          const element = document.createElement('div');
          element.style.width = '100%';
          element.style.height = '100%';
          container.element.appendChild(element);

          // Create React root and render component
          import('react-dom/client').then(({ createRoot }) => {
            const root = createRoot(element);
            root.render(React.createElement(Component));

            // Cleanup on container destroy
            container.on('destroy', () => {
              root.unmount();
            });
          });

          return {
            destroy: () => {
              // Cleanup handled in container destroy event
            }
          };
        });
      });

      // Handle layout changes
      layout.on('stateChanged', () => {
        if (onLayoutChange) {
          onLayoutChange(layout.saveLayout());
        }
      });

      // Initialize layout
      layout.init();
      layoutRef.current = layout;
      setIsInitialized(true);

    } catch (err) {
      console.error('Failed to initialize Golden Layout:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }

    return () => {
      if (layoutRef.current) {
        layoutRef.current.destroy();
        layoutRef.current = null;
      }
    };
  }, [config, onLayoutChange]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (layoutRef.current) {
        layoutRef.current.updateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Layout Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ minHeight: '400px' }}
    />
  );
};

export default GoldenLayoutWrapper;